/*	sql_connect.js

	For Indian Hills Community College
	Parking On Hills, https://parking.indianhils.edu
	by Blaine Harper

	PURPOSE: Script to setup connection with SQL DATABASE for API.

	SQL DATABASE configuration for server.js
	Make sure to leave the password value null 
	DONT SAVE THE DATABASE PASSWORD TO GITHUB
*/	

const mysql = require('mysql')

const con = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_DB
})

module.exports = con
