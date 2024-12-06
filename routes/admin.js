/*	admin.js
	by Blaine Harper

	PURPOSE: router for admin UI interactions
*/	

const express = require('express')
const router = express.Router()
const axios = require('axios')
const {needsAuthenticated, isAdmin} = require('./utils/auth')
const {queryPromise} = require('@bhar2254/mysql')

const userPatch = async(req, res, next) => {
	table = 'users'
	response = 200
	data = req.body
	
	// Start the query string
	let query = `UPDATE ${table} SET `
	
	pos = 0
	data['guid'] = data['newGuid']
	length = Object.keys(data).length
		
	// For loop to populate the query string based on the passed parameters in the request body
	for(let i=0; i < length; i++){
		let key = Object.keys(data)[i]
		
		s = Object.values(data)[i]
		if (s.indexOf('"') != -1){
			s = s.replace(/"/g, `\\"`)
		}
		value = s
	
		if(value && key != 'newGuid' && key != 'oldGuid'){
			if(pos > 0){query = query + ", "}
			query = query + `${key}="${value}"`
			pos++
		} 
	}
	
	// Finish the query
	query = query + ` WHERE guid = "${data.oldGuid}"`
	
	// Execute the query
	full_roster = await queryPromise(full_roster_query)
	return next()
}

/* General REST PATCH / SQL update. */
sqlPatch = async (req, res, next) => {
	table = req.session.table
	response = 200
	data = req.body
	
	tableKey = {
		'users':'int',
		'tblSQLHistory':'intSQLHistory',
		'roster':'intRoster',
		'tblPhil':'intPhil',
		'tblPayment':'intPayment',
		'tblLeaders':'intLeader',
		'tblHistory':'intHistory',
		'faq':'intFAQ',
		'events':'intEvent',
		'tblEnv':'intEnv',
		'tblChapter':'chapter_id',
	}


	pos = 0
	
	length = Object.keys(data).length

	// Start the query string
	let query = `UPDATE ${table} SET `
	
	data['newGuid'] ? data['oldGuid'] = data['newGuid'] : data['oldGuid'] = data['guid']
		
	// For loop to populate the query string based on the passed parameters in the request body
	for(let i=0; i < length; i++){
		let key = Object.keys(data)[i]
		
		s = Object.values(data)[i]
		if (s.indexOf('"') != -1){
			s = s.replace(/"/g, `\\"`)
		}
		value = s
		
		if(value && key != 'newGuid' && key != 'oldGuid'){
			if(pos > 0){query = query + ", "}
			query = query + `${key}="${value}"`
			pos++
		} 
	}
	
	// Finish the query
	query = query + ` WHERE guid = "${data.oldGuid}"`
	// Execute the query
	output = await queryPromise(query)
	return next()
}

router.get('/',
    needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    function (req, res, next){
		res.render('pages/basicText', { 
			env: req.env, 
			isAuthenticated: req.oidc.isAuthenticated(), 
			activeUser: req.activeUser, 
			title:'Admin Center', 
			page:{
				content: [
					{		
						parallax: {
							rem:'15', 
							url:'res/stock/stage_amplifiers_02.webp'
						}, 
						hero:{
							title:'Admin Center', 
							ontent:`There's not much here at the moment, but down the line this will be a hub for admin activities. For now, you can manage your resources from the navbar above.`
						}
					}
				]
			}
		})
	}
)

async function axiosPost(url, data, options){
    const response = await axios.post(url, data, options)
    return response.data
}

router.post('/bulkUpdate',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async function(req, res) {
		const data = req.body
		
		function capitalizeFirstLetter(string){
			return string.charAt(0).toUpperCase() + string.slice(1)
		}
		
		if(req.query.action == 'delete'){
			Object.keys(data).forEach(item => {
				const table = 'tbl' + capitalizeFirstLetter(req.query.table)
				console.log(`${item} was deleted!`)
				const query = `DELETE FROM ${table} WHERE guid = '${item}'`
				queryPromise(query)
			})
		}
	}
)

router.get('/events',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		buttonBar = ''
		const eventQuery = `SELECT *, DATE_FORMAT(timestamp, '%Y-%m-%dT%H:%i') AS timestamp FROM viewEvents`
		const eventData = await queryPromise(eventQuery)

		const chapterQuery = `SELECT id AS chapter_id, name FROM chapters`
		const chapterData = await queryPromise(chapterQuery)
		
		req.session.table = 'events'
		CHAPTERS = ''
		
		for(i = 0; i < chapterData.length; i++){
			let chapter_selected = ''
			if(1 == i){chapter_selected='selected'}
			CHAPTERS += `<option value='${i}' ${chapter_selected}>${chapterData[i].name}</option>`
		}

		var d = new Date()
		d.setTime(d.getTime() - 300 * 60000)
		d = d.toISOString().slice(0, 16).replace('T', ' ')
		
		buttonBar = `<script type="text/javascript">						
						addEventListener("load", (event) => {
							if(window.location.href.indexOf('?event=delete') != -1 || window.location.href.indexOf('&event=delete') != -1){
								$('#modal_delEvent').modal('show')
							}
						})
					</script>
						<button data-bs-toggle="modal" data-bs-target="#modal_delEvent" class="my-1 me-3 btn btn-danger" id="btnDelEvent"><i class="fa-solid fa-calendar-minus"></i> Delete Events</button>
						<div class="modal fade" id="modal_delEvent" tabindex="-1" aria-labelledby="modal_delUserLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">!!! DELETE EVENT(s) !!!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										This <b>CANNOT</b> be undone! Make sure this is what you want before you submit!
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button data-bs-toggle="modal" data-bs-target="#modal_delEventReturn" data-bs-dismiss="modal"  formaction="/admin/bulkUpdate?action=delete&table=events" data-bs-dismiss="modal" type="submit" form="generalTableForm" class="btn btn-danger" id="btnDeleteUsers">DELETE</button>
									</div>
								</div>
							</div>
						</div>
						<script type="text/javascript">						
							addEventListener("load", (event) => {
								if(window.location.href.indexOf('?event=deleted') != -1 || window.location.href.indexOf('&event=deleted') != -1){
									$('#modal_delUserReturn').modal('show')
								}
							})
						</script>
						<div class="modal fade" id="modal_delEventReturn" tabindex="-1" aria-labelledby="modal_delEventReturnLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">Event(s) Deleted!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-footer">
										<button type="button" onClick="window.location.href='/admin/events'" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
									</div>
								</div>
							</div>
						</div>`
		buttonBar += `<button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modal_newEvent" id="btnNewEvent"><i class="fas fa-calendar-plus"></i> Event</button><script type="text/javascript">						
						addEventListener("load", (event) => {
							if(window.location.href.indexOf('?event=new') != -1 || window.location.href.indexOf('&event=new') != -1){
								$('#modal_newEvent').modal('show')
							}
						})
						</script>
						<div class="modal fade" id="modal_newEvent" tabindex="-1" aria-labelledby="modal_newEventLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">New Event</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										<form id="formNewEvent" action="/insert/events" method="post" class="plp-form">
											<div class="gy-3 row">
												<div class="col">
													<label>Title</label>
													<br><input name="title" placeholder="Title" type="text"/>
												</div>
												<div class="col">
													<label>Timestamp</label>
													<br><input name="timestamp" type="datetime-local" value="${d}" required/>
												</div>
												<div class="col">
													<label>Organization</label>
													<br><select name="organization_id">${CHAPTERS}</select>
												</div>	
												<div class="col">
													<label>Location</label>
													<br><input name="location" placeholder="Location" type="text"/>
												</div>
												<div class="col">
													<label>Description (full)</label>
													<br><input name="description" placeholder="Full description" type="text"/>
												</div>
												<div class="col">
													<label>Description (short)</label>
													<br><input name="short_description" placeholder="Short description" type="text"/>
												</div>	
												<div class="col">
													<label>Tags</label>
													<br><input name="tags" placeholder="Tags" type="text"/>
												</div>															
											</div>			
											<div class="row">
												
											</div>												
										</form>
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="submit" form="formNewEvent" class="btn btn-success" id="btnNewEvent">Create New</button>
									</div>
								</div>
							</div>
						</div>`
		modals = []
		
		for(k=0; k < eventData.length; k++){
			CHAPTERS = ''
			
			for(i=1; i<chapterData.length; i++){
				chapter_selected = ''
				if(eventData[k].organization_id == i){chapter_selected='selected'}
				CHAPTERS += `<option value='${i}' ${chapter_selected}>${chapterData[i-1].name}</option>`
			}
			
			modals[k] = `<div class="modal fade" id="modal_${eventData[k].guid}" tabindex="-1" aria-labelledby="modal_newEventLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">Event Details</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										<form id="formUpdateEvent_${k}" action="/admin/events/edit" method="post" class="plp-form">
											<div class="gy-3 row">
												<div class="col">
													<input name="guid" placeholder="GUID" style="display:none;" type="text" value="${eventData[k].guid}"/>
													<label>Title</label>
													<br><input name="title" placeholder="Title" type="text" value="${eventData[k].title}" required/>
												</div>
												<div class="col">
													<label>Timestamp</label>
													<br><input name="timestamp" type="datetime-local" value="${eventData[k].timestamp}" required/>
												</div>
												<div class="col">
													<label>Organization</label>
													<br><select name="organization_id">${CHAPTERS}</select>
												</div>	
												<div class="col">
													<label>Location</label>
													<br><input name="location" placeholder="Location" type="text" value="${eventData[k].location}" required/>
												</div>
												<div class="col">
													<label>Description (full)</label>
													<br><textarea name="description" placeholder="Full description" type="text" required>${eventData[k].description}</textarea>
												</div>
												<div class="col">
													<label>Description (short)</label>
													<br><textarea name="short_description" placeholder="Short description" type="text">${eventData[k].short_description}</textarea>
												</div>	
												<div class="col">
													<label>Tags</label>
													<br><input name="tags" placeholder="Tags" type="text" value="${eventData[k].tags}"/>
												</div>															
											</div>													
										</form>
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="submit" form="formUpdateEvent_${k}" class="btn btn-success" id="formUpdateEvent_${k}_submit">Update</button>
									</div>
								</div>
							</div>
						</div>`
		}

		columns = ['title','short_description','timestamp','nickname','name']
		env = req.env
		
		res.render('pages/datatable', {
			env: req.env,
			activeUser: req.activeUser,
			isAuthenticated: req.oidc.isAuthenticated(),
			title:'Events',
			subtitle:'To update a field, click on the row you want to update and submit the form after updating any relevant information.',
			table:{
				buttons: buttonBar,
				order: [2,'desc'],
				columns: columns,
				data: eventData,
				filterColumns: [4],
				disableOrderColumns: [4],
				modals: modals
			}
		})
	}
)

