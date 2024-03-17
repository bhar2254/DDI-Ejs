/*	shop.js
	by Blaine Harper

	PURPOSE: router for shop UI interactions
*/	

const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next){
	res.render('default', { title: 'Shop', subtitle: 'This page will be designated for seting up the shop page. If the site doesn\'t have to deal with money, then it can just be a GUI that allows users to add items to a cookies cart and then checkout submits the data to the DB. Consider using Paypal/Venmo connections to allow users to shop. Other shop plugins may also be available.',
        isAuthenticated: req.oidc.isAuthenticated() })
})

module.exports = router