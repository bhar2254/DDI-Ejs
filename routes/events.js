/*
	For Indian Hills Community College
	Parking On Hills, https://parking.indianhils.edu
	by Blaine Harper

	PURPOSE: Root router for express server
*/	
const express = require('express')
const moment = require('moment')
const router = express.Router()
const { isAuthenticated } = require('./utils/auth')
const { queryPromise } = require('@bhar2254/mysql')
require('dotenv').config()

/* GET home page. */
router.get('/',
	isAuthenticated,
	async (req, res, next) => {
		const query_upcoming = `SELECT *, DATE_FORMAT(timestamp, '%Y-%m-%dT%H:%i') AS timestamp FROM events WHERE timestamp > CURRENT_TIMESTAMP ORDER BY timestamp ASC LIMIT 3`
		const query_recent = `SELECT *, DATE_FORMAT(timestamp, '%Y-%m-%dT%H:%i') AS timestamp FROM events WHERE timestamp < CURRENT_TIMESTAMP ORDER BY timestamp DESC LIMIT 5`
	
		const data_upcoming = await queryPromise(query_upcoming)
		const data_recent = await queryPromise(query_recent)
		subcontent = ``
		for(i=0; i < data_upcoming.length; i++){
			event_date = moment(data_upcoming[i].timestamp).format('Do MMM YYYY @ h:mm A')
			subcontent += `<div class="row py-3"><div class="col-lg-2 col-md-3 col-sm-12 my-auto">${event_date}</div><div class="col-lg-10 col-md-9 col-sm-12"><h1>${data_upcoming[i].title}</h1><div>${data_upcoming[i].description}</div></div></div><hr>`
		}

		content = [{
			parallax: {
				rem:'10', 
				url:'/res/app/photos/defaults/default_back.webp'
			}, 
			hero : {
				title:'Upcoming Events', 
				content:subcontent
			}
		}]
		
		subcontent = ``
		for(i=0; i < data_recent.length; i++){
			event_date = moment(data_recent[i].timestamp).format('Do MMM YYYY @ h:mm A')
			subcontent += `<div class="row py-3"><div class="col-lg-2 col-md-3 col-sm-12 my-auto">${event_date}</div><div class="col-lg-10 col-md-9 col-sm-12"><h1>${data_recent[i].title}</h1><div>${data_recent[i].description}</div></div></div><hr>`
		}

		content.push({
			parallax: {
				rem:'10', 
				url:'/res/app/photos/defaults/default_back.webp'
			}, 
			hero : {
				title:'Recent Events', 
				content:subcontent
			}
		})
		
		res.render('pages/basicText', { 
			env: req.env, 
			isAuthenticated: req.oidc.isAuthenticated(),  
			activeUser: req.activeUser,
			title:'Events', 
			page:{content: content}
		})
	}
)

module.exports = router