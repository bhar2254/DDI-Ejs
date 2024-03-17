/*	auth.js
	by Blaine Harper

	PURPOSE: MODULE Useful functions and variables used for user authentication

module.exports
    isAuthenticated
    needsAuthenticated
    isAdmin
*/

const {queryPromise, SQLTables} = require('./SQLUtils.js')
const minAdmin = 2

// Custom middleware for app authentication checks
const checkDBforUser= async (email) => {
    return false
}

const createUser = async (userData) => {
    console.log(userData)
    console.log(SQLTables)

    return userData
}

const buildActiveUser = async (req, next) => {
    if(!req.session.activeUser)
        req.session.activeUser = {}
	const userProfile = await queryPromise(`SELECT * FROM tblUsers WHERE txtEmail = "${req.oidc.user.email}";`)

    if(userProfile.length <= 0)
        req.session.activeUser = await createUser(req.oidc.user)

	req.session.activeUser = {
        ...req.session.activeUser,
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
    if(!req.session.activeUser || req.session.activeUser.intRole < minAdmin)
        return res.sendStatus(401)	
	return next()
}

module.exports = {
    minAdmin: minAdmin,
    isAuthenticated: isAuthenticated,
    needsAuthenticated: needsAuthenticated,
    isAdmin: isAdmin
}