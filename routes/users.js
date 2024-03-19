/*	users.js
	by Blaine Harper

	PURPOSE: router for user UI interactions
*/	

const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require("multer")
const upload = multer({ dest: './public/res/app/photos/temp' ,
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }})
const {queryPromise, SQLTables, SQLTable, SQLObject, sqlPatch} = require('./utils/SQLUtils.js')
const {isAuthenticated, needsAuthenticated, isAdmin} = require('./utils/auth.js')
const {axiosPatch, axiosPost} = require('./utils/axios.js')
const sharp = require('sharp')

const profileHeadspace = '10'
		
const resize = (path, format, width, height) => {
	const readStream = fs.createReadStream(path)
	let transform = sharp()

	if (format){
		transform = transform.toFormat(format)
	}

	if (width || height){
		transform = transform.resize(width, height)
		return readStream.pipe(transform)
	}

	if(width){
		transform = transform.resize(width, width)
		return readStream.pipe(transform)
	}
}

router.get('/me',
    needsAuthenticated, // check if user is authenticated
    async function (req, res, next){		
		displayEmploy = req.session.activeUser.txtJobTitle.length ? `Employment<br>
							<div class="text-muted">${req.session.activeUser.txtJobTitle} in ${req.session.activeUser.txtDepartment}<br>${req.session.activeUser.txtCompanyName}</div>` : `<div class="text-muted">No employment on file<br></div>`
		displayBio = req.session.activeUser.txtBio.length ? `Bio<br>
							<div class="text-muted">${req.session.activeUser.txtBio}<br></div>` : `<div class="text-muted">No bio on file<br></div>`
		displayStreet = req.session.activeUser.txtCity.length ? `Current Address<br>
							<div class="text-muted">${req.session.activeUser.txtStreetAddress}<br>${req.session.activeUser.txtCity}, ${req.session.activeUser.txtState} ${req.session.activeUser.txtPostalCode}</div>` : `<div class="text-muted">No address on file<br></div>`
							
		res.render('pages/basicText', { 
			env: req.session.env, 
			isAuthenticated: req.oidc.isAuthenticated(),  
			activeUser: req.session.activeUser,
			title: 'Profile',
			subtitle: 'My PLP information',
			page:{
				content:[{
					parallax:{
						rem:profileHeadspace,
						url:'/res/stock/stage_amplifiers_01.jpg'
					}, 
					hero: {
						title: `<div>${req.session.activeUser.txtDisplayName}</div>
							<div class="btn-group" role="group" aria-label="buttons">
								<a class="btn btn-secondary" href="/users/me/edit">Edit Profile</a>
							</div>`, 
						content: `</p>
							<div class="row justify-content-center">
								<div class="col-md-4 col-lg-3 col-sm-12" style="text-align:left!important;">Email
									<div class="text-muted">${req.session.activeUser.txtEmail.length == 0 ? 'No E-mail' : req.session.activeUser.txtEmail }</div>
									<div class="text-muted">${req.session.activeUser.txtPrincipalName}</div>
									<hr>Enrollment
									<div class="text-muted">Recruit ${req.session.activeUser.txtRecruitTerm} ${req.session.activeUser.intRecruitYear} - ${req.session.activeUser.intGradYear} ${req.session.activeUser.txtGradTerm} Graduate</div>
									<hr>In Directory
									<div class="text-muted">
										${req.session.env.inDirectory[req.session.activeUser.intInDirectory]}
									</div>
									<hr>Order
									<div class="text-muted">
										${req.session.env.orders[req.session.activeUser.intOrder]}
									</div>
									<hr>${displayBio}
									<hr>${displayStreet}
									<hr>${displayEmploy}
								</div>
								<div class="col-md-6 col-lg-6 col-sm-12">
									<h3 class="text-muted py-3">Finance Dashboard</h3>
									<canvas id="doughnutChart"></canvas>
									<script>
									//doughnut
										const ctxD = document.getElementById("doughnutChart").getContext('2d')
										const myLineChart = new Chart(ctxD, {
										type: 'doughnut',
										data: {
											labels: ["Past Due", "Paid", "Due Soon", "Invoiced", "Comped"],
											datasets: [{
											data: [50, 250, 0, 0, 0],
											backgroundColor: ["#F7464A", "#8ab28a", "#FDB45C", "#949FB1", "#4D5360"],
											hoverBackgroundColor: ["#FF5A5E", "#a2c3a2", "#FFC870", "#A8B3C5", "#616774"]
											}]
										},
										options: {
											legend: {
												display: false
												},
											responsive: true
										}
										})
									</script>
								</div>
								<div class="col-md-12 col-sm-12 col-lg-3">
									<img class="mx-auto my-3 d-block border border-secondary border-3 rounded shadow" src='/res/app/photos/profile/${req.session.activeUser.txtGUID}.png' style="max-height:15rem; max-width:10rem; object-fit:cover; object-position: 50% 0%;">
										<form method="post" id="profilePhoto" action="/users/photo/upload/" enctype="multipart/form-data">
											<input name="photoType" value="profile" style="display:none;"></input>
											<input name="photo" style="max-width:15rem;" accept=".jpg,.jpeg,.png" type="file" class="my-3">
											<br>
											<button id="savePhoto" form="profilePhoto" class="btn btn-success" href="#" type="submit">Save photo</button>
										</form>
									<br>
								</div>
							</div>
							`
					}
				}]
			}
		})
	}
)

