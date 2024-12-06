/*	app.js
	by Blaine Harper

	PURPOSE: router for official PLP website
*/


// npm install express ejs express-session express-openid-connect path cors morgan body-parser cookie-parser @bhar2254/string-utils @bhar2254/express-api-generator sharp axios mysql2 moment multer sqlite3 connect-sqlite3

const express = require('express')
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const { auth } = require('express-openid-connect')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const logger = require('morgan')
const { downloadImage } = require('./routes/utils/cacheImages')
const { debugLog } = require('./routes/utils/harper')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { SQLObject, getTablesFromDB } = require('@bhar2254/mysql')
const { Page } = require('./routes/utils/@bhar2254/bs-dom')

const { initializeAPI } = require('@bhar2254/express-api-generator')
const { loadStringPrototypes } = require('@bhar2254/string-utils')
// Load custom string methods
loadStringPrototypes()
const min_admin = 3

const uuidv4 = () => {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}

//	setting local env vars
const NODE_ENV = process.env.NODE_ENV || 'development'
require('dotenv').config({ path: `.env.${NODE_ENV}` })
const PORT = process.env.PORT || 3000

const { AUTH0_SECRET,
	AUTH0_BASE_URL,
	AUTH0_CLIENT_ID,
	AUTH0_ISSUER_BASE_URL
} = process.env

const config = {
	authRequired: false,
	auth0Logout: true,
	secret: AUTH0_SECRET || uuidv4(),
	baseURL: AUTH0_BASE_URL,
	clientID: AUTH0_CLIENT_ID,
	issuerBaseURL: AUTH0_ISSUER_BASE_URL,
}

// for the API setup
const sqlConfig = {
	type: 'mysql',  // Can switch between 'mysql' or 'sqlite'
	options: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DB,
	},
}

//	start app
var app = express()

//	using express-session middleware for persistent user session. Be sure to
//	familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
const dbPath = path.join(__dirname, 'sessions', `sessions.${NODE_ENV}.db`);

// Ensure the directory exists
const dirPath = path.dirname(dbPath);
if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath, { recursive: true }); // Create directory if it doesn't exist
}

// Check if the sessions.db file exists
if (!fs.existsSync(dbPath)) {
	// Create an empty SQLite database
	const db = new sqlite3.Database(dbPath, (err) => {
		if (err) {
			console.error(`Error creating sessions.${NODE_ENV}.db:`, err.message);
		} else {
			console.log(`sessions.${NODE_ENV}.db created successfully.`);
		}
	});

	db.close();
} else {
	console.log(`sessions.${NODE_ENV}.db already exists.`);
}

app.use(session({
	store: new SQLiteStore({ db: 'sessions.db', dir: './sessions' }),
	secret: AUTH0_SECRET || uuidv4(),
	resave: false,
	saveUninitialized: false, // Prevent unnecessary session storage
	cookie: {
		secure: false,
		maxAge: 3600000 // 1 hour
	}
}));

//	view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//	express environment setup
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors({
	origin: AUTH0_BASE_URL, // Replace with the actual origin of your app
	credentials: true
}));
app.use(auth(config))

app.use('/js', express.static(path.join(__dirname + 'node_modules')))
app.use(express.static(path.join(__dirname, 'node_modules')))

//	save location
const saveLoc = (req, res, next) => {
	req.env.loc = req.originalUrl
	return next()
}

const headerLinks = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css"/>
	<link rel="stylesheet" href="https://bhar2254.github.io/src/css/bs.add.css"/>
	<link href="https://cdn.datatables.net/v/bs5/jszip-3.10.1/dt-1.13.6/b-2.4.1/b-colvis-2.4.1/b-html5-2.4.1/cr-1.7.0/r-2.5.0/rr-1.4.1/sc-2.2.0/sb-1.5.0/sp-2.2.0/sl-1.7.0/datatables.min.css" rel="stylesheet">

	<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"></script>

	<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>`


const footer = `</main>
	<footer id="mainFooter" class="shadow-lg p-2 text-center bg-glass mx-auto sticky-footer">
		<span id="footerText">2024 © BlaineHarper.com</span>
	</footer>
	<button class='btn bg-plp-light rounded-circle' onclick="topFunction()" id="topButton" title="Go to top">Top</button>
	
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
	<script src="https://code.jquery.com/jquery-3.7.0.js" crossorigin="anonymous"></script>
	<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js" crossorigin="anonymous"></script>
	
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
	<script src="https://cdn.datatables.net/v/bs5/jszip-3.10.1/dt-1.13.6/b-2.4.1/b-colvis-2.4.1/b-html5-2.4.1/cr-1.7.0/r-2.5.0/rr-1.4.1/sc-2.2.0/sb-1.5.0/sp-2.2.0/sl-1.7.0/datatables.min.js"></script>

	<script src="https://kit.fontawesome.com/5496aaa581.js" crossorigin="anonymous"></script>
	<script src="/js/jQuery.dirty.js"></script>
	<script src="/js/formToggler.js"></script>
	<script src="/js/slider.js"></script>
	<!--<script src="https://bhar2254.github.io/src/js/dark-light.js"></script>--!>
	<script>
		// Get the button
		let buttonToTop = document.getElementById("topButton")

		// When the user scrolls down 20px from the top of the document, show the button
		window.onscroll = function(){scrollFunction()}

		function scrollFunction(){
			if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20){
				buttonToTop.style.display = "block"
			} else {
				buttonToTop.style.display = "none"
			}
		}

		// When the user clicks on the button, scroll to the top of the document
		function topFunction(){
			document.body.scrollTop = 0
			document.documentElement.scrollTop = 0
		}
	</script>
