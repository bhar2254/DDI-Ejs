/*	index.js
	by Blaine Harper

	PURPOSE: router for api index
*/	


const express = require('express')
const router = express.Router()
const {isAuthenticated, needsAuthenticated, isAdmin} = require('./utils/auth')
require('dotenv').config()

/* GET cover page. */
router.get('/', function(req, res, next){
	if(req.oidc.isAuthenticated())
		res.redirect('/home')
	res.render('base/mixins/cover', { env: req.session.env,
		title: `Welcome to ${req.session.env.title}!`, subtitle: req.session.env.tagline})
})

/* Redirect to login page. */
router.get('/login', function(req, res, next){
	if(req.oidc.isAuthenticated())
		res.redirect('/users/me')
	res.redirect('/users/me')
})

/* Redirect to login page. */
router.get('/clear', function(req, res, next){
	req.session.activeUser = {}
	if(!req.oidc.isAuthenticated())
		res.redirect('/home')
	res.redirect('/logout')
})

/* GET cover page. */
router.get('/home', 
	isAuthenticated,
	function(req, res, next){
	console.log(req.session.activeUser)
	res.render('pages/basicText', { 
		env: req.session.env, 
		isAuthenticated: req.oidc.isAuthenticated(),  
		activeUser: req.session.activeUser,
		title:'Home', page:{
		content: [
			{parallax: {rem:'26', url:'res/stock/stage_amplifiers_01.jpg'}, hero : {title: req.session.env.title, content: req.session.env.tagline}},
			{parallax: {rem:'30', url:'res/stock/stage_amplifiers_03.jpeg'}, hero : {title:'Our Mission', content:'We believe that quality instrument\'s should not be reserved to elite professionals or rich millionaires. Quality instruments should be available to anyone with the desire to practice or to play. We believe that crastment should share their experiences with the greater community and make building as accessible to the population as possible.'}},
			{parallax: {rem:'30', url:'res/stock/stage_amplifiers_02.webp'}, hero : {title:'Our History', content:'Guitars have always been in our family, and so we\'re born with a passion for music and craftsmenship. '}}
		]
	}})
})

/* GET gallery page. */
router.get('/gallery', function(req, res, next){
	res.render('pages/gallery', {
		env: req.session.env, 
		isAuthenticated: req.oidc.isAuthenticated(),  
		activeUser: req.session.activeUser,
		title: 'Gallery', subtitle:'Khajit has wares, if you have the coin.', cards:SAMPLE_CARDS }
	)
})

router.get('/status', function(req, res, next){
	res.send({'status':200})
})

module.exports = router
