/*	users.js
	by Blaine Harper

	PURPOSE: router for user UI interactions
*/

const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require("multer")
const upload = multer({
	dest: './public/res/app/photos/temp',
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
})
const { queryPromise, SQLObject } = require('@bhar2254/mysql')
const { requiresAuth } = require('express-openid-connect')
const sharp = require('sharp')

const authenticationMethods = {
	'google-oauth2': 'Google',
	'github': 'GitHub',
	'auth0': 'Auth0',
}

const profileHeadspace = '10'

const generateProfileCard = (profileData, rosterData) => {
	const roster = []
	for (i = 0; i < rosterData.length; i++)
		roster.push(`<tr><td>${rosterData[i].year || 'NA'}-${rosterData[i].year ? rosterData[i].year + 1 : 'NA'}</td><td>${rosterData[i].title || ''}</td></tr>`)

	const _profileData = {
		...profileData,
		guid: profileData.guid || String(),
		editable: profileData.editable || true,
		higher_role: profileData.higher_role || false ? 'editable' : String(),
		editable_on_admin: profileData.editable_on_admin || false ? 'editable' : String(),
		picture: profileData.picture || String(),
		name: profileData.name || String(),
		nickname: profileData.nickname || String(),
		title: profileData.title || String(),
		email: profileData.email || String(),
		email_verified: profileData.email_verified || false,
		exp: profileData.exp || 0,
		id: profileData.id || 0,
		recruit_term: profileData.recruit_term || '',
		recruit_year: profileData.recruit_year || 'NA',
		grad_term: profileData.grad_term || '',
		grad_year: profileData.grad_year || 'NA',
		sub: profileData.sub ?
			authenticationMethods[String(profileData.sub).split('|')[0]] || profileData.sub :
			String(),
		role: profileData.role || 'Default'
	}

	const displayEmploy = _profileData.job_title || _profileData.department || _profileData.company_name ? `
		Employment <br>
		<div class="text-muted">
			<span id="job_title" placeholder="Job Title" class="editable">${_profileData.job_title || ''}</span> 
			${_profileData.job_title && _profileData.department ? ' in ' : ''}
			<span id="department" placeholder="Department" class="editable">${_profileData.department || ''}</span>
			<span id="company_name" placeholder="Company Name" class="editable">${_profileData.company_name || ''}</span>
		</div>` :
		`<div class="text-muted">
			No employment on file
			<br>
			<div id="job_title" placeholder="Job Title" class="editable"></div>
			<div id="department" placeholder="Department" class="editable"></div>
			<div id="company_name" placeholder="Company Name" class="editable"></div>
		</div>`
	const displayBio = _profileData.bio ? `
		Bio <br>
		<div class="text-muted">
			<span id="bio" class="editable" type="textbox">${_profileData.bio}</span><br>
		</div>` : `
		<div class="text-muted">
			No bio on file<br>
		<span id="bio" class="editable" type="textbox"></span>
		</div>`
	const displayStreet = _profileData.city ? `
		Current Address<br>
			<div class="text-muted">
				<span id="street_address" placeholder="Street Address" class="editable">${_profileData.street_address || ''}</span> 
				<br>
				<span id="city" placeholder="City" class="editable">${_profileData.city || ''}</span> 
				, 
				<span id="state" placeholder="State" class="editable">${_profileData.state || ''}</span> 
				<span id="postal_code" placeholder="Postal Code" class="editable">${_profileData.postal_code || ''}</span> 
			</div>` : `
			<div class="text-muted">No address on file<br>
				<span id="street_address" placeholder="Street Address" class="editable"></span> 
				<span id="city" placeholder="City" class="editable"></span> 
				<span id="state" placeholder="State" class="editable"></span> 
				<span id="postal_code" placeholder="Postal Code" class="editable"></span> 
			</div>`
	const terms = {
		SP: 'SP',
		FA: 'FA',
		WI:	'WI',
		SU:	'SU'
	}
	const term_options = `data-type="select" data-tag="select" data-options='${JSON.stringify(terms)}'`
	return `<div class="row d-flex justify-content-center align-items-center">
				<div class="my-auto col-md-4 col-lg-3 col-sm-12" style="text-align:left!important;">
					<form method="post" action="/update/users/${_profileData.guid}">
						Name
						<div class="text-muted"><span class="editable" id="name">${_profileData.name}</span></div>
						Nickname
						<div class="text-muted"><span class="editable" id="nickname">${_profileData.nickname}</span></div>
						Email
						<div class="text-muted">${_profileData.email.length ? _profileData.email : 'No E-mail'}</div>
						<hr>Enrollment
						<div class="text-muted">
							<span class="editable" id="recruit_term" ${term_options}>${_profileData.recruit_term}</span>
							<span class="editable" id="recruit_year" data-type="number">${_profileData.recruit_year}</span>
							-
							<span class="editable" id="grad_year" data-type="number">${_profileData.grad_year}</span>
							<span class="editable" id="grad_term" ${term_options}>${_profileData.grad_term}</span>
						</div>
						<hr>${displayBio}
						<hr>${displayStreet}
						<hr>${displayEmploy}
						<div class="row mx-auto p-3">
							<button type="button" onclick="toggleForm()" class="editable-toggler btn btn-primary">Edit</button>
							<div class="btn-group">
								<button type="button" onclick="cancelForm()" class="editable-toggler btn btn-secondary" style="display:none;">Cancel</button>
								<button type="submit" class="editable-toggler btn btn-primary" style="display:none;">Save</button>
							</div>
						</div>
					</form>
				</div>
				<div class="my-auto col-md-6 col-lg-6 col-sm-12">
					<h3 class="text-muted py-3">Enrollment</h3>
					<table id="rosterTable" class="my-3 table table-striped table-hover">
						<thead>
							<th class="px-3"><h5>Year</h5></th>
							<th class="px-3"><h5>Exec. Position <small class="text-muted" style="font-size:.85rem;">(blank if NA)</h5></th>
						</thead>
						<tbody class="text-muted">
							<form method="post" id="compositePhoto" action="/users/photo/upload/bulk" enctype="multipart/form-data">
								<input  id="photoType" name="photoType" value="composite" style="display:none;"></input>
								<input  id="chapter_id" name="chapter_id" value="${_profileData.chapter_id}" style="display:none;"></input>
								${roster.join('')}
							</form>
						</tbody>
					</table>
					<h3 class="text-muted py-3">Finance Dashboard <strong>(WIP)</strong></h3>
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
					<img class="mx-auto my-3 d-block border border-secondary border-3 rounded shadow" src='/res/default_profile/app/photos/profile/${_profileData.guid}.webp' style="max-height:15rem; max-width:10rem; object-fit:cover; object-position: 50% 0%;">
						<form method="post" id="profilePhoto" action="/users/photo/upload/" enctype="multipart/form-data">
							<input name="photoType" value="profile" style="display:none;"></input>
							<input name="photo" style="max-width:15rem;" accept=".jpg,.jpeg,.png,.webp" type="file" class="my-3">
							<br>
							<button id="savePhoto" form="profilePhoto" class="btn btn-success" href="#" type="submit">Save photo</button>
						</form>
					<br>
				</div>
			</div>
		</div>
	</div>
</form>
</div>
</div>`
}