</body>
</html>`

//  check if user has logged in before
const checkForAccount = async (oidc) => {
	const userObj = {
		username: oidc.user.nickname,
		role: 1,
		...oidc.user
	}
	const user = new SQLObject({ table: 'users', key: 'email', id: userObj.email, datum: userObj })
	try {
		await user.readOrCreate(userObj)
	} catch (err) {
		console.error('Error read/creating user:', user);
	}
	// console.log(`THE USER LOGGING IN : `, JSON.stringify(user))
	
	const { key, id } = user
	const { picture = false, guid = false, email, name } = user.datum
	if (picture && guid){
		try {
			await downloadImage(picture, `./public/res/app/photos/profile`, guid);
		} catch (err) {
			console.error('Error downloading image:', err);
		}
	}
	debugLog(`Checked for account and found: ${email} (${name}) (${key}|${id})`)
	return user
}

app.use(async function (req, res, next) {
	if (typeof req.env === 'undefined') {
		const env = new SQLObject({ table: 'env', all: true })
		const data = await env.read()
		let envObj = {}
		data.forEach(x => {
			const { key = '', value = '', type = 'text' } = x
			envObj[key] = type === 'text' ? value : JSON.parse(value)
		})
		req.env = envObj
	}

	const pageDefaults = {
		header: {
			dark: true,
			append: `${headerLinks}
			<style>
			body {
				background-repeat: no-repeat;
				background-attachment: fixed;
	
				/* Full height */
				height: 100%;
	
				/* Center and scale the image nicely */
				background-position: center;
				background-repeat: no-repeat;
				background-size: cover;
	
				background-image: url('${process.env.AUTH0_BASE_URL}res/stock/stage_amplifiers_02.webp');
			}
			</style>`
		},
		siteTitle: process.env.SITE_TITLE,
		brand: process.env.BRAND,
		footer: footer
	}
	const tables = await getTablesFromDB()
	const devTables = tables.map(x => {
		const text = x.replace(/^view/, '').replaceUnderscoreWith().capitalizeWords()
		return { text, link: `/admin/view/${x}` }
	})
	const apiTables = tables.filter(x => x != 'api_keys').map(x => {
		const text = x.replace(/^view/, '').replaceUnderscoreWith().capitalizeWords()
		return { text, link: `/api/v1/${x}` }
	})

	const isAuth = req.oidc.isAuthenticated()
	pageDefaults.navbar = [{
		text: 'About',
		links: [{
			text: 'Developer',
			link: '/about/developer'
		}, {
			text: 'Other Projects',
			link: '/about/projects'
		}],
	}]
	if (isAuth) {
		if (!req.activeUser) {
			debugLog('USER object not CREATED, loading from DB or CREATING...')
			try {
				req.activeUser = await checkForAccount(req.oidc)
				// console.log(`activeUser: ${typeof req.activeUser}`, JSON.stringify(req.activeUser))
			} catch (err) {
				console.error('Error fetching user:', err);
			}
		}
		const { role } = req.activeUser.datum
		req.session.debug = process.env.NODE_ENV !== 'production'
		const isAdmin = req.activeUser.isAdmin = min_admin <= role
		if (isAdmin)
			pageDefaults.navbar.push({
				text: 'Admin',
				link: '/admin'
			}, {
				text: 'Dev Tables',
				links: devTables
			}, {
				text: 'API',
				links: apiTables
			},)

		pageDefaults.navbar = pageDefaults.navbar.concat([{
			text: req.activeUser.nickname || req.activeUser.name,
			links: [{
				text: 'Account',
				link: '/users/me'
			}]
		}])
	}
	if (!isAuth) {
		pageDefaults.navbar.push({
			text: 'Log In',
			link: '/login'
		})
	}
	req.session.pageDefaults = pageDefaults
	next()
})


//	Set an endpoint for the root directory
app.use(saveLoc)
app.use(`/`, require(`./routes/index`))
const routes = ['about', 'events', 'users', 'admin']
routes.forEach(x => {
	app.use(`/${x}`, require(`./routes/${x}`))
})

initializeAPI(app, {
	version: 'v1',
	apiKeys: {
		useAppDb: false,  // If true, use a separate application-only DB for API keys
		dbConfig: sqlConfig,
	},
	database: sqlConfig
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = NODE_ENV === 'development' ? err : {}

	// render the error page
	res.status(err.status || 500)
	return res.render('base/error')
})

// catch 404
app.use(function (req, res, next) {
	const page = new Page({
		...req.session.pageDefaults,
		pageTitle: '404 Not Found',
		body: '<div class="text-center py-3 my-5"><strong>404</strong> Page not found!</div>'
	})
	return res.render('pages/blank', { content: page.render() })
})

//	start the app listening on port from .env
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});

module.exports = app