router.post('/events/new', 
	needsAuthenticated,
	async (req, res, next) => {
		let d = new Date(req.body.timestamp)
		d.setTime(d.getTime() - 300 * 60000)
		d = d.toISOString().slice(0, 16).replace('T', ' ')
		req.body.timestamp = d
		req.body.organizer_id = req.activeUser.id
		
		Object.keys(req.body).forEach(key => {
			s = new String(req.body[key])
			if (s.indexOf('"') != -1){
				s = s.replace(/"/g, ``)
			}
			req.body[key] = s
		})
		
		const insertQuery = `INSERT INTO events (timestamp,title,organizer_id,organization_id,location,description,short_description,tags) VALUES ("${req.body.timestamp}","${req.body.title}",${req.body.organizer_id},${req.body.organization_id},"${req.body.location}","${req.body.description}","${req.body.short_description}","${req.body.tags}")`
		queryPromise(insertQuery)
		res.redirect('/admin/events')
	}
)

router.post('/events/edit',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
	(req, res, next) => {
		var d = new Date(req.body.timestamp)
		d.setTime(d.getTime() - 300 * 60000)
		d = d.toISOString().slice(0, 16).replace('T', ' ')
		req.body.timestamp = d
		
		next()
	},
	sqlPatch,
    (req, res, next) => {
		res.redirect('/admin/events')
    }
)
	
router.get('/newsletter',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    function (req, res, next){
		
	}
)

router.get('/faq',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		buttonBar = ''
		const faqQuery = `SELECT * FROM faq`
		const dataTable = await queryPromise(faqQuery)

		req.session.table = 'tblFaq'

		var d = new Date()
		d.setTime(d.getTime() - 300 * 60000)
		d = d.toISOString().slice(0, 16).replace('T', ' ')
				
		buttonBar = `<script type="text/javascript">						
						addEventListener("load", (event) => {
							if(window.location.href.indexOf('?faq=delete') != -1 || window.location.href.indexOf('&faq=delete') != -1){
								$('#modal_delFAQ').modal('show')
							}
						})
					</script>
						<button data-bs-toggle="modal" data-bs-target="#modal_delFAQ" class="my-1 me-3 btn btn-danger" id="btnDelFAQ">Delete FAQ</button>
						<div class="modal fade" id="modal_delFAQ" tabindex="-1" aria-labelledby="modal_delFAQLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">!!! DELETE FAQ(s) !!!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										This <b>CANNOT</b> be undone! Make sure this is what you want before you submit!
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button data-bs-toggle="modal" data-bs-target="#modal_delFAQReturn" data-bs-dismiss="modal"  formaction="/admin/bulkUpdate?action=delete&table=FAQ" data-bs-dismiss="modal" type="submit" form="generalTableForm" class="btn btn-danger" id="btnDeleteUsers">DELETE</button>
									</div>
								</div>
							</div>
						</div>
						<script type="text/javascript">						
							addEventListener("load", (event) => {
								if(window.location.href.indexOf('?faq=deleted') != -1 || window.location.href.indexOf('&faq=deleted') != -1){
									$('#modal_delFAQReturn').modal('show')
								}
							})
						</script>
						<div class="modal fade" id="modal_delFAQReturn" tabindex="-1" aria-labelledby="modal_delFAQReturnLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">FAQ(s) Deleted!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-footer">
										<button type="button" onClick="window.location.href='/admin/faq'" class="btn btn-secondary">Close</button>
									</div>
								</div>
							</div>
						</div>`
		
		modals = []
		
		for(k=0; k < dataTable.length; k++){
			modals[k] = `<div class="modal fade" id="modal_${dataTable[k]['guid']}" tabindex="-1" aria-labelledby="modal_newLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">Details</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										<form id="formUpdate_${k}" action="/admin/data/edit" method="post" class="plp-form">
											<div class="gy-3 row">											
											</div>													
										</form>
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="submit" form="formUpdate_${k}" class="btn btn-success" id="formUpdate_${k}_submit">Update</button>
									</div>
								</div>
							</div>
						</div>`
		}

		const columns = ['query']
		
		res.render('pages/datatable', {
			env: req.env,
			activeUser: req.activeUser,
			isAuthenticated: req.oidc.isAuthenticated(),
			title:'FAQ',
			subtitle:'To update a field, click on the row you want to update and submit the form after updating any relevant information.',
			table:{
				buttons: buttonBar,
				order: [0,'desc'],
				columns: columns,
				data: dataTable,
				filterColumns: [],
				disableOrderColumns: [],
				modals: modals
			}
		})
	}
)

