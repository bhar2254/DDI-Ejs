/*	auth.js
	by Blaine Harper

	PURPOSE: MODULE Useful functions and variables used for user authentication

module.exports
    isAuthenticated
    needsAuthenticated
    isAdmin
*/

const {queryPromise} = require('@bhar2254/mysql')
const minAdmin = 2

// Custom middleware for app authentication checks
const checkDBforUser= async (email) => {
    return false
}

const buildActiveUser = async (req, next) => {
    if(!req.activeUser)
        req.activeUser = {}
	const userProfile = await queryPromise(`SELECT * FROM users WHERE email = "${req.oidc.user.email}";`)
	req.activeUser = {
        ...req.activeUser,
		...req.oidc.user,
		loginMethod: req.oidc.user.sub.split("|")[0],
		externalId: req.oidc.user.sub.split("|")[1],
		...userProfile[0]
	}
    return next()
}

//	check auth state and build user object
const isAuthenticated = async (req, res, next) => {	
    if(req.oidc.isAuthenticated())
        return buildActiveUser(req, next)
    return next()
}

//	check auth state and build user object
const needsAuthenticated = async (req, res, next) => {	
    if (!req.oidc.isAuthenticated() || req.session.reauth)
        return res.redirect('/login') // redirect to sign-in route
    return buildActiveUser(req, next)
}

//	check auth state and redirect user if too low
const isAdmin = (req, res, next) => {
    if(!req.activeUser || req.activeUser.role < minAdmin)
        return res.sendStatus(401)	
	return next()
}

module.exports = {
    minAdmin: minAdmin,
    isAuthenticated: isAuthenticated,
    needsAuthenticated: needsAuthenticated,
    isAdmin: isAdmin
}