const resize = (path, format, width, height) => {
	const readStream = fs.createReadStream(path)
	let transform = sharp()

	if (format) {
		transform = transform.toFormat(format)
	}

	if (width || height) {
		transform = transform.resize(width, height)
		return readStream.pipe(transform)
	}

	if (width) {
		transform = transform.resize(width, width)
		return readStream.pipe(transform)
	}
}

router.get('/me',
	requiresAuth(), // check if user is authenticated
	async function (req, res, next) {
		const [activeUser] = await req.activeUser.read()
		const rosterObject = new SQLObject({table: 'viewroster', key: 'user_id', id: activeUser.id})
		const roster = await rosterObject.read({orderBy: 'year DESC'})
		req.session.returnURI = '/users/me'
		req.session.roster = roster || [{}]
		activeUser.editable = true

		res.render('pages/basicText', {
			env: req.env,
			isAuthenticated: req.oidc.isAuthenticated(),
			activeUser,
			title: 'Profile',
			subtitle: 'My PLP information',
			page: {
				content: [{
					parallax: {
						rem: profileHeadspace,
						url: '/res/app/photos/defaults/default_back.webp'
					},
					hero: {
						title: `<div>${activeUser.nickname || 'My Profile'}</div>
							<div class="btn-group" role="group" aria-label="buttons">
								<a class="btn btn-secondary" href="/users/me/roster/edit">Edit Roster</a>
							</div>`,
						content: `</p>${generateProfileCard(activeUser, roster )}`
					}
				}]
			}
		})
	}
)