router.get('/roster',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		buttonBar = ''
		const rosterQuery = `SELECT * FROM viewRoster`
		const dataTable = await queryPromise(rosterQuery)
		req.session.table = 'roster'
		
		buttonBar = `<script type="text/javascript">						
						addEventListener("load", (event) => {
							if(window.location.href.indexOf('?ros=delete') != -1 || window.location.href.indexOf('&ros=delete') != -1){
								$('#modal_delRoster').modal('show')
							}
						})
					</script>
						<button data-bs-toggle="modal" data-bs-target="#modal_delRoster" class="my-1 me-3 btn btn-danger" id="btnDelFAQ">Delete Roster</button>
						<div class="modal fade" id="modal_delRoster" tabindex="-1" aria-labelledby="modal_delRosterLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">!!! DELETE Roster(s) !!!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										This <b>CANNOT</b> be undone! Make sure this is what you want before you submit!
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button data-bs-toggle="modal" data-bs-target="#modal_delRosterReturn" data-bs-dismiss="modal"  formaction="/admin/bulkUpdate?action=delete&table=roster" data-bs-dismiss="modal" type="submit" form="generalTableForm" class="btn btn-danger" id="btnDeleteUsers">DELETE</button>
									</div>
								</div>
							</div>
						</div>
						<script type="text/javascript">						
							addEventListener("load", (event) => {
								if(window.location.href.indexOf('?ros=deleted') != -1 || window.location.href.indexOf('&ros=deleted') != -1){
									$('#modal_delRosterReturn').modal('show')
								}
							})
						</script>
						<div class="modal fade" id="modal_delRosterReturn" tabindex="-1" aria-labelledby="modal_delRosterReturnLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">Rosters(s) Deleted!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-footer">
										<button type="button" onClick="window.location.href='/admin/roster'" class="btn btn-secondary">Close</button>
									</div>
								</div>
							</div>
						</div>`
						
		modals = []
		
		for(k=0; k < dataTable.length; k++){
			modals[k] = `<div class="modal fade" id="modal_${dataTable[k]['guid']}" tabindex="-1" aria-labelledby="modal_newLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">Details</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										<form id="formUpdate_${k}" action="/admin/data/edit" method="post" class="plp-form">
											<div class="gy-3 row">											
											</div>													
										</form>
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button type="submit" form="formUpdate_${k}" class="btn btn-success" id="formUpdate_${k}_submit">Update</button>
									</div>
								</div>
							</div>
						</div>`
		}

		columns = ['year', 'name', 'title','nickname']
		
		res.render('pages/datatable', {
			env: req.env,
			activeUser: req.activeUser,
			isAuthenticated: req.oidc.isAuthenticated(),
			title:'Roster',
			subtitle:'To update a field, click on the row you want to update and submit the form after updating any relevant information.',
			table:{
				buttons: buttonBar,
				order: [0,'desc'],
				columns: columns,
				data: dataTable,
				filterColumns: [],
				disableOrderColumns: [],
				modals: modals
			}
		})
	}
)

