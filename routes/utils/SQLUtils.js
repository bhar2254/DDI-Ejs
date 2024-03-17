/*	SQLUtils.js
	by Blaine Harper

	PURPOSE: Useful functions and variables used for building SQL queries throughout the application
*/

/*	Custom classes

#	SQL Queries
	-	SQLTable(table)
		>	Used for loading object properties via SQL
		>	Multi CRUD for dataTables
	-	SQLObject(id, table, options)
		>	Used for single object queries to a SQL database
		>	Single CRUD functions
	-	SQLObjectType(table)
		>	Used for other SQL classes for loading object types from SQL database

module exports 
	queryPromise: queryPromise,
	SQLTable: SQLTable,
	SQLTables: SQLTables,
	SQLObject: SQLObject
*/

const timezone_offset = - 360 * 60000

let SQLTables = {}

/*	Function for using async DB.query 	*/
function queryPromise(str){ 
	return new Promise((resolve, reject) => {
		DB.query(str, (err, result, fields) => {
			if (err) reject(err) 
			resolve(result)
		})
	})
}

//
//	SQL PATCH / POST FUNCTIONS
//

//	for converting from data (int) to human readable
//	these are the defaults.
//	in the future the SQLType class will be able to update and keep track of these.
//	loaded in this script manually, but later can be loaded by accessing sql database

