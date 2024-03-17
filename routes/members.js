/*	members.js
	by Blaine Harper

	PURPOSE: router for member UI interactions
*/	

const express = require('express')
const router = express.Router()
const fs = require('fs')
const {isAuthenticated, needsAuthenticated, isAdmin} = require('./utils/auth')

/* GET manual pdf. */
router.get('/manual',
    needsAuthenticated, // check if user is authenticated
	function(req, res, next){
		const file = fs.createReadStream('./bin/pdfs/PLP_Manual.pdf')
		const stat = fs.statSync('./bin/pdfs/PLP_Manual.pdf')
		res.setHeader('Content-Length', stat.size)
		res.setHeader('Content-Type', 'application/pdf')
		res.setHeader('Content-Disposition', 'inline; filename=PLP_Manual.pdf')
		file.pipe(res)
})		
			
/* GET education pdf*/
router.get('/education',
	needsAuthenticated, // check if user is authenticated
	function(req, res, next){
		const file = fs.createReadStream('./bin/pdfs/Education_Binder.pdf')
		const stat = fs.statSync('./bin/pdfs/Education_Binder.pdf')
		res.setHeader('Content-Length', stat.size)
		res.setHeader('Content-Type', 'application/pdf')
		res.setHeader('Content-Disposition', 'inline; filename=Education_Binder.pdf')
		file.pipe(res)
})

