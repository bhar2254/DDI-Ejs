/*	involvement.js
	by Blaine Harper

	PURPOSE: router for involvement UI interactions
*/	

const express = require('express')
const router = express.Router()
require('dotenv').config()
const {isAuthenticated, needsAuthenticated, isAdmin} = require('./utils/auth')

/* GET philanthropy page. */
router.get('/philanthropy',
	isAuthenticated,
	function(req, res, next){
	res.render('pages/basicText', { 
		env: req.session.env, 
		isAuthenticated: req.oidc.isAuthenticated(),  
		activeUser: req.session.activeUser,
		title:'Philanthropy', page:{
		content: [
			{parallax: {rem:'15', url:'/res/stock/stage_amplifiers_01.jpg'}, hero : {title:'Philanthropy', content:`Below is a non-exhaustive list of the philanthropies that Phi Lamb supports. If you would like to know more, use the buttons provided to visit the oraganization's website.`}},
			{parallax: {rem:'17', url:'/res/plp/phil/food_bank.jfif'}, hero : {title:'Food Bank Of Northeast And Central Missouri', content:`The Food Bank serves over 100,000 people a month across 32 counties in central and northeast Missouri. It provides nutrition to food insecure with the support of donors and volunteers.<br><br><a href="https://sharefoodbringhope.org/" class="btn btn-primary">Learn More</a>`}},
			{parallax: {rem:'17', url:'/res/plp/phil/humane.jpg'}, hero : {title:'The Adair County Humane Society', content:`Our Mission at the Adair County Humane Society is to provide a nurturing and safe environment for the homeless, abandoned and neglected animals in the Adair County area while ultimately finding loving and nuturing homes for them all.<br><br><a href="https://www.adairhumanesociety.org/" class="btn btn-primary">Learn More</a>`}}
			]
	}})
})

module.exports = router