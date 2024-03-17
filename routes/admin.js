/*	admin.js
	by Blaine Harper

	PURPOSE: router for admin UI interactions
*/	

const express = require("express")
const router = express.Router()
const axios = require("axios")
const {needsAuthenticated, isAdmin} = require("./utils/auth")
const {queryPromise} = require("./utils/SQLUtils")

const userPatch = async(req, res, next) => {
	table = "tblUsers"
	response = 200
	data = req.body
	
	// Start the query string
	let query = `UPDATE ${table} SET `
	
	pos = 0
	data["txtGUID"] = data["txtNewGUID"]
	length = Object.keys(data).length
		
	// For loop to populate the query string based on the passed parameters in the request body
	for(let i=0; i < length; i++){
		let key = Object.keys(data)[i]
		
		s = Object.values(data)[i]
		if (s.indexOf('"') != -1){
			s = s.replace(/"/g, `\\"`)
		}
		value = s
	
		if(value && key != 'txtNewGUID' && key != 'txtOldGUID'){
			if(pos > 0){query = query + ", "}
			query = query + `${key}="${value}"`
			pos++
		} 
	}
	
	// Finish the query
	query = query + ` WHERE txtGUID = "${data.txtOldGUID}"`
	
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
		'tblUsers':'int',
		'tblSQLHistory':'intSQLHistory',
		'tblRoster':'intRoster',
		'tblPhil':'intPhil',
		'tblPayment':'intPayment',
		'tblLeaders':'intLeader',
		'tblHistory':'intHistory',
		'tblFAQ':'intFAQ',
		'tblEvents':'intEvent',
		'tblEnv':'intEnv',
	}


	pos = 0
	
	length = Object.keys(data).length

	// Start the query string
	let query = `UPDATE ${table} SET `
	
	data['txtNewGUID'] ? data['txtOldGUID'] = data['txtNewGUID'] : data['txtOldGUID'] = data['txtGUID']
		
	// For loop to populate the query string based on the passed parameters in the request body
	for(let i=0; i < length; i++){
		let key = Object.keys(data)[i]
		
		s = Object.values(data)[i]
		if (s.indexOf('"') != -1){
			s = s.replace(/"/g, `\\"`)
		}
		value = s
		
		if(value && key != 'txtNewGUID' && key != 'txtOldGUID'){
			if(pos > 0){query = query + ", "}
			query = query + `${key}="${value}"`
			pos++
		} 
	}
	
	// Finish the query
	query = query + ` WHERE txtGUID = "${data.txtOldGUID}"`
	// Execute the query
	output = await queryPromise(query)
	return next()
}

router.get('/',
    needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    function (req, res, next){
		res.render('pages/basicText', { 
			env: req.session.env, 
			isAuthenticated: req.oidc.isAuthenticated(), 
			activeUser: req.session.activeUser, 
			title:'Admin Center', 
			page:{
				content: [
					{		
						parallax: {
							rem:'15', 
							url:'/res/stock/stage_amplifiers_01.jpg'
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
				const query = `DELETE FROM ${table} WHERE txtGUID = '${item}'`
				queryPromise(query)
			})
		}
	}
)

router.get('/events',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		// buttonBar = ''
		
		// res.render('pages/datatable', {
		// 	env: req.session.env,
		// 	activeUser: req.session.activeUser,
		// 	isAuthenticated: req.oidc.isAuthenticated(),
		// 	title:'Events',
		// 	subtitle:'To update a field, click on the row you want to update and submit the form after updating any relevant information.',
		// 	table:{
		// 		buttons: buttonBar,
		// 		order: [2,'desc'],
		// 		columns: columns,
		// 		data: eventData,
		// 		filterColumns: [4],
		// 		disableOrderColumns: [4],
		// 		modals: modals
		// 	}
		// })
	}
)

router.get('/faq',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		buttonBar = ''
		const faqQuery = `SELECT * FROM tblFAQ`
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
			modals[k] = `<div class="modal fade" id="modal_${dataTable[k]['txtGUID']}" tabindex="-1" aria-labelledby="modal_newLabel" aria-hidden="true">
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

		const columns = ['txtQuery']
		
		res.render('pages/datatable', {
			env: req.session.env,
			activeUser: req.session.activeUser,
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

router.get('/users',
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		const userQuery = `SELECT * FROM tblUsers WHERE intRole > 0`
		const userData = await queryPromise(userQuery)

		req.session.table = 'tblUsers'
		
		columns = ['txtDisplayName','intRole','intOrder','txtStatus']
		env = req.session.env
		objEnvForms = req.session.env['forms']
		
		currentUser = req.session.activeUser
		
		ROLE_array = req.session.env['roles']
		ROLE_length = ROLE_array.length
		STATE_array = req.session.env['states']
		STATE_length = STATE_array.length
		STATUS_array = req.session.env['status']
		STATUS_length = STATUS_array.length
		
		STATES = ''
		STATUS = ''
	
		for(i = 0; i < STATE_length; i++){
			STATES += `<option value='${STATE_array[i]}'>${STATE_array[i]}</option>`
		}
		
		for(i = 1; i < STATUS_length; i++){
			STATUS_selected = ''
			if(2 == i){STATUS_selected='selected'}
			STATUS += `<option value='${STATUS_array[i]}' ${STATUS_selected}>${STATUS_array[i]}</option>`
		}
				
//		If the selected user is a higher role than the logged in user, disabled the field
//		This will also be filtered out by the server to prevent html injection
		ROLES = `<div class="text-muted"><select style="max-width:5rem;" id="intRole" name="intRole" type="text">`
		for(i = 0; i <= req.session.activeUser.intRole; i++){
			ROLE_selected = ''
			if(1 == i){ROLE_selected=' selected'}
			ROLES += `<option value='${i}'${ROLE_selected}>${ROLE_array[i]}</option>`
		}
		ROLES += '</select></div>';
		
//					If the selected user is a higher order than the logged in user, disabled the field
//					Similar logic as above
		ORDERS = `<div class="text-muted"><select style="max-width:5rem;" id="intOrder" name="intOrder" type="text">`
		ORDER_array = req.session.env.orders
		for(i = 0; i <= req.session.activeUser.intOrder; i++){
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
																<input style="max-width:47.5%" name="txtGivenName" placeholder="Given Name" type="text" required/>
																<input style="max-width:47.5%" name="txtSurname" placeholder="Surname" type="text" required/>
															</div>
														<br>Display Name
															<div class="lead"> 
																<input name="txtDisplayName" placeholder="Display Name" type="text" required/>
															</div>
														<br>Email
														<div class="text-muted">
															<div class="lead"> 
																<input style="width:100%;" name="txtEmail" placeholder="E-Mail" type="email""/>
															</div>
														</div>
														<br>GUID
															<div class="lead"> 
																<input style="width:100%;" name="txtGUID" placeholder="GUID / SSO" type="text"/>
															</div>
														<div class="row">
															<div class="col">
																<br>User Role
																${ROLES}
															</div>
															<div class="col">
																<br>Account Status
																<div class="text-muted">
																	<select style="max-width:5rem;" id="txtStatus" name="txtStatus" type="text">
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
															<input name="txtStreetAddress" placeholder="Address" type="text"/>
															<br>
															<input name="txtCity" placeholder="City" type="text"/>, <select id="txtState" name="txtState" type="text">${STATES}</select>
															<input name="txtPostalCode" placeholder="ZIP" type="number""/>
														</div>
														<br>Employment 
														<br>
														<div class="text-muted">
															<input placeholder="Title" name="txtJobTitle" type="text"/> in <input name="txtDepartment" placeholder="Department" type="text" style="width:75%;"/> at
															<br><input name="txtCompanyName" placeholder="Company" type="text" style="width:100%;"/><input name="intId" type="number" style="display:none;"/>
														</div>
														<br>Bio
														<br><span class="text-xsmall text-muted">Publicly visible if you were a chapter exec</span><br>
														<div class="lead">
															<textarea style="width:100%;" name="txtBio" placeholder="Biography" type="text"></textarea>
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
			
			for(i = 0; i < STATE_length; i++){
				STATE_selected = ''
				if(userData[k].txtState == STATE_array[i]){STATE_selected='selected'}
				STATES += `<option value='${STATE_array[i]}' ${STATE_selected}>${STATE_array[i]}</option>`
			}
			
			for(i = 1; i<STATUS_length; i++){
				STATUS_selected = ''
				if(userData[k].txtStatus == STATUS_array[i]){STATUS_selected='selected'}
				STATUS += `<option value='${STATUS_array[i]}' ${STATUS_selected}>${STATUS_array[i]}</option>`
			}
			
//					If the selected user is a higher role than the logged in user, disabled the field
//					This will also be filtered out by the server to prevent html injection
			ROLE_disabled = userData[k].intRole >= currentUser.intRole && !(currentUser.intRole = 4) ? ' disabled' : '' 
			ROLE_length = userData[k].intRole > currentUser.intRole ? userData[k].intRole : currentUser.intRole 
			ROLES = `<div class="text-muted"><select style="max-width:5rem;" id="intRole" name="intRole" type="text">`
			for(i = 0; i <= ROLE_length; i++){
				ROLE_selected = ''
				if(userData[k].intRole == i){
					ROLE_selected = ' selected'
					ROLE_disabled = ''
				}
				ROLES += `<option value='${i}'${ROLE_selected}${ROLE_disabled}>${ROLE_array[i]}</option>`
			}
			ROLES += '</select></div>'
			
//					If the selected user is a higher order than the logged in user, disabled the field
//					Similar logic as above
			ORDER_disabled = userData[k].intOrder >= currentUser.intOrder && !(currentUser.intRole = 4) ? ' disabled' : '' 
			ORDER_length = userData[k].intOrder > currentUser.intOrder ? userData[k].intOrder : currentUser.intOrder 
			ORDERS = `<div class="text-muted"><select style="max-width:5rem;" id="intOrder" name="intOrder" type="text">`
			ORDER_array = req.session.env.orders
			for(i = 0; i <= 4; i++){
				ORDER_selected = ''
				if(userData[k].intOrder == i){
					ORDER_selected = 'selected'
					ORDER_disabled = ''
				}
				ORDERS += `<option value='${i}'${ORDER_selected}${ORDER_disabled}>${ORDER_array[i]}</option>`
			}
			ORDERS += '</select></div>'

			DIRECTORY_array = req.session.env.inDirectory

			modals[k] = `<div class="modal fade" id="modal_${userData[k].txtGUID}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
																<input style="max-width:47.5%" name="txtGivenName" placeholder="Given Name" type="text" value="${userData[k].txtGivenName}" required/>
																<input style="max-width:47.5%" name="txtSurname" placeholder="Surname" type="text" value="${userData[k].txtSurname}" required/>
															</div>
														<br>Display Name
															<div class="lead"> 
																<input name="txtDisplayName" placeholder="Display Name" type="text" value="${userData[k].txtDisplayName}" required/>
															</div>	
														<br>Email
														<div class="text-muted">
															<div class="lead"> 
																<input style="width:100%;" name="txtEmail" placeholder="E-Mail" type="email" value="${userData[k].txtEmail}"/>
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
																<input style="width:100%;" name="txtNewGUID" placeholder="GUID / SSO" type="text" value="${userData[k].txtGUID}" required/>
																<input style="width:100%; display:none;" name="txtOldGUID" placeholder="GUID / SSO" type="text" value="${userData[k].txtGUID}"/>
															</div>
														<div class="row">
															<div class="col">
																<br>User Role
																${ROLES}
															</div>
															<div class="col">
																<br>Account Status
																<div class="text-muted">
																	<select style="max-width:5rem;" id="txtStatus" name="txtStatus" type="text">
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
												<h2 class="accordion-header" id="panelsStayOpen-headingThree${k}">
													<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree${k}" aria-expanded="false" aria-controls="panelsStayOpen-collapseThree${k}">
														Biography <span class="mx-1 text-muted" style="font-size:.85rem;"> (optional)</span>
													</button>
												</h2>
												<div id="panelsStayOpen-collapseThree${k}" class="accordion-collapse collapse" data-bs-parent="#editUserAccordion${k}" aria-labelledby="panelsStayOpen-headingThree${k}">
													<div class="accordion-body">Current Address<br><span class="text-xsmall text-muted">Private. Used for Alumni newsletter and outreach</span><br>
														<div class="lead">
															<input name="txtStreetAddress" placeholder="Address" type="text" value="${userData[k].txtStreetAddress}"/>
															<br>
															<input name="txtCity" placeholder="City" type="text" value="${userData[k].txtCity}"/>, <select id="txtState" name="txtState" type="text">${STATES}</select>
															<input name="txtPostalCode" placeholder="ZIP" type="number" value="${userData[k].txtPostalCode}"/>
														</div>
														<br>Employment<br>
														<div class="text-muted">
															<input placeholder="Title" name="txtJobTitle" type="text" value="${userData[k].txtJobTitle}"/> in <input name="txtDepartment" placeholder="Department" type="text" value="${userData[k].txtDepartment}" style="width:75%;"/> at
															<br><input name="txtCompanyName" placeholder="Company" type="text" value="${userData[k].txtCompanyName}" style="width:100%;"/><input name="intId" type="number" value="${userData[k].intId}" style="display:none;"/>
														</div>
														<br>Bio<br><span class="text-xsmall text-muted">Publicly visible if you were a chapter exec</span><br>
														<div class="lead">
															<textarea style="width:100%;" name="txtBio" placeholder="Biography" type="text" value="${userData[k].txtBio}">${userData[k].txtBio}</textarea>
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
				if(elem == 'intRole'){selectedUser.intRole = ROLE_array[selectedUser.intRole]}
				if(elem == 'intOrder'){selectedUser.intOrder = ORDER_array[selectedUser.intOrder]}
			}
		}
		
		res.render('pages/datatable', {
			env: req.session.env,
			activeUser: req.session.activeUser,
			isAuthenticated: req.oidc.isAuthenticated(),
			title:'Users',
			subtitle:'To update a field, click on the row you want to update and submit the form after updating any relevant information.',
			table:{
				buttons: buttonBar,
				order: [0,'asc'],
				columns: columns,
				data:userData,
				filterColumns: [],
				disableOrderColumns: [],
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
		insertQuery = `INSERT INTO tblUsers (txtDisplayName,txtGivenName,txtSurname,txtBio,txtEmail,intInDirectory, intOrder, intRole, txtStatus, txtStreetAddress, txtCity, txtState, txtPostalCode, txtJobTitle, txtDepartment, txtCompanyName) VALUES ("${req.body.txtDisplayName}","${req.body.txtGivenName}","${req.body.txtSurname}","${req.body.txtBio}","${req.body.txtEmail}",1,${req.body.intOrder},${req.body.intRole},"${req.body.txtStatus}","${req.body.txtStreetAddress}","${req.body.txtCity}","${req.body.txtState}","${req.body.txtPostalCode}","${req.body.txtJobTitle}","${req.body.txtDepratment}","${req.body.txtCompanyName}")`;
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
		const envQuery = `SELECT * FROM tblEnv`
		const envData = await queryPromise(envQuery)

		req.session.table = 'tblEnv'
		currentUser = req.session.activeUser
	
		content = []
		
		pageText = `Administrators can use this page to update environmental variables
			<div class="col-md-6 col-sm-12 mx-auto">
				<hr>
				<form class='plp-form' id='formUpdateSettings' method='post' action='/admin/settings'>`					
					envData.forEach(elem => {
						lineHeight = 28.8
//								Use this section to modify the data display depending on the object type. 
//								Obj, open a accordinans with input rows for Text/Arr input
//								Arr, open input rows for array values
						if(elem.txtType == "obj"){
		pageText += 		`<div class="row my-1 mx-auto"><div class="col-lg-2 col-sm-4 text-reset text-none"><label style="text-transform: capitalize;">${elem.txtKey}</label></div><div class="col-lg-10 col-sm-8 text-reset text-none"><textarea name="${elem.txtKey}" style="height:${lineHeight * 4}px; width:100%;">${elem.txtValue}</textarea></div></div><hr>`;
						} else if(elem.txtType == "arr"){
		pageText += 		`<div class="row my-1 mx-auto"><div class="col-lg-2 col-sm-4 text-reset text-none"><label style="text-transform: capitalize;">${elem.txtKey}</label></div><div class="col-lg-10 col-sm-8 text-reset text-none"><textarea name="${elem.txtKey}" style="height:${lineHeight * 2}px; width:100%;">${elem.txtValue}</textarea></div></div><hr>`;
						} else {
		pageText += 		`<div class="row my-1 mx-auto"><div class="col-lg-2 col-sm-4 text-reset text-none"><label style="text-transform: capitalize;">${elem.txtKey}</label></div><div class="col-lg-10 col-sm-8 text-reset text-none"><input name="${elem.txtKey}" style="width:100%;" value="${elem.txtValue}"/></div></div><hr>`;
						}
					})
		pageText += `
				</form>
			</div>
			<button form="formUpdateSettings" class="btn btn-success">Save Changes</button>`
		
		content.push({
			parallax: {
				rem:10, 
				url:"/res/stock/stage_amplifiers_01.jpg"
			}, 
			hero : {
				title:`<div>Settings</div>`, 
				content:pageText
			}
		})
		
		res.render("pages/basicText", { 
			env: req.session.env, 
			isAuthenticated: req.oidc.isAuthenticated(), 
			activeUser: req.session.activeUser,
			title:"Settings", 
			page:{content: content}
		})
	}
)

router.post("/settings",
	needsAuthenticated, // check if user is authenticated
    isAdmin, // check if user is admin
    async (req, res, next) => {
		console.log(req.body)
		for (const elem in req.body)
			queryPromise(`UPDATE tblEnv SET txtValue = "${req.body[elem]}" WHERE txtKey = "${elem}"`)

		req.session.env = ''
		res.redirect(`/admin/settings`)
	}
)

module.exports = router;