router.get('/me/edit',
    needsAuthenticated, // check if user is authenticated
    function (req, res, next){		
		STATES = ''
		STATE_array = req.session.env.states
		for(i=0; i<STATE_array.length; i++){
			selected = ''
			if(req.session.activeUser.txtState == STATE_array[i]){selected='selected'}
			STATES += `<option value='${STATE_array[i]}' ${selected}>${STATE_array[i]}</option>`
		}	
		STATUS = ''
		STATUS_array = req.session.env.status
		for(i=0; i<STATUS_array.length; i++){
			selected = ''
			if(req.session.activeUser.txtStatus == STATUS_array[i]){selected='selected'}
			STATUS += `<option value='${STATUS_array[i]}' ${selected}>${STATUS_array[i]}</option>`
		}
		DIRECTORY = ''
		DIRECTORY_array = req.session.env.inDirectory
		for(i=0; i<DIRECTORY_array.length; i++){
			selected = ''
			if(req.session.activeUser.intInDirectory == i){selected='selected'}
			DIRECTORY += `<option value='${i}' ${selected}>${DIRECTORY_array[i]}</option>`
		}
		
		req.session.table = 'tblUsers'
		
		res.render('pages/basicText', { 
			env: req.session.env, 
			isAuthenticated: req.oidc.isAuthenticated(),  
			activeUser: req.session.activeUser,
			title: 'Profile',
			subtitle: 'My PLP information',
			page:{content:[
				{parallax:{rem:profileHeadspace,url:'/res/stock/stage_amplifiers_01.jpg'}, hero: {title: `<div>${req.session.activeUser.txtDisplayName}</div>
					<div class="btn-group" role="group" aria-label="buttons">
						<a class="btn btn-secondary" href="/users/me">Cancel</a>
						<button form="profile_edit" class="btn btn-success" href="#" type="submit">Save</button>
					</div>`, 
				content: `</p>
					<div class="row">
						<div class="col my-auto">
							<div class="row justify-content-center">
								<div class="col-sm-8 col-lg-3">
								<img class="mx-auto my-3 d-block border border-secondary border-3 rounded shadow" src='/res/app/photos/profile/${req.session.activeUser.txtGUID}.png' style="max-height:20rem; max-width:15rem; object-fit:cover; object-position: 50% 0%;">
								</div>
							<div class="mx-3 col-lg-6 col-sm-8" style="text-align:left!important;">
								<form class="plp-form" method="post" action="/users/me/edit" id="profile_edit">
									Preferred Name<br><span class="text-xsmall text-muted">Publicly visible only to brothers</span><br>
										<div class="lead"> 
											<input style="max-width:47.5%" name="txtGivenName" placeholder="Given Name" type="text" value="${req.session.activeUser.txtGivenName}" required></input>
											<input style="max-width:47.5%" name="txtSurname" placeholder="Surname" type="text" value="${req.session.activeUser.txtSurname}" required></input>
										</div>
									<br>Display Name
										<div class="lead"> 
											<input name="txtDisplayName" placeholder="Display Name" type="text" value="${req.session.activeUser.txtDisplayName}" required></input>
										</div>
									<br>Email
									<div class="text-muted">
										<div class="lead"> 
											<input style="width:100%;" name="txtEmail" placeholder="E-Mail" type="email" value="${req.session.activeUser.txtEmail}"></input>
										</div>
									</div>
									<br>In Directory
									<div class="row">
										<div class="col-lg-6 col-sm-12 text-muted">
											<select style="width:100%;" id="intInDirectory" name="intInDirectory" type="text">${DIRECTORY}</select>
										</div>
									</div>
									<br>Current Address<br><span class="text-xsmall text-muted">Private. Used for Alumni newsletter and outreach</span><br>
									<div class="lead">
										<input name="txtStreetAddress" placeholder="Address" type="text" value="${req.session.activeUser.txtStreetAddress}"></input>
										<br>
										<input name="txtCity" placeholder="City" type="text" value="${req.session.activeUser.txtCity}"></input>, <select id="txtState" name="txtState" type="text">${STATES}</select>
										<input name="txtPostalCode" placeholder="ZIP" type="number" value="${req.session.activeUser.txtPostalCode}"></input>
									</div>
									<br>Employment<br>
									<div class="text-muted">
										<input placeholder="Title" name="txtJobTitle" type="text" value="${req.session.activeUser.txtJobTitle}"></input> in <input name="txtDepartment" placeholder="Department" type="text" value="${req.session.activeUser.txtDepartment}" style="width:75%;"></input> at
										<br><input name="txtCompanyName" placeholder="Company" type="text" value="${req.session.activeUser.txtCompanyName}" style="width:100%;"></input>
										<input name="intId" type="number" value="${req.session.activeUser.intId}" style="display:none;"></input>
									</div>
									<br>Bio<br><span class="text-xsmall text-muted">Publicly visible if you were a chapter exec</span><br>
									<div class="lead">
										<textarea style="width:100%;" name="txtBio" placeholder="Biography" type="text" value="${req.session.activeUser.txtBio}">${req.session.activeUser.txtBio}</textarea>
										<br>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>`}}
			]}
		})
    }
)