router.get('/users',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		const userQuery = `SELECT * FROM users WHERE role > 0`
		const userData = await queryPromise(userQuery)

		req.session.table = 'users'
		
		columns = ['nickname','role','chapter_id','order','recruit_year','recruit_term','grad_year','grad_term','status']
		env = req.env
		objEnvForms = req.env['forms']
		
		activeUser = req.activeUser
		
		ROLE_array = req.env['roles']
		ROLE_length = ROLE_array.length
		STATE_array = req.env['states']
		STATE_length = STATE_array.length
		TERM_array = req.env['terms']
		TERM_length = TERM_array.length
		STATUS_array = req.env['status']
		STATUS_length = STATUS_array.length
		
		STATES = ''
		STATUS = ''
		rTERMS = ''
		gTERMS = ''
	
		for(i = 0; i < STATE_length; i++){
			STATES += `<option value='${STATE_array[i]}'>${STATE_array[i]}</option>`
		}
		
		for(i = 1; i < STATUS_length; i++){
			STATUS_selected = ''
			if(2 == i){STATUS_selected='selected'}
			STATUS += `<option value='${STATUS_array[i]}' ${STATUS_selected}>${STATUS_array[i]}</option>`
		}
		
		for(i = 0; i < TERM_length; i++){
			rTERM_selected = ''
			if(3 == i){rTERM_selected='selected'}
			rTERMS += `<option value='${TERM_array[i]}' ${rTERM_selected}>${TERM_array[i]}</option>`
		}
		
		for(i = 0; i < TERM_length; i++){
			gTERM_selected = ''
			if(1 == i){gTERM_selected='selected'}
			gTERMS += `<option value='${TERM_array[i]}' ${gTERM_selected}>${TERM_array[i]}</option>`
		}
		
//					If the selected user is a higher role than the logged in user, disabled the field
//					This will also be filtered out by the server to prevent html injection
		ROLES = `<div class="text-muted"><select style="max-width:5rem;" id="role" name="role" type="text">`
		for(i = 0; i <= req.activeUser.role; i++){
			ROLE_selected = ''
			if(1 == i){ROLE_selected=' selected'}
			ROLES += `<option value='${i}'${ROLE_selected}>${ROLE_array[i]}</option>`
		}
		ROLES += '</select></div>';
		
//					If the selected user is a higher order than the logged in user, disabled the field
//					Similar logic as above
		ORDERS = `<div class="text-muted"><select style="max-width:5rem;" id="order" name="order" type="text">`
		ORDER_array = req.env.orders
		for(i = 0; i <= req.activeUser.order; i++){
			ORDER_selected = ''
			if(1 == i){ORDER_selected='selected'}
			ORDERS += `<option value='${i}'${ORDER_selected}>${ORDER_array[i]}</option>`
		}
		ORDERS += '</select></div>'
		
		buttonBar = `<script type="text/javascript">						
						addEventListener("load", (event) => {
							if(window.location.href.indexOf('?users=new') != -1 || window.location.href.indexOf('&users=new') != -1){
								$('#modal_delUser').modal('show')
							}
						})
					</script>
						<button data-bs-toggle="modal" data-bs-target="#modal_delUser" class="my-1 me-3 btn btn-danger" id="btnDelUser"><i class="fa-solid fa-user-minus"></i> Delete Users</button>
						<div class="modal fade" id="modal_delUser" tabindex="-1" aria-labelledby="modal_delUserLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">!!! DELETE USER(s) !!!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										This <b>CANNOT</b> be undone!
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button data-bs-toggle="modal" data-bs-target="#modal_delUserReturn" data-bs-dismiss="modal"  formaction="/admin/bulkUpdate?action=delete&table=users" data-bs-dismiss="modal" type="submit" form="generalTableForm" class="btn btn-danger" id="btnDeleteUsers">DELETE</button>
									</div>
								</div>
							</div>
						</div>
						<script type="text/javascript">						
							addEventListener("load", (event) => {
								if(window.location.href.indexOf('?delRet=show') != -1 || window.location.href.indexOf('&delRet=show') != -1){
									$('#modal_delUserReturn').modal('show')
								}
							})
						</script>
						<div class="modal fade" id="modal_delUserReturn" tabindex="-1" aria-labelledby="modal_delUserReturnLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">User(s) Deleted!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">

									</div>
									<div class="modal-footer">
										<button type="button" onClick="window.location.href='/admin/users'" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
									</div>
								</div>
							</div>
						</div>`
		buttonBar += `<button data-bs-toggle="modal" data-bs-target="#modal_newUser" class="my-1 me-3 btn btn-success" id="btnNewUser"><i class="fa fa-user-plus" aria-hidden="true"></i> New User</button>
						<script type="text/javascript">						
							addEventListener("load", (event) => {
								if(window.location.href.indexOf('?new=show') != -1 || window.location.href.indexOf('&new=show') != -1){
									$('#modal_newUser').modal('show')
								}
							})
						</script>
						<div class="modal fade" id="modal_newUser" tabindex="-1" aria-labelledby="modal_newUserLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="overflow-y: initial !important">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">New User</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<form id='formNewUser' class="plp-form" method="post" action="/admin/users/new" id="profile_new" class="modal-body" style="height:40rem;overflow-y:auto;">
										<div class="accordion accordion-flush" id="newUserAccordion">
											<div class="accordion-item">
												<h2 class="accordion-header" id="panelsStayOpen-headingOne">
													<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne">
														Account <span class="mx-1" style="color:red; font-size:.85rem;"> (required)</span>
													</button>
												</h2>
												<div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show" data-bs-parent="#newUserAccordion"  aria-labelledby="panelsStayOpen-headingOne">
													<div class="accordion-body">
														Preferred Name<br><span class="text-xsmall text-muted">Publicly visible only to brothers</span><br>
															<div class="lead"> 
																<input style="max-width:47.5%" name="name" placeholder="Given Name" type="text" required/>
															</div>
														<br>Display Name
															<div class="lead"> 
																<input name="nickname" placeholder="Display Name" type="text" required/>
															</div>
														<br>Email
														<div class="text-muted">
															<div class="lead"> 
																<input style="width:100%;" name="email" placeholder="E-Mail" type="email""/>
															</div>
														</div>
														<br>GUID
															<div class="lead"> 
																<input style="width:100%;" name="guid" placeholder="GUID / SSO" type="text"/>
															</div>
														<div class="row">
															<div class="col">
																<br>User Role
																${ROLES}
															</div>
															<div class="col">
																<br>Account Status
																<div class="text-muted">
																	<select style="max-width:5rem;" id="status" name="status" type="text">
																		${STATUS}
																	</select>
																</div>
															</div>
															<div class="col">
																<br>Order
																${ORDERS}
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="accordion-item">
												<h2 class="accordion-header" id="panelsStayOpen-headingTwo">
													<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo">
														Enrollment <span class="mx-1" style="color:red; font-size:.85rem;"> (required)</span>
													</button>
												</h2>
												<div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse" data-bs-parent="#newUserAccordion" aria-labelledby="panelsStayOpen-headingTwo">
													<div class="accordion-body">
														<table>
															<tr>
																<td class="text-muted">Recruit</td>
																<td><select class="mx-3" style="max-width:5rem;" id="recruit_term" name="recruit_term" type="text">${rTERMS}</select></td>
																<td><input style="max-width:10rem;" name="recruit_year" placeholder="Pledge year" type="number" required/></td>
															</tr>
															<tr>
																<td class="text-muted">Alumnus</td>
																<td><select class="mx-3" style="max-width:5rem;" id="grad_term" name="grad_term" type="text">${gTERMS}</select>
																<td><input style="max-width:10rem;" name="grad_year" placeholder="Alumnus year" type="number" required/></td>
															</tr>
														</table>
													</div>
												</div>
											</div>
											<div class="accordion-item">
												<h2 class="accordion-header" id="panelsStayOpen-headingThree">
													<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree">
														Biography <span class="mx-1 text-muted" style="font-size:.85rem;"> (optional)</span>
													</button>
												</h2>
												<div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse" data-bs-parent="#newUserAccordion" aria-labelledby="panelsStayOpen-headingThree">
													<div class="accordion-body">
														Current Address 
														<br><span class="text-xsmall text-muted">Private. Used for Alumni newsletter and outreach</span><br>
														<div class="lead">
															<input name="street_address" placeholder="Address" type="text"/>
															<br>
															<input name="city" placeholder="City" type="text"/>, <select id="state" name="state" type="text">${STATES}</select>
															<input name="postal_code" placeholder="ZIP" type="number""/>
														</div>
														<br>Employment 
														<br>
														<div class="text-muted">
															<input placeholder="Title" name="job_title" type="text"/> in <input name="department" placeholder="Department" type="text" style="width:75%;"/> at
															<br><input name="company_name" placeholder="Company" type="text" style="width:100%;"/><input name="id" type="number" style="display:none;"/>
														</div>
														<br>Bio
														<br><span class="text-xsmall text-muted">Publicly visible if you were a chapter exec</span><br>
														<div class="lead">
															<textarea style="width:100%;" name="bio" placeholder="Biography" type="text"></textarea>
															<br>
														</div>
													</div>
												</div>
											</div>
										</div>
									</form>	
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button form="formNewUser"type="submit" class="btn btn-success">Create User</button>
									</div>
								</div>
							</div>
						</div>
						<script type="text/javascript">						
							addEventListener("load", (event) => {
								if(window.location.href.indexOf('?newRet=show') != -1 || window.location.href.indexOf('&newRet=show') != -1){
									$('#modalNewUserReturn').modal('show')
								}
							})
						</script>
						<div class="modal fade" id="modalNewUserReturn" tabindex="-1" aria-labelledby="modalNewUserReturnLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">User Created!</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body">
										If you supplied an email, an invite will be generated by Microsoft with instructions to log in.
									</div>
									<div class="modal-footer">
										<button type="button" onClick="window.location.href='/admin/users'" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
									</div>
								</div>
							</div>
						</div>`
		modals = []
		
		for(k = 0; k < userData.length; k++){
			STATES = ''
			STATUS = ''
			rTERMS = ''
			gTERMS = ''
			
			for(i = 0; i < STATE_length; i++){
				STATE_selected = ''
				if(userData[k].state == STATE_array[i]){STATE_selected='selected'}
				STATES += `<option value='${STATE_array[i]}' ${STATE_selected}>${STATE_array[i]}</option>`
			}
			
			for(i = 1; i<STATUS_length; i++){
				STATUS_selected = ''
				if(userData[k].status == STATUS_array[i]){STATUS_selected='selected'}
				STATUS += `<option value='${STATUS_array[i]}' ${STATUS_selected}>${STATUS_array[i]}</option>`
			}
			
			for(i = 0; i < TERM_length; i++){
				rTERM_selected = ''
				if(userData[k].recruit_term == TERM_array[i]){rTERM_selected='selected'}
				rTERMS += `<option value='${TERM_array[i]}' ${rTERM_selected}>${TERM_array[i]}</option>`
			}
			
			for(i = 0; i < TERM_length; i++){
				gTERM_selected = ''
				if(userData[k].grad_term == TERM_array[i]){gTERM_selected='selected'}
				gTERMS += `<option value='${TERM_array[i]}' ${gTERM_selected}>${TERM_array[i]}</option>`
			}
			
//					If the selected user is a higher role than the logged in user, disabled the field
//					This will also be filtered out by the server to prevent html injection
			ROLE_disabled = userData[k].role >= activeUser.role && !(activeUser.role = 4) ? ' disabled' : '' 
			ROLE_length = userData[k].role > activeUser.role ? userData[k].role : activeUser.role 
			ROLES = `<div class="text-muted"><select style="max-width:5rem;" id="role" name="role" type="text">`
			for(i = 0; i <= ROLE_length; i++){
				ROLE_selected = ''
				if(userData[k].role == i){
					ROLE_selected = ' selected'
					ROLE_disabled = ''
				}
				ROLES += `<option value='${i}'${ROLE_selected}${ROLE_disabled}>${ROLE_array[i]}</option>`
			}
			ROLES += '</select></div>'
			
//					If the selected user is a higher order than the logged in user, disabled the field
//					Similar logic as above
			ORDER_disabled = userData[k].order >= activeUser.order && !(activeUser.role = 4) ? ' disabled' : '' 
			ORDER_length = userData[k].order > activeUser.order ? userData[k].order : activeUser.order 
			ORDERS = `<div class="text-muted"><select style="max-width:5rem;" id="order" name="order" type="text">`
			ORDER_array = req.env.orders
			for(i = 0; i <= 4; i++){
				ORDER_selected = ''
				if(userData[k].order == i){
					ORDER_selected = 'selected'
					ORDER_disabled = ''
				}
				ORDERS += `<option value='${i}'${ORDER_selected}${ORDER_disabled}>${ORDER_array[i]}</option>`
			}
			ORDERS += '</select></div>'

			DIRECTORY_array = req.env.inDirectory

			modals[k] = `<div class="modal fade" id="modal_${userData[k].guid}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="overflow-y: initial !important">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title">User Details</h5>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<form id='formUpdateUser_${k}' class = "plp-form" method="post" action="/admin/users/edit" id="profile_edit" class="modal-body" style="height:40rem;overflow-y:auto;">	
										<div class="accordion accordion-flush" id="editUserAccordion${k}">
											<div class="accordion-item">
												<h2 class="accordion-header" id="panelsStayOpen-headingOne${k}">
													<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseOne${k}" aria-expanded="true" aria-controls="panelsStayOpen-collapseOne${k}">
														Account Information <span class="mx-1" style="color:red; font-size:.85rem;"> (required)</span>
													</button>
												</h2>
												<div id="panelsStayOpen-collapseOne${k}" class="accordion-collapse collapse show" data-bs-parent="#editUserAccordion${k}" aria-labelledby="panelsStayOpen-headingOne${k}">
													<div class="accordion-body">
														Preferred Name<br><span class="text-xsmall text-muted">Publicly visible only to brothers</span><br>
															<div class="lead"> 
																<input style="max-width:47.5%" name="name" placeholder="Given Name" type="text" value="${userData[k].name}" required/>
															</div>
														<br>Display Name
															<div class="lead"> 
																<input name="nickname" placeholder="Display Name" type="text" value="${userData[k].nickname}" required/>
															</div>	
														<br>Email
														<div class="text-muted">
															<div class="lead"> 
																<input style="width:100%;" name="email" placeholder="E-Mail" type="email" value="${userData[k].email}"/>
															</div>
														</div>
														<br>
														In Directory
														<br>
														<div class="text-muted">
																${DIRECTORY_array[userData[k].intInDirectory]}
														</div>
														<br>GUID
															<div class="lead"> 
																<input style="width:100%;" name="newGuid" placeholder="GUID / SSO" type="text" value="${userData[k].guid}" required/>
																<input style="width:100%; display:none;" name="oldGuid" placeholder="GUID / SSO" type="text" value="${userData[k].guid}"/>
															</div>
														<div class="row">
															<div class="col">
																<br>User Role
																${ROLES}
															</div>
															<div class="col">
																<br>Account Status
																<div class="text-muted">
																	<select style="max-width:5rem;" id="status" name="status" type="text">
																		${STATUS}
																	</select>
																</div>
															</div>
															<div class="col">
																<br>Order
																${ORDERS}
															</div>
														</div>
													</div>
												</div>
											</div>
											<div class="accordion-item">
												<h2 class="accordion-header" id="panelsStayOpen-headingTwo${k}">
													<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseTwo${k}" aria-expanded="false" aria-controls="panelsStayOpen-collapseTwo${k}">
														Enrollment <span class="mx-1" style="color:red; font-size:.85rem;"> (required)</span>
													</button>
												</h2>
												<div id="panelsStayOpen-collapseTwo${k}" class="accordion-collapse collapse" data-bs-parent="#editUserAccordion${k}" aria-labelledby="panelsStayOpen-headingTwo${k}">
													<div class="accordion-body">
														<table>
															<tr>
																<td class="text-muted">Recruit</td>
																<td><select class="mx-3" style="max-width:5rem;" id="recruit_term" name="recruit_term" type="text" required>${rTERMS}</select></td>
																<td><input style="max-width:10rem;" name="recruit_year" placeholder="Pledge year" type="number" value="${userData[k].recruit_year}" required/></td>
															</tr>
															<tr>
																<td class="text-muted">Alumnus</td>
																<td><select class="mx-3" style="max-width:5rem;" id="grad_term" name="grad_term" type="text" required>${gTERMS}</select>
																<td><input style="max-width:10rem;" name="grad_year" placeholder="Alumnus year" type="number" value="${userData[k].grad_year}" required/></td>
															</tr>
														</table>
													</div>
												</div>
											</div>
											<div class="accordion-item">
												<h2 class="accordion-header" id="panelsStayOpen-headingThree${k}">
													<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree${k}" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree${k}">
														Biography <span class="mx-1 text-muted" style="font-size:.85rem;"> (optional)</span>
													</button>
												</h2>
												<div id="panelsStayOpen-collapseThree${k}" class="accordion-collapse collapse" data-bs-parent="#editUserAccordion${k}" aria-labelledby="panelsStayOpen-headingThree${k}">
													<div class="accordion-body">Current Address<br><span class="text-xsmall text-muted">Private. Used for Alumni newsletter and outreach</span><br>
														<div class="lead">
															<input name="street_address" placeholder="Address" type="text" value="${userData[k].street_address}"/>
															<br>
															<input name="city" placeholder="City" type="text" value="${userData[k].city}"/>, <select id="state" name="state" type="text">${STATES}</select>
															<input name="postal_code" placeholder="ZIP" type="number" value="${userData[k].postal_code}"/>
														</div>
														<br>Employment<br>
														<div class="text-muted">
															<input placeholder="Title" name="job_title" type="text" value="${userData[k].job_title}"/> in <input name="department" placeholder="Department" type="text" value="${userData[k].department}" style="width:75%;"/> at
															<br><input name="company_name" placeholder="Company" type="text" value="${userData[k].company_name}" style="width:100%;"/><input name="id" type="number" value="${userData[k].id}" style="display:none;"/>
														</div>
														<br>Bio<br><span class="text-xsmall text-muted">Publicly visible if you were a chapter exec</span><br>
														<div class="lead">
															<textarea style="width:100%;" name="bio" placeholder="Biography" type="text" value="${userData[k].bio}">${userData[k].bio}</textarea>
															<br>
														</div>
													</div>
												</div>
											</div>
										</div>
									</form>			
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
										<button form="formUpdateUser_${k}"type="submit" class="btn btn-primary">Save changes</button>
									</div>
								</div>
							</div>
						</div>`
		}
		
//		Reformat some data
		for (const selectedUser of userData) {
			for (const elem in selectedUser) {
				if(elem == 'role'){selectedUser.role = ROLE_array[selectedUser.role]}
				if(elem == 'order'){selectedUser.order = ORDER_array[selectedUser.order]}
				if(elem == 'chapter_id'){selectedUser.chapter_id = selectedUser.name}
			}
		}
		
		res.render('pages/datatable', {
			env: req.env,
			activeUser: req.activeUser,
			isAuthenticated: req.oidc.isAuthenticated(),
			title:'Users',
			subtitle:'To update a field, click on the row you want to update and submit the form after updating any relevant information.',
			table:{
				buttons: buttonBar,
				order: [0,'asc'],
				columns: columns,
				data:userData,
				filterColumns: [1,2,3,8],
				disableOrderColumns: [9],
				modals: modals
			}
		})
	}
)

