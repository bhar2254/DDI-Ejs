/*	harper.js
	by Blaine Harper

	PURPOSE: General functions useful for random tasks

module exports 
//	General Functions
	debugLog: debugLog,
*/

const NODE_ENV = process.env.NODE_ENV || 'development'
require('dotenv').config({path: `.env.${NODE_ENV}`})

datetime_format = '%Y-%m-%dT%H:%i'
date_format = '%Y-%m-%d'
date_formats = {
	date: date_format,
	datetime: datetime_format,
}

const isUUID1 = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const isUUID4 = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
//	Colors for beautifying the console
const consoleColors = {
	//	Node colors for reference
		Reset: "\x1b[0m",
		Bright: "\x1b[1m",
		Dim: "\x1b[2m",
		Underscore: "\x1b[4m",
		Blink: "\x1b[5m",
		Reverse: "\x1b[7m",
		Hidden: "\x1b[8m",
	//	Forground
		FgBlack: "\x1b[30m",
		FgRed: "\x1b[31m",
		FgGreen: "\x1b[32m",
		FgYellow: "\x1b[33m",
		FgBlue: "\x1b[34m",
		FgMagenta: "\x1b[35m",
		FgCyan: "\x1b[36m",
		FgWhite: "\x1b[37m",
		FgGray: "\x1b[90m",
	//	Background
		BgBlack: "\x1b[40m",
		BgRed: "\x1b[41m",
		BgGreen: "\x1b[42m",
		BgYellow: "\x1b[43m",
		BgBlue: "\x1b[44m",
		BgMagenta: "\x1b[45m",
		BgCyan: "\x1b[46m",
		BgWhite: "\x1b[47m",
		BgGray: "\x1b[100m"
}
	
//	debugLog suppresses console output in prod
const debugLog = (msg, pid_color=consoleColors.Reset) => {
	if(process.env.NODE_ENV !== 'production'){console.log(`${pid_color}${process.pid}${consoleColors.Reset}: ${msg}`)}
}

const safeAssign = (valueFn, catchFn) => {
	try {
		return valueFn()
	} catch (e) {
		if (catchFn) catchFn(e)
		return null
	}
}

const clean_ = (string) => {
	const _string = String()
}

// 	Export functions for later use
module.exports={
//	General Functions
	isUUID1,
	isUUID4,
	datetime_format,
	date_format,
	date_formats,
	consoleColors,
	debugLog,
	safeAssign
}