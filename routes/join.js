/*	join.js
	by Blaine Harper

	PURPOSE: [ACHIVE] router for join UI interactions
*/	

const express = require('express')
const router = express.Router()
require('dotenv').config()
const {isAuthenticated, needsAuthenticated, isAdmin} = require('./utils/auth')

topGap = '15'

const datetime_format = '%Y-%m-%dT%H:%i'
const date_format = '%Y-%m-%d'

/* GET new_chapter page. */
router.get('/new_chapter', 
	isAuthenticated,
	function(req, res, next){
		res.render('pages/basicText', { 
			env: req.env, 
			isAuthenticated: req.oidc.isAuthenticated(),  
			activeUser: req.activeUser,
			title: 'Start a Chapter', subtitle:'', page: { content: [
				{parallax: {rem:topGap, url:'/res/stock/stage_amplifiers_02.webp'}, hero : {title:'Start a Chapter', content:'Phi Lambda Phi is always looking to expand and branch out to other campuses. If your campus is in need of strong brotherhood, scholardship, and leadership, reach out to us at:<br><a class="my-3" href="mailto:charter@philamb.info">charter@philamb.info</a>'}}
			]}
		})
	}
)

/* GET new_member page. */
router.get('/new_member',
	isAuthenticated,
	function(req, res, next){
		res.render('pages/basicText', { 
			env: req.env, 
			isAuthenticated: req.oidc.isAuthenticated(),  
			activeUser: req.activeUser,
			title: 'Become a Brother', 
			subtitle:'', 
			page: { content: [
				{parallax: {rem:topGap, url:'/res/stock/stage_amplifiers_02.webp'}, hero : {title:'Become a Brother', content:'Do you value scholastic achievement, building lasting relationships, and experiencing new leadership opportunities? Reach out to us at: <a class="my-3" href="mailto:recruitment@philamb.info">recruitment@philamb.info</a> or visit our social media to get connected with what\'s happening at<br>Phi Lamb!<div class="my-3"><a href="https://philamb.info/fb"><i class="fa-brands fa-facebook mx-2" style="font-size:xx-large;"></i><a href="https://philamb.info/insta"><i class="fa-brands fa-instagram mx-2" style="font-size:xx-large;"></i></div>'}}
			]}
		})
	}
)

module.exports = router