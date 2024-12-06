/*	sql.js
	EJS Starter Site, https://ejs-starter.blaineharper.com
	by Blaine Harper

	PURPOSE: Useful functions and variables used for building SQL queries throughout the application
*/

/*	Custom classes

#	SQL Queries
	-	SQLObject(id, table, options)
		>	Used for single object queries to a SQL database
		>	Single CRUD functions

module exports 
	queryPromise: queryPromise,
	SQLObject: SQLObject
*/

const NODE_ENV = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${NODE_ENV}`})

const { debugLog } = require('../harper')
const mysql = require('mysql2/promise')
const axios = require('axios')

async function createPool() {
	const pool = mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DB,
		waitForConnections: true,
		connectionLimit: 32,
		queueLimit: 0
	})

	return pool
}

const cacheFetch = async (ref, url) => {
	const cache = new SQLObject({table: 'cache', key: 'ref', datum: {ref}})
	const record = await cache.read()
	if( record == 0 || record.length == 0 || record.value == "{}" || record.value === "" ){
		debugLog(`fetching with axios from ${url}`)
		const { data } = await axios({ url, method: 'GET' })
		const string = JSON.stringify(data)
		value = string.replaceAll('\\n','').replaceAll('\\r','').replaceAll('\"','\\\"').trim()
		await cache.create({ datum: {ref, value} })
	}
	return { ...JSON.parse(String(cache.datum.value).replaceAll('\\\"','\"').trim()), guid: cache.datum.guid }
}

/*	Function for using async DB.query 	*/
const queryPromise = async (str) => {
	const pool = await createPool();

	const result = await pool.query(str);

	pool.end(); // Close the pool when done

	const [ rows ] = result

	return rows
}

const isViewTable = async (table) => {
	data = await queryPromise(`SELECT 
			table_name,
			table_type
		FROM 
			information_schema.tables
		WHERE 
			table_name = '${table}' AND
			table_schema = '${process.env.DB_DB}'`)
	for(const each of data)
		if(each.TABLE_NAME === table)
			return each.TABLE_TYPE == 'VIEW'
	return undefined
}

const loadBaseViewTables = async () => {
	data = await queryPromise(`SELECT 
			table_name,
			table_type
		FROM 
			information_schema.tables
		WHERE 
			table_schema = '${process.env.DB_DB}'
			AND table_type IN ('BASE TABLE', 'VIEW');`)
	return data.map(x => {return {name: x.TABLE_NAME, type: x.TABLE_TYPE}})
}

const loadColumnKeysFromDB = async (table) => {
	data = await queryPromise(`SELECT COLUMN_NAME
		FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA = '${process.env.DB_DB}'
			AND TABLE_NAME = '${table}'`)
	return data.map(x => x.COLUMN_NAME)
}

const loadEnumFromDB = async (table, column) => {
	data = await queryPromise(`SELECT COLUMN_TYPE
		FROM INFORMATION_SCHEMA.COLUMNS
		WHERE TABLE_SCHEMA = '${process.env.DB_DB}'
			AND TABLE_NAME = '${table}'
			AND COLUMN_NAME = '${column}';`)
	return data
}
const loadTablesFromDB = async () => {
	data = await queryPromise(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${process.env.DB_DB}';`)

	let response = []
	for(const row in data)
		response.push(data[row].TABLE_NAME)

	return response
}

const safeAssign = (valueFn, catchFn) => {
	try {
		return valueFn()
	} catch (e) {
		if (catchFn) catchFn(e)
		return null
	}
}

//
//	SQL PATCH / POST FUNCTIONS
//

//	for converting from data (int) to human readable
//	these are the defaults.
//	in the future the SQLType class will be able to update and keep track of these.
//	loaded in this script manually, but later can be loaded by accessing sql database