/* GET home page. */
router.get('/mine/java', 
	needsAuthenticated, // check if user is authenticated
	function(req, res, next){
//		Put Buttons in Subcontent
		subcontent = `<div class="mb-3">The Phi Lamb Minecraft servers can be accessed at mine.philamb.info!</div>
					<div class="row">
						<form  target="dummyFrame" id="dummyForm" method="post" style="display: none;"></form>
						<div class="col-md-6 col-12 my-2 offset-md-3">
							<div class="row py-3">
								<iframe name="dummyFrame" id="dummyFrame" style="height:5rem;"></iframe>
							</div>
							<div class="row py-3">
								<div class="mb-3">
									User Input
								</div><hr>
								<div class="row">
									<form target="dummyFrame" id="userInput" method="get" class="plp-form">
										<input class="mb-3" id="userInputField" style="width:100%;" name="command" type="text"></input>
										<div class="btn-group" role="group" aria-label="Basic example">										
											<button onClick="$('#dummyFrame').show()" formaction="https://mine-rcon.philamb.info/java" type="submit" form="userInput" class="btn btn-danger" id="btnCommandUserInput">Submit</button>			
										</div>
									</form>
								</div>
							</div>
							<div class="row py-3">
								<div class="mb-3">
									Server Commands
								</div><hr>
								<div class="row">
									<div class="btn-group" role="group">										
										<button formaction="https://mine-rcon.philamb.info/java?command=/save-all" type="submit" form="dummyForm" class="btn btn-primary" id="btnCommandSaveAll">Save All</button>	
										<button formaction="https://mine-rcon.philamb.info/java?command=/list" type="submit" form="dummyForm" class="btn btn-secondary" id="btnCommandList">List</button>	
										<button formaction="https://mine-rcon.philamb.info/java?command=/stop" type="submit" form="dummyForm" class="btn btn-danger" id="btnCommandStop">STOP</button>		
									</div>
								</div>
							</div>
							<div class="row py-3">
								<div class="mb-3">
									Time Commands
								</div><hr>
								<div class="row">
									<div class="btn-group" role="group" aria-label="Basic example">										
										<button formaction="https://mine-rcon.philamb.info/java?command=/time%20set%20day" type="submit" form="dummyForm" class="btn btn-primary" id="btnCommandMorning">Morning</button>			
										<button formaction="https://mine-rcon.philamb.info/java?command=/time%20set%20noon" type="submit" form="dummyForm" class="btn btn-warning" id="btnCommandNoon">Noon</button>			
										<button formaction="https://mine-rcon.philamb.info/java?command=/time%20set%20night" type="submit" form="dummyForm" class="btn btn-dark" id="btnCommandNight">Night</button>
									</div>
								</div>
							</div>
							<div class="row py-3">
								<div class="mb-3">
									Weather Controls
								</div><hr>
								<div class="row">
									<div class="btn-group" role="group" aria-label="Basic example">										
										<button formaction="https://mine-rcon.philamb.info/java?command=/weather%20clear" type="submit" form="dummyForm" class="btn btn-secondary" id="btnCommandWeatherClear">Clear</button>			
										<button formaction="https://mine-rcon.philamb.info/java?command=/weather%20rain" type="submit" form="dummyForm" class="btn btn-primary" id="btnCommandWeatherRain">Rain</button>			
										<button formaction="https://mine-rcon.philamb.info/java?command=/weather%20thunder" type="submit" form="dummyForm" class="btn btn-warning" id="btnCommandWeatherThunder">Thunder</button>	
									</div>
								</div>
							</div>
						</div>
						<div class="col-md-3 col-12">
							<div id="alertTimePlaceholder"></div>
						</div>
					</div>
					
					<script>
						const appendAlert = (placeholder, message, type) => {
							const wrapper = document.createElement('div')
							wrapper.innerHTML = [
								'<div class="alert alert-'+type+' alert-dismissible" role="alert">',
								'   <div>'+message+'</div>',
								'   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
								'</div>'
							].join('')

							placeholder.append(wrapper)
						}
						
						const addTrigger = (placeholder, trigger, message, type) => {
							if (trigger){
								trigger.addEventListener('click', () => {
									appendAlert(placeholder, message, type)
								})
							}		
						}

						const alertPlaceholder = document.getElementById('alertTimePlaceholder')
						
//						Server Commands
						
						var alertTrigger = document.getElementById('btnCommandSaveAll')
						addTrigger(alertPlaceholder, alertTrigger, 'Server saving!', 'success')
						var alertTrigger = document.getElementById('btnCommandStop')
						addTrigger(alertPlaceholder, alertTrigger, 'Server shutting down!', 'success')
						
//						Time Commands

						var alertTrigger = document.getElementById('btnCommandMorning')
						addTrigger(alertPlaceholder, alertTrigger, 'Server time set to Morning!', 'success')
						alertTrigger = document.getElementById('btnCommandNoon')
						addTrigger(alertPlaceholder, alertTrigger, 'Server time set to Noon!', 'success')	
						alertTrigger = document.getElementById('btnCommandNight')
						addTrigger(alertPlaceholder, alertTrigger, 'Server time set to Night!', 'success')
						
//						Weather Commands
						
						var alertTrigger = document.getElementById('btnCommandWeatherClear')
						addTrigger(alertPlaceholder, alertTrigger, 'Server weather set to clear!', 'success')
						var alertTrigger = document.getElementById('btnCommandWeatherRain')
						addTrigger(alertPlaceholder, alertTrigger, 'Server weather set to rainy!', 'success')
						var alertTrigger = document.getElementById('btnCommandWeatherThunder')
						addTrigger(alertPlaceholder, alertTrigger, 'Server weather set to thunderstorms!', 'success')
					</script>`
		content = [
			{
				parallax: {
					rem:'10', 
					url:'/res/stock/stage_amplifiers_01.jpg'
				}, 
				hero : {
					title:'<div>Server Commands</div>', 
					content:subcontent
				}
			}
		]
		
		res.render('pages/basicText', { 
			env: req.session.env,
			activeUser: req.session.activeUser,
			isAuthenticated: isAuthenticated,
			title:'Commands', 
			page:{
				content: content
		}
	})
})

/* GET composite page. */
router.get('/composite',
    needsAuthenticated, // check if user is authenticated
	function(req, res, next){
		res.render('composite', { 
			env: req.session.env, 
			isAuthenticated: req.oidc.isAuthenticated(),  
			activeUser: req.session.activeUser,
			title: 'Composites', 
			subtitle: 'Here are the brothers who have made up Phi Lamb over the years.', 
		})
})

module.exports = router