/*	index.js
	by Blaine Harper

	PURPOSE: router for index UI interactions
*/	


//	variables necessary for express
const { isAuthenticated, isAdmin } = require('../../utils/auth')
const { SQLTables, queryPromise } = require('../../utils/SQLUtils')
const express = require('express')
const SparkPost = require('sparkpost') 
const client = new SparkPost(process.env.SPARKPOST_SECRET)
const router = express.Router()
const dotenv = require('dotenv').config()

router.get('/status', 
	function(req, res, next){
		res.send({'status':200})
	}
)

router.get('/sendEmail',
	isAuthenticated,
	isAdmin,
	async function(req, res, next){
		client.transmissions.send({ 
			// subject: req.query.subject, 
			// html: req.query.message }, 
			// recipients: [ 
			// 	{address: req.query.toEmail} 
			content: { 
				from: 'developer@blaineharper.com', 
				subject: 'Hello from node-sparkpost', 
				html: '<p>Hello world</p>' }, 
				recipients: [ 
					{address: 'bhar2254@gmail.com'} 
				] 
			}).then(data => { 
				console.log('Woohoo! You just sent your first mailing!')
				console.log(data)
				res.send({status:201, title: 'Woohoo! You just sent your first mailing!', data:data})
			 }).catch(err => { 
				console.log('Whoops! Something went wrong') 
				console.log(err) 
				res.send({status:500, title: 'Whoops! Something went wrong', err:err})
			})
	}
)

module.exports = router