router.get('/me/roster/edit',
	requiresAuth(), // check if user is authenticated
	async (req, res, next) => {
		profile = req.activeUser.datum
		req.session.table = 'users'

		currentYear = new Date().getFullYear()
		function getRosterYears(activeYear) {
			foundingYear = 1969
			yearSpan = 1 + currentYear - 1969
			yearsArray = Array.from({ length: yearSpan }, (_, i) => currentYear - i)
			const rosterYears = []

			for (i = 0; i < yearsArray.length; i++) {
				selected = ''
				if (activeYear == yearsArray[i]) { selected = 'selected' }
				rosterYears.push(`<option value='${yearsArray[i]}' ${selected}>${yearsArray[i]}-${yearsArray[i] + 1}</option>`)
			}
			return rosterYears.join('')
		}

		req.session.table = 'users'

		const chapterQuery = `SELECT id,name FROM chapters`
		const chapters = await queryPromise(chapterQuery)

		const chapter = {}
		for (i = 0; i < chapters.length; i++) {
			chapter[chapters[i].id] = chapters[i].name;
		}

		function getRosterChapters(activeChapter) {
			const _chapterSelectOptions = []
			Object.keys(chapter).forEach(elem => {
				if (chapter[elem] != 'Alumni') {
					selected = ''
					if (activeChapter == elem) { selected = ' selected' }
					_chapterSelectOptions.push(`<option value='${elem}'${selected}>${chapter[elem]}</option>`)
				}
			})
			return _chapterSelectOptions.join('')
		}


		const rosterObject = new SQLObject({table: 'viewroster', key: 'user_id', id: profile.id})
		const roster = await rosterObject.read({orderBy: 'year DESC'})
		
		rosterTable = ''

		const chapterSelectOptions = []
		Object.keys(chapter).forEach(elem => {
			if (chapter[elem] != 'Alumni') {
				selected = ''
				if (profile.chapter_id == elem) { selected = ' selected' }
				chapterSelectOptions.push(`<option value='${elem}'${selected}>${chapter[elem]}</option>`)
			}
		})

		if(roster)
			for (j = 0; j < roster.length; j++) {
				rosterTitle = roster[j].title
				rosterTable += `
					<tr id='rosterTableRow${j}'>
						<td>
							<select name='rosterYear${j}' class='year my-1'>
								${getRosterYears(roster[j].year)}
							</select>
						</td>
						<td>
							<select name='rosterChapter${j}' class='chapter_id my-1'>
								${getRosterChapters(roster[j].chapter_id)}
							</select>
						</td>
						<td>
							<input name='rosterPosition${j}' class='my-1' type='text' value='${roster[j].title}'></input>
						</td>
						<td>
							<button onclick="removeRow(${j})" class='btn' type='button' id='rosterTableRemoveRow'>
								<i class='fa-solid fa-trash-can'></i>
							</button>
						</td>
					</tr>`;
			}

		res.render('pages/basicText', {
			env: req.env,
			isAuthenticated: req.oidc.isAuthenticated(),
			activeUser: req.activeUser,
			title: 'Profile',
			subtitle: 'My PLP information',
			isAuthenticated: req.oidc.isAuthenticated(),
			page: {
				content: [
					{
						parallax: { rem: profileHeadspace, url: '/res/app/photos/defaults/default_back.webp' }, hero: {
							title: `<div>${req.activeUser.datum.nickname}</div>
					<div class="btn-group" role="group" aria-label="buttons">
						<a class="btn btn-secondary" href="/users/me">Cancel</a>
						<button form="rosterEditForm" class="btn btn-success" type="submit">Save</button>
					</div>`,
							content: `</p>
				<div class="container-fluid">
					<div class="row">
						<div class="col">
							<form id="rosterEditForm" method="post" action="/users/me/roster/edit" class="plp-form">
								<br>
								<div class="row">
									<div class="col my-auto">Chapter <select name="chapter_id">${chapterSelectOptions.join('')}</select></div>
									<div class="col my-auto"><h3 class="text-muted py-3">Enrollment</h1></div>
									<div class="col my-auto">
										<div class="btn-group" role="group" aria-label="buttons">
											<button type="button" onclick="addRow()" class="btn btn-secondary">Add Row</button>
										</div>
									</div>
								</div>
								<br>
								<div class="my-3 container-fluid" style="overflow: auto;">
									<table id="rosterTable" class="table table-striped table-hover">
										<thead>
											<tr>
												<th class="px-3 col"><h5>Year</h5></th>
												<th class="px-3 col"><h5>Chapter</h5></th>
												<th class="px-3 col"><h5>Exec. Title <small class="text-muted" style="font-size:.85rem;">(blank if NA)</h5></th>
												<th class="px-3 col"><h5>Remove</h5></th>
											</tr>
										</thead>
										<tbody id="rosterTableBody" class="text-muted">
											${rosterTable}
										</tbody>
									</table>
								</div>
							</form>
						</div>
					</div>
				</div>
				<script>
					let row_count = 0
					const currentYear = new Date().getFullYear()
					function getRosterYears(activeYear) {
						foundingYear = 1969
						yearSpan = 1 + currentYear - 1969
						yearsArray = Array.from({ length: yearSpan }, (_, i) => currentYear - i)
						const rosterYears = []

						for (i = 0; i < yearsArray.length; i++) {
							selected = ''
							if (activeYear == yearsArray[i]) { selected = 'selected' }
							rosterYears.push("<option value='" + yearsArray[i] + "'" +  selected + ">" + yearsArray[i] + "-" + ( yearsArray[i] + 1 ) + "</option>")
						}
						return rosterYears.join('')
					}
					function recountRows(){
						$('#rosterTableBody tr').each(function(i, obj){
							$(this).attr("id","rosterTableRow" + i)
						})
						$('#rosterTableBody button').each(function(i, obj){
							$(this).unbind()
							
							$(this).on('click', function(){removeRow(i)})
						})
						$('#rosterTableBody select #year').each(function(i, obj){
							$(this).attr('name','rosterYear' + i)
						})
						$('#rosterTableBody select #chapter_id').each(function(i, obj){
							$(this).attr('name','rosterChapter' + i)
						})
						$('#rosterTableBody input').each(function(i, obj){
							$(this).attr('name','rosterPosition' + i)
						})
					}							
					function addRow(){
						let rowNumber = $('#rosterTableBody tr').length;
						const activeYear = currentYear - rowNumber
						$('#rosterTableBody').append("<tr id='rosterTableRow"+rowNumber+"'><td><select name='rosterYear"+rowNumber+"' class='year my-1'>" + getRosterYears(activeYear) + "</select></td><td><select name='rosterChapter"+rowNumber+"' class='chapter_id my-1'>${chapterSelectOptions.join('')}</select></td><td><input name='rosterPosition"+rowNumber+"' class='my-1' type='text'></input></td><td><button class='btn' type='button' id='rosterTableRemoveRow"+rowNumber+"'><i class='fa-solid fa-trash-can'></i></button></td></tr>")
						recountRows()
					}							
					function removeRow(rowNumber){
						$('#rosterTableRow' + rowNumber).remove()
						$('#rosterTableBody select #year').each(function(i, obj){
							$(this).attr('name','rosterYear' + i)
						})
						$('#rosterTableBody select #chapter_id').each(function(i, obj){
							$(this).attr('name','rosterChapter' + i)
						})
						$('#rosterTableBody input').each(function(i, obj){
							$(this).attr('name','rosterPosition' + i)
						})
					}
				</script>`}
					}
				]
			}
		})
	}
)