router.post('/users/new', 
	needsAuthenticated,
	function (req, res, next){
		Object.keys(req.body).forEach(key => {
			s = new String(req.body[key])
			if (s.indexOf('"') != -1){
				s = s.replace(/"/g, ``)
			}
			req.body[key] = s
		})
		insertQuery = `INSERT INTO users (nickname,name,bio,email,intInDirectory,recruit_year,grad_year, order, role, status, street_address, city, state, postal_code, job_title, department, company_name) VALUES ("${req.body.nickname}","${req.body.name}","${req.body.bio}","${req.body.email}",1,${req.body.recruit_year},${req.body.grad_year},${req.body.order},${req.body.role},"${req.body.status}","${req.body.street_address}","${req.body.city}","${req.body.state}","${req.body.postal_code}","${req.body.job_title}","${req.body.depratment}","${req.body.company_name}")`;
		queryPromise(insertQuery)
		res.redirect('/admin/users')
	}
)

router.post('/users/edit',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
	userPatch,
    function (req, res, next){
		res.redirect('/admin/users')
    }
)

router.get('/settings',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		const { env, activeUser } = req
		req.session.table = 'env'
	
		content = []
		
		pageText = `Administrators can use this page to update environmental variables
			<div class="col-md-6 col-sm-12 mx-auto">
				<hr>
				<form class='plp-form' id='formUpdateSettings' method='post' action='/admin/settings'>`					
					Object.keys(env).forEach(key => {
						const isString = typeof env[key] === 'string'
						const isArray = Array.isArray(env[key])
						const isStringOrArray = isString || isArray

						lineHeight = 28.8
//								Use this section to modify the data display depending on the object type. 
//								Obj, open a accordinans with input rows for Text/Arr input
//								Arr, open input rows for array values

						if(isString){
							pageText += 			
								`<div class="row my-1 mx-auto"><div class="col-lg-2 col-sm-4 text-reset text-none"><label style="text-transform: capitalize;">${key}</label></div><div class="col-lg-10 col-sm-8 text-reset text-none"><input name='${key}' style='width:100%;' value='${env[key]}'/></div></div><hr>`;
						} else if(isArray){
							pageText += 		
								`<div class="row my-1 mx-auto"><div class="col-lg-2 col-sm-4 text-reset text-none"><label style="text-transform: capitalize;">${key}</label></div><div class="col-lg-10 col-sm-8 text-reset text-none"><textarea name='${key}' style='height:${lineHeight * 2}px; width:100%;'>${env[key]}</textarea></div></div><hr>`;
						} else {
							pageText += 		
								`<div class="row my-1 mx-auto"><div class="col-lg-2 col-sm-4 text-reset text-none"><label style="text-transform: capitalize;">${key}</label></div><div class="col-lg-10 col-sm-8 text-reset text-none"><textarea name='${key}' style='height:${lineHeight * 4}px; width:100%;'>${JSON.stringify(env[key])}</textarea></div></div><hr>`;
						} 
					})
		pageText += `
				</form>
			</div>
			<button form='formUpdateSettings' class='btn btn-success'>Save Changes</button>`
		
		content.push({
			parallax: {
				rem:10, 
				url:'res/stock/stage_amplifiers_02.webp'
			}, 
			hero : {
				title:`<div>Settings</div>`, 
				content:pageText
			}
		})
		
		res.render('pages/basicText', { 
			env, activeUser,
			isAuthenticated: req.oidc.isAuthenticated(), 
			title:'Settings', 
			page:{content: content}
		})
	}
)

router.post('/settings',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		for (const elem of req.body)
			queryPromise(`UPDATE env SET value = '${req.body[elem]}' WHERE key = '${elem}'`)

		req.env = ''
		res.redirect('/admin/settings')
	}
)

module.exports = router;