/*	returns an array of table names from the MySQL database	*/
// 		viewTables still need to be accounted for
async function loadSQLTables(){
	SQLTablesResponse = await queryPromise(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${process.env.DB_DB}';`)

	let response = []
	for(const row in SQLTablesResponse)
		response.push(SQLTablesResponse[row].TABLE_NAME)

	return response
}

class SQLTable {
	constructor(sqlTable){
		this._table = sqlTable
		this._viewTable = "view" + sqlTable.charAt(0).toUpperCase() + sqlTable.substring(1,sqlTable.length)
		this._needsViewTable = false
		this._properties = {}
		this._labels = {}
		this.primaryKey = ''
	}
	async initialize(){		
		if(this._initialized)
			return true

		this._needsViewTable = Object.keys(SQLTables).includes(this._viewTable)
		let activeTable = this._needsViewTable ? this._viewTable : this._table

		let dbData = await queryPromise(`SELECT * FROM ${this._table} LIMIT 1`)

//		if there is a response from the db for this table
		if(!dbData.length)
			return this._initialized = false
		let data = dbData[0]

		this.primaryKey = Object.keys(data)[0]

		for (const key of Object.keys(data)){
			let propQuery = `SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${process.env.DB_DB}' AND TABLE_NAME = '${this._table}' AND COLUMN_NAME = '${key}';`
			let propQueryRes = await queryPromise(propQuery)

			if(ENV.forms[key])
				this._labels[key] = ENV.forms[key].label || 'No Label'
			this._properties[key] = propQueryRes[0].DATA_TYPE || 'undefined'
		}

		this._initialized = true
		return this._properties
	}
	get properties(){
		return this._properties
	}
	get labels(){
		return this._labels
	}
//	multi-write
	async create(args){

	}
//	load data for dataTables
	async read(conditions, limit, additional){
	//	load properties and other nice things along with dataTable
		if(!this._initialized)
			await this.initialize()

		let conditional = ''
		if(conditions)
			for(const key of Object.keys(conditions))
				for(const each in conditions[key])
					conditional += ` ${key} ${conditions[key][each]} `

	//	add time conversions to SQL query 
		let timeConversion = ''
		for (const key of Object.keys(this._properties)){
			if(this._properties[key] == 'date')
				timeConversion += `, DATE_FORMAT(${key}, '${date_format}') AS ${key}`
			if(this._properties[key] == 'datetime')
				timeConversion += `, DATE_FORMAT(${key}, '${datetime_format}') AS ${key}`
		}
		
		let activeTable = this._needsViewTable ? this._viewTable : this._table

	//	build tableQuery for dataTable selection
		let whereStmt = ` WHERE ${this.primaryKey} != 0 `
		if(activeTable == 'viewUsers')
			whereStmt = ` WHERE user_id != 0 `
		let tableQuery = `SELECT *${timeConversion} FROM ${activeTable}${whereStmt}${conditional}`
		tableQuery += limit ? ` LIMIT ${limit}` : ''
		tableQuery += ' ' + (additional || '')

		this.dataTable = await queryPromise(tableQuery)

		return this.dataTable
	}
//	multi-update
	async update(args, conditions){

	}
//	mass delete
	async delete(conditions){

	}
}

//	Single elements from SQL databases with CRUD functions
class SQLObject {
	getIDfromSecondary = async (id, key, table) => {
		response = await queryPromise(`SELECT * FROM ${table} WHERE ${key} = "${id}";`)
		return response[0]
	}
	constructor(id, table, options){
//		set type
		this.table = table
		this._read = false

//		set object local id
		this._id = this.id = id

//		set other options from args
		if(options){
			Object.keys(options).forEach(key => {
				this[key] = options[key]
				this['_'+key] = options[key]
			})
		}
	}
//	set the SQL table, checking the SQLObejctTypes to validate
	set table(table){
		if(!SQLTables[table])
			return console.log(`${consoleColors} No DB for ${this.table}`)
		return this._table = table
	}
//	return the store private _var
	get table(){
		return this._table
	}
	get isAdmin(){
		if(!this.role)
			return this._admin = false
		if(this.role <= 2)
			return this._admin = false
		return this._admin = true
	}
	get labels(){
		return this._labels
	}
	get properties(){
		return this._properties
	}
	async initialize(){
		this._tableMeta = SQLTables[this._table]
//		set needs view table local variable
		if(this._tableMeta._needsViewTable)
			this._viewTable = this._tableMeta._viewTable

		this._labels = this._tableMeta.labels
		this._properties = this._tableMeta.properties

//		set the idKeys used in sql DB
		this._primaryKey = SQLTables[this._table].primaryKey
		this[this._primaryKey] = this['_'+this._primaryKey]

		this._initialized = true
	}
//	Insert into SQL db and update this.id
//		If this.id = 0, it's a new object and will need updated
//		Create should return data.insertId from data = queryPromise(...)
	async create(args){
		if(!this._initialized)
			await this.initialize()

//		if args are set, build the object from them
//			checking table properties to ensure it's valid
		for(const key of Object.keys(SQLTables[this.table].properties))
			if(args[key] && !this[key])
				this[key] = args[key]

//		assume that the object has been built properly and send properties to SQL db
//			use every property that isn't prefixed with _
//			data = await queryPromise(...,{}) 
		let sqlQuery = `INSERT INTO ${this._table} (`
		let logRecord = 'CREATE ('
		let insertIndex = 0
		for(const elem of Object.keys(this)){
			let addToLog = elem.substring(0,6) != 'update' && elem.substring(0,6) != 'create'
			if(elem.substring(0,1) == '_' ||
				!Object.keys(SQLTables[this._table]._properties).includes(elem) ||
				!this[elem]
			)
				continue
			if(insertIndex){
				sqlQuery += ', '
				if(addToLog)
					logRecord += ', '
			}
			sqlQuery += `\`${elem}\``
			if(addToLog)
				logRecord += `${elem}:${this[elem]}`
			insertIndex++
		}
		insertIndex = 0
		sqlQuery += `) VALUES (`
		for(const elem of Object.keys(this)){
			if(elem.substring(0,1) == '_' ||
				!Object.keys(SQLTables[this._table]._properties).includes(elem) ||
				!this[elem]
			)
				continue
		
			if(insertIndex)
				sqlQuery += ', '
			sqlQuery += `"${this[elem]}"`
			insertIndex++
		}
		sqlQuery += ');'
		logRecord += ')'
		this._lastSQLQuery = sqlQuery
		let data = await queryPromise(sqlQuery)
		this.id = this.table != 'users' ? data.insertId : this.sso_id

		logRecord = `${data.insertId}: ${logRecord}`

		let logQuery=`INSERT INTO history (timestamp, saved_record, update_primary_id, update_table, update_user_id, update_displayName) VALUES ("${currentTime()}", "${logRecord}", "${this.id}","${this._table}", "${updateTime.update_user_id}","${updateTime.update_displayName}")`
		queryPromise(logQuery)
		
		return data
	}
//	Read from db and load object properties
	async read(){
		if(!this._initialized)
			await this.initialize()

//		data = await queryPromise(...,{}) 
//		if data.length = 0, this.create(args)
//			otherwise foreach data set properties from DB
		let table = this._viewTable || this.table

//		time conversions
//			for each datetime in SQL, add the datetime_format to query
		let timeConversion = ''
		console.log(this._tableMeta._properties)
		for (const key of Object.keys(this._tableMeta._properties)){
			if(this._tableMeta._properties[key] == 'date')
				timeConversion += `, DATE_FORMAT(${key}, '${date_format}') AS ${key}`
			if(this._tableMeta._properties[key] == 'datetime')
				timeConversion += `, DATE_FORMAT(${key}, '${datetime_format}') AS ${key}`
		}

		let sqlQuery = `SELECT *${timeConversion} FROM ${table} WHERE ${this._primaryKey} = "${this._id}";`
		
		let data = await queryPromise(sqlQuery)

		this._lastSQLQuery = sqlQuery

		if(!data.length)
			return 0
		
		let loadData = data[0]
		Object.keys(loadData).forEach(elem => {
//			initilizate the public vars if necessary
			this[elem] = this[elem] || loadData[elem]
//			populate the _private vars always
			this['_'+elem] = loadData[elem]
		})

		this._read = true
		return loadData		
	}
//	Filter user scopes and update object in DB
	async update(args){
		if(!this._initialized)
			await this.initialize()

//		First, read from the DB to check the current state of the object
//			this will *not* overwrite the currently set public vars
//			only the private vars used for update sync
		if(!this._read)
			await this.read()

		for(const key of Object.keys(SQLTables[this.table].properties)){
			let s=new String(this[key])
			if (s.indexOf('"') != -1)
				s=s.replace(/"/g, `\"`)
			if (s.indexOf("'") != -1)
				s=s.replace(/'/g, `\'`)
			if(key.substring(0,1) != '_')
				this[key]=s
		}

//		if args exists, update the object before updating DB 
//			filter values that don't match the properties in SQL
		if(args)
			for(const key of Object.keys(args))
				this[key] = args[key]

		this.update_time = currentTime()

//		Convert all current parameters without _ to db update query
//		data = await queryPromise(...,{}) 
		let sqlQuery = `UPDATE ${this._table} SET `
		let logRecord = `${this.id}: UPDATE (`
		let initialCounter = 0
		let logCounter = 0
		for(const elem of Object.keys(this)){
			const addToLog = !elem.includes('update') && !elem.includes('create')
			const skipUpdate = elem.substring(0,1) == '_' ||
				this[elem] == this[`_${elem}`] ||
				elem == this._primaryKey ||
				!Object.keys(SQLTables[this._table]._properties).includes(elem) ||
				this[elem] == 'null' ||
				this[elem] == null
 
			if(skipUpdate)
				continue
			
			sqlQuery += initialCounter > 0 ? ', ':''
			sqlQuery += `\`${elem}\` = "${this[elem]}"`
			if(addToLog){
				logRecord += logCounter > 0 ? ', ':''
				logRecord += `${elem}:${this[elem]}`
				logCounter++
			}
			initialCounter++
		}
		sqlQuery += ` WHERE ${this._primaryKey} = "${this._id}";`
		
		logRecord += ')'
		if(logCounter == 0)
			return this._updateCounter = logCounter

		if(logCounter > 0){
			this._lastSQLQuery = sqlQuery
			this._lastSQLResponse = await queryPromise(sqlQuery)

			let logQuery = `INSERT INTO history (timestamp, saved_record, update_primary_id, update_table, update_user_id, update_displayName) VALUES ("${currentTime()}", "${logRecord}", "${this.id}", "${this._table}", "${updateTime.update_user_id}","${updateTime.update_displayName}")`
			queryPromise(logQuery)

			this._updateCounter = logCounter
			return this._lastSQLResponse
		}
	}
//	Do delete the object from the database
	async destroy(){
		if(!this._initialized)
			await this.initialize()

//		data = await queryPromise(...,{}) 
		let sqlQuery = `DELETE FROM ${this._table} WHERE ${this._key} = "${this._id}";`
		let data = await queryPromise(sqlQuery)
		this._lastSQLQuery = sqlQuery
		console.log('you can can delete this object from memory ! goodbye')
		return 1
	}
//	scopes should be an object with properties that map props to permission values
//	returns this without properties undefined in scopes
//		or props that are set to 0 in scopes
	filterData(scopes, action, elevation){
		let data={}
		for(const key of Object.keys(scopes))
			if(scopes[key][action] <= elevation)
				data[key] = this[key]
		return data
	}
}

//	OLD FOR COMPATABILITY


/* General REST PATCH / SQL update. */
function sqlPatch(req, res, next){
	table = req.session.table
	data = req.body
	
	tableKey = {
		'tblUsers':'int',
		'tblSQLHistory':'intSQLHistory',
		'tblRoster':'intRoster',
		'tblPhil':'intPhil',
		'tblPayment':'intPayment',
		'tblLeaders':'intLeader',
		'tblHistory':'intHistory',
		'tblFAQ':'intFAQ',
		'tblEvents':'intEvent',
		'tblEnv':'intEnv',
		'tblChapter':'intChapter',
	}
	
	id_key = `${tableKey[table]}Id`

	pos = 0
	let id_value
	
	length = Object.keys(data).length

	// Start the query string
	let query = `UPDATE ${table} SET `
	
	// For loop to populate the query string based on the passed parameters in the request body
	for(let i=0; i < length; i++){
		let key = Object.keys(data)[i]
		
		s = Object.values(data)[i];
		if (s.indexOf('"') != -1){
			s = s.replace(/"/g, `\\"`)
		}
		value = s;
		
		if(value && key != id_key){
			if(pos > 0){query = query + ", ";}
			query = query + `${key}="${value}"`
			pos++;
		} 
		
		if (key === id_key){
			id_value = value;
		}
	}
	
	// Finish the query
	query = query + ` WHERE ${id_key} = ${id_value}`
	// Execute the query
	queryPromise(query)
	
	return next()
}

// 	Export functions for later use
module.exports={
	queryPromise: queryPromise,
//	SQL Update/Create
	SQLTable: SQLTable,
	SQLTables: SQLTables,
	SQLObject: SQLObject,
	sqlPatch: sqlPatch
}