router.post('/me/roster/edit',
	requiresAuth(), // check if user is authenticated
	async (req, res, next) => {
		const chapter_id = req.body.chapter_id
		console.log(req.body)
		const intRosterRows = (Object.keys(req.body).length - 1) / 3
		let objRoster = {}
		let insertQuery = 'INSERT INTO roster (year, chapter_id, title, user_id) VALUES '

		console.log(req.body)

		for (i = 0; i < intRosterRows; i++) {
			objRoster[req.body['rosterYear' + i]] = req.body['rosterPosition' + i]
			insertQuery += `(${req.body['rosterYear' + i]},${req.body['rosterChapter' + i]},'${req.body['rosterPosition' + i]}',${req.activeUser.datum.id})`
			if (i + 1 != intRosterRows) {
				insertQuery += ','
			}
		}

		const deleteQuery = `DELETE FROM roster WHERE user_id = ${req.activeUser.datum.id}`
		await queryPromise(deleteQuery)
		queryPromise(insertQuery)
		req.activeUser.update({chapter_id})

		res.redirect('/users/me')
	}
)

router.post('/photo/upload',
	requiresAuth(), // check if user is authenticated
	upload.single('photo'), function (req, res) {
		const tempPath = req.file.path
		let targetPath = path.join(__dirname, `../public/res/app/photos/profile/${req.activeUser.datum.guid}.webp`)
		ws = fs.createWriteStream(targetPath)
		resize(tempPath, 'webp', 500, 500).pipe(ws)

		res.redirect('/users/me')
	}
)

router.post('/photo/upload/bulk',
	requiresAuth(), // check if user is authenticated
	upload.fields([{ name: 'photo', maxCount: 10 }]), function (req, res) {
		tempPath = ''
		targetPath = ''

		Object.keys(req.files.photo).forEach(elem => {
			tempPath = req.files.photo[elem].path
			targetPath = path.join(__dirname, `../public/res/app/photos/composite/${req.body.chapter_id}/${req.body.year[elem]}/${req.activeUser.datum.guid}.webp`)
			ws = fs.createWriteStream(targetPath)
			resize(tempPath, 'png', 500, 500).pipe(ws)
		})
	}
)

module.exports = router;