router.post('/me/edit',
    needsAuthenticated, // check if user is authenticated
	sqlPatch,
    function (req, res, next){
		return res.redirect('/users/me')
    }
)

router.post('/photo/upload',
    needsAuthenticated, // check if user is authenticated
	upload.single('photo'), function (req, res){
		const tempPath = req.file.path
		let targetPath = path.join(__dirname, `../public/res/app/photos/profile/${req.session.activeUser.txtGUID}.png`)
		ws = fs.createWriteStream(targetPath)
		resize(tempPath,'png',500,500).pipe(ws)
		
		res.redirect('/users/me')
	}
)

router.post('/photo/upload/bulk',
    needsAuthenticated, // check if user is authenticated
	upload.fields([{name:'photo', maxCount: 10}]), function (req, res){
		tempPath = ''
		targetPath = ''
		
		console.log(req.files.photo)
		
		Object.keys(req.files.photo).forEach(elem => {
			tempPath = req.files.photo[elem].path
			targetPath = path.join(__dirname, `../public/res/app/photos/composite/${req.body.intChapter}/${req.body.year[elem]}/${req.session.activeUser.txtGUID}.png`)
			ws = fs.createWriteStream(targetPath)
			resize(tempPath,'png',500,500).pipe(ws)
		})
	}
)

module.exports = router;