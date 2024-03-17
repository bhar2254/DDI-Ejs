/*	app.js
	by Blaine Harper

	PURPOSE: router for official PLP website
*/	

const fs = require('fs')
const createError = require('http-errors')
const express = require('express')
const session = require('express-session')
const path = require('path')
const cluster = require('cluster')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const favicon = require('serve-favicon')
const cors = require('cors')
const { auth } = require('express-openid-connect')
const { queryPromise } = require('./routes/utils/SQLUtils')
const dotenv = require('dotenv').config()

//	auth0 configuration
const config = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.AUTH0_CLIENT_SECRET,
	baseURL: 'https://devilsdive.net',
	clientID: process.env.AUTH0_CLIENT_ID,
	issuerBaseURL: process.env.AUTH0_BASE_URL
}

//	used for generating api arrays for routing
const previous_versions = fs.readdirSync(`./routes/api`, {withFileTypes: true})
		.filter(item => item.isDirectory())
		.map(item => item.name)

const app = express()

DEBUG = true

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')))
app.use(auth(config))

// CORS
app.use(cors({
    origin: '*'
}))

/**
 * Using express-session middleware for persistent user session. Be sure to
 * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
 */
app.use(session({
    secret: process.env.AUTH0_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
    }
}))

//	save location
const saveLoc = (req, res, next) => {
	req.session.env.loc = req.originalUrl
	return next()
}

const loadEnv = async (req, res, next) => {
	if(req.session.env){ next() } else {
		req.session.env = {
			loc: req.originalUrl
		}

		query = `SELECT * FROM tblEnv`
		response = await queryPromise(query)
		
		Object.keys(response).forEach(elem => {
			req.session.env[response[elem].txtKey] = (response[elem].txtType == 'obj' || response[elem].txtType == 'arr') ?
				JSON.parse(response[elem].txtValue) :
				response[elem].txtValue
		})
			
		return next()
	}
}

DB_HOST = process.env.DB_HOST,
DB_USER = process.env.DB_USER,
DB_PASS = process.env.DB_PASS,
DB_DB = process.env.DB_DB

DB = require('./bin/db/sql_connect')
DB.connect()

//	Set an endpoint for the root directory
app.use(loadEnv)
app.use(saveLoc)
app.use(`/`,require(`./routes/index`))
app.use(`/about`,require(`./routes/about`))
app.use(`/events`,require(`./routes/events`))
app.use(`/involvement`,require(`./routes/involvement`))
app.use(`/members`,require(`./routes/members`))
app.use(`/users`,require(`./routes/users`))
app.use(`/admin`,require(`./routes/admin`))

//	automatically set an anonymous endpoint for each api version
for(let i = 0; i <= previous_versions.length; i++){
	let version = previous_versions[i]
	app.get(`/api/${version}/`, (req, res) => {
		res.status(200).send({response:`Test successful for /${version}!`})
	})
}

//	add the routes to router
previous_versions.forEach((api_version) => {
	app.use(`/api/${api_version}`, require(`./routes/api/${api_version}/index`))
})

// catch 404 and forward to error handler
app.use(function(req, res, next){
	next(createError(404))
})

// error handler
app.use(function(err, req, res, next){
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	res.render('base/error')
})

// Failsafe App.js relaunch
if (cluster.isPrimary){
	cluster.fork()
	
	cluster.on('exit', () => {
		cluster.fork()
	})
} else {
	app.listen(process.env.PORT, () => {
		console.log(`App listening on port ${process.env.PORT}`)
	})
}

module.exports = app