class SQLObject {
	constructor(args){
		const _args = {...args}
		this.table = _args.table || null
		this.data = _args.data || [{}]
		this.datum = _args.datum || {}
		this.key = _args.key || 'guid'
		if(_args.id)
			this.id = _args.id
		this.all = _args.all || false
	}
	set read(read){
		if(read)
			this._read = true
	}
	get read(){
		return this._read || false
	}
//	set the SQL table, checking the SQLObejctTypes to validate
	set table(table){
		return this._table = table
	}
	get table(){
		return this._table
	}
	set last(last){
		this._last = {
			query: last.query || 'No query recorded!',
			response: last.response || [{guid: '00000000-0000-0000-0000-000000000000', response: 'No data...'}]
		}
	}
	get last(){
		return this._last || {
			query: 'No query recorded!',
			response: [{guid: '00000000-0000-0000-0000-000000000000', response: 'No data...'}]
		}
	}
	set key(key){
		this._key = key
	}
	get key(){
		const { _key } = this
		return _key
	}
	set datum(datum) {
		this._datum = datum
	}
	get datum() {
		const { data = [] } = this
		return this._datum || data[0] || {}
	}
	set data(data) {
		// If the input is an array, do nothing (return null).
		if (Array.isArray(data)) {
			this.datum = data[0]
			return this._data = data
		}

		// Log the resulting _data (optional debugging step)
		debugLog(String(`sql.js failed to set data! data must be an array. did you mean datum?: ${JSON.stringify(data)}`).substring(0, 150));
	}
	get data(){
		// debugLog(String(`sql.js get data: ${JSON.stringify(this.datum)}`).substring(0,100))
		return this._data || this._datum ? [this._datum] : []
	}
	set id(id){
		this._id = id		
		debugLog(String(`sql.js set id: ${JSON.stringify(this._id)}`).substring(0,100))
	}
	get id(){
		const { key, data, _id } = this
		// debugLog(String(`sql.js get id: ${JSON.stringify(this.datum)}`).substring(0,100))
		return data[0] ? data[0][key] || _id : null
	}
	set labels(labels){
		this._labels = labels || []
	}
	get labels(){
		return this._labels
	}
	set properties(properties) {
		this._properties = properties
	}
	get properties(){
		return this._properties
	}
	set initialized(initialized) {
		this._initialized = initialized
	}
	get initialized(){
		return this._initialized || false
	}
	async initialize(){
		if(this.initialized)
			return this.properties

		const { table } = this
		const query = `SELECT DATA_TYPE, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${process.env.DB_DB}' AND TABLE_NAME = '${table}';`
		const response = await queryPromise(query)

		const properties = {}
		for(const each of response){
			const key = each.COLUMN_NAME
			properties[key] = safeAssign(() => each.DATA_TYPE) || 'undefined'
		}
		this.initialized = true
		return this.properties = properties
	}
//	Insert into SQL db and update this.id
//		If this.id = 0, it's a new object and will need updated
//		Create should return data.insertId from data = queryPromise(...)
	async create(args){
		debugLog(`SQLObject.create() start: ${JSON.stringify(this.datum)}`.substring(0,100))
		const _args = { ...args }
		if(!this.initialized)
			await this.initialize()

		const elements = []
		const { datum, properties, table } = this

//		if args are set, build the object from them
//			checking table properties to ensure it's valid
		const create = {}
		for(const key of Object.keys(properties))
			if(_args.datum && _args.datum[key])
				create[key] = _args.datum[key]
		this.datum = create

//		assume that the object has been built properly and send properties to SQL db
//			use every property that isn't prefixed with _
//			data = await queryPromise(...,{}) 
		debugLog(`Attempting to create a new oject in ${table} (${Object.keys(properties).join(',')})! ${JSON.stringify(datum)}`.substring(0,100))
		Object.keys(datum).forEach(elem => {
			const skip = elem.substring(0, 1) == '_' ||
				!Object.keys(properties).includes(elem) ||
				!datum[elem]
			if(!skip) {
				elements.push(elem)
			}
		})
		if(!elements.length){
			debugLog(`SQLObject.create() failure!!: no elements to create ${JSON.stringify(datum)}`.substring(0,100))
			return 0
		}
		const query = `INSERT INTO ${table} (\`${elements.join('\`,\`')}\`) VALUES ("${elements.map(x => datum[x]).join('","')}");` 
		try {
			const response = await queryPromise(query)
			this.key = 'id'
			this.id = response.insertId
			this.last = {
				query: query,
				response: response,
			}
			debugLog(`SQLObject.create() success!: ${String(JSON.stringify(response)).substring(0,100)} ${String(JSON.stringify(query)).substring(0,100)}`)
			return response
		} catch {
			debugLog(`SQLObject.create() failure!!: ${query}`.substring(0,100))
			return undefined
		}
	}
//	Read from db and load object properties
	async read(args){
		if(!this._initialized)
			await this.initialize()
		
//		data = await queryPromise(...,{}) 
//		if data.length = 0, this.create(args)
//			otherwise foreach data set properties from DB
		const { table, properties, id, key, all = false } = this

		const _args = {...args}
		const { limit = false, offset = false, orderBy = '', groupBy = ''} = _args

//		time conversions
//			for each datetime in SQL, add the datetime_format to query
		let timeConversion = ''
		for (const each of Object.keys(properties)) {
			if(properties[each] == 'date')
				timeConversion += `, DATE_FORMAT(${each}, '${date_format}') AS ${each}`
			if(properties[each] == 'datetime')
				timeConversion += `, DATE_FORMAT(${each}, '${datetime_format}') AS ${each}`
		}
		const where = all ? `` : ` WHERE ${key} = "${id}" `
		const query = `SELECT *${timeConversion} FROM ${table}${where}${orderBy ? ` ORDER BY ${orderBy} `:``}${groupBy ? ` GROUP BY ${groupBy} `:``}${offset ? ` OFFSET ${offset} `:``}${limit ? ` LIMIT ${limit} `:``};`
		
		const data = await queryPromise(query)
		if(!data.length) {
			debugLog(`Query returned no results! (${key}, ${id}) q:${query} | d:${data}`.substring(0,100))
			this.last = {
				query: query,
				response: data,
			}
			return 0
		}
		
		this.data = data
		this.last =  {
			query: query,
			response: data,
		}
		debugLog(`SQLObject.read(): ${query}`.substring(0,100))
		this._read = true
		return data
	}
//	Filter player scopes and update object in DB
	async update(datum){
		if(!this._initialized)
			await this.initialize()

//		First, read from the DB to check the current state of the object
//			this will *not* overwrite the currently set public vars
//			only the private vars used for update sync
		if(!this._read)
			await this.read()

//		if args exists, update the object before updating DB 
//			filter values that don't match the properties in SQL
		if(!datum){
			debugLog('Data required to update object. Remember to set data in the update(args: {data}) params and not the constructor!')
			return 0
		}

		const update = {}
		for(const key of Object.keys(datum))
			if(datum[key])
				update[key] = datum[key]

//		Convert all current parameters without _ to db update query
//		datum = await queryPromise(...,{}) 

		const { table, properties, id, key } = this
		const setValues = Object.keys(datum).filter((x) => (!x.includes('update') && 
			!x.includes('create') && 
			datum[x] != 'undefined' && 
			datum[x] != 'null' && 
			datum[x] != null && 
			x.substring(0,1) != '_' && 
			datum[x] != datum[`_${x}`] && 
			x != 'guid' && 
			x != 'id' && 
			datum[x] != this.datum[x] && 
			Object.keys(properties).includes(x)
		)).map(x => `\`${x}\` = "${String(datum[x]).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\0/g, '\\0')}"`)

		if(setValues.length == 0){
			debugLog(`SQLObject.update(): no values set! ${JSON.stringify(datum)}`.substring(0,100))
			return 0
		}

		const whereStmt = typeof this.all === 'undefined' || !this.all ? `WHERE ${key} = "${id}"` : ''
		const query = `UPDATE ${table} SET ${setValues.join(', ')} ${whereStmt};`
	
		this._last = {
			query: query,
			response: await queryPromise(query)
		}
		this.data = [update]

		debugLog(`SQLObject.update(): ${query}`.substring(0,100))
		return this._last.response
	}
//	Do delete the object from the database
	async destroy(){
		if(!this._initialized)
			await this.initialize()

//		data = await queryPromise(...,{}) 
		const { table, id } = this
		const query = `DELETE FROM ${table} WHERE guid = "${id}";`
		const repsonse = await queryPromise(query)

		this._last = {
			query: query,
			response: repsonse,
		}
		debugLog('you can can delete this object from memory ! goodbye')
		return 1
	}
//	Read from db and load object properties
	async readOrCreate(data){
		let response = await this.read() 
		if(!response) {
			await this.create(data)
			response = await this.read() 
		}
		return response
	}
}

// 	Export functions for later use
module.exports={
	queryPromise,
	cacheFetch,
	isViewTable,
	loadBaseViewTables,
	loadColumnKeysFromDB,
	loadEnumFromDB,
	loadTablesFromDB,
	SQLObject,
}