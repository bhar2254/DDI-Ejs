/*	users.js
	by Blaine Harper

	PURPOSE: router for about us UI interactions
*/	

const express = require('express')
const router = express.Router()
require('dotenv').config()
const {isAuthenticated, needsAuthenticated, isAdmin} = require('./utils/auth')
const {queryPromise} = require('./utils/SQLUtils')

topGap = '15'

const titleToRanking = (title) => {
	const titles = [
		'mas',
		'jou',
		'app',
		'nov'
	]
	title = title.substring(0,3).toLowerCase().padEnd(3, ' ')
	const position = titles.indexOf(title)
	return position >= 0 ? position : titles.length 
}

/* GET faq page. */
router.get('/faq',
	isAuthenticated,
	async (req, res, next) => {
		const query = `SELECT * FROM tblFAQ`
		data = await queryPromise(query)

		content = [{parallax: {rem:topGap, url:'/res/stock/stage_amplifiers_01.jpg'}, hero : {title:'FAQ', content:'Popular questions about Devil\'s Dive instruments and Harper\'s Guitars.'}}]
		for(i=0; i < data.length; i++){
			content.push({
				parallax: {
					rem:'10', 
					url:'/res/stock/stage_amplifiers_01.jpg'
				}, 
				hero : {
					title:data[i].txtQuery, content:`${data[i].txtResponse}`
				}
			})
		}

		res.render('pages/basicText', { 
			env: req.session.env, 
			isAuthenticated: req.oidc.isAuthenticated(), 
			activeUser: req.session.activeUser,
			title:'FAQ', 
			page:{content: content}
		})
	}
)

/* GET history page. */
router.get('/history',
	isAuthenticated,
	function(req, res, next){
	res.render('pages/basicText', { 
		env: req.session.env, 
		isAuthenticated: req.oidc.isAuthenticated(), 
		activeUser: req.session.activeUser,
		title:'History', 
		page:{
			content: [{
				parallax: {
					rem:topGap, 
					url:'/res/stock/stage_amplifiers_01.jpg'
				}, 
				hero : {
					title:'Our History', 
					content:`We've been interested in building instruments as long as we've been playing. Longer for some of us. Now that we've had some practice building guitars and eons of practice (or at least it feels like it) practicing scales, we want to share our creations with the world and hopefully bring the Harper sound to your home.`
				}
			},{
				parallax: {
					rem:'10', 
					url:'/res/stock/stage_amplifiers_01.jpg'
				}, 
				hero : {
					title:'Timeline', 
					content:`<iframe src='https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1MJaDzskNiVn5lPTwtAdwsclfgibALj3UxLZYUUUZz8Y&font=Default&lang=en&initial_zoom=2&height=650' width='100%' height='650' webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder='0'></iframe>`
				}
			}]
		}
	})
})

/* GET leadership page. */
router.get('/leadership',
	isAuthenticated,
	async (req, res, next) => {	
		const url_query = req.query
		const default_query = {
			year: '2019',
			chapter: '2'
		}
		const output_query = {
			...default_query,
			...url_query
		}
		
		// get the chapter names for populating the navbar
		const chapter_names_query = `SELECT intChapterId, txtName FROM tblChapters`
		// get the entire roster for populating the navbar
		const full_roster_query = `SELECT intRosterYear, intChapter FROM tblRoster WHERE txtTitle > '' ORDER BY intRosterYear DESC`
		// get the roster based on url params or default values for navbar
		const roster_query = `SELECT intId, txtTitle, intRosterYear FROM tblRoster WHERE intChapter = ${output_query.chapter} AND intRosterYear = ${output_query.year} AND txtTitle > '' ORDER BY intId`
		
		const chapter_names = await queryPromise(chapter_names_query)
		const full_roster = await queryPromise(full_roster_query)
		chapters = {}
		
		for(const index in chapter_names)
			chapters[chapter_names[index].intChapterId] = chapter_names[index].txtName
		
		// setup the roster navbar by filtering duplicates from each list and sending final object
		roster_nav = {
			intRosterYear: [],
			intChapter: []
		}
		
		for(const each of full_roster){
			roster_nav.intRosterYear.push(each.intRosterYear)
			roster_nav.intChapter.push(each.intChapter)
		}
		
		roster_nav = {
			intRosterYear: [...new Set(roster_nav.intRosterYear)],
			intChapter: [...new Set(roster_nav.intChapter)]
		}
		
		roster_nav_obj = {}
		for(i = 0; i < roster_nav.intChapter.length; i++){
			roster_nav_obj[roster_nav.intChapter[i]] = []
			for(j = 0; j < full_roster.length; j++)
				if(full_roster[j].intChapter == roster_nav.intChapter[i] && !roster_nav_obj[roster_nav.intChapter[i]].includes(full_roster[j].intRosterYear))
					roster_nav_obj[roster_nav.intChapter[i]].push(full_roster[j].intRosterYear)
		}

		const roster = await queryPromise(roster_query)
		
		console.log(roster)

		intIds = []
		for(const each of roster)
			intIds.push(each.intId)

		const user_query = `SELECT * FROM tblUsers WHERE intId IN (${intIds})`
		const users = await queryPromise(user_query)
		
		let data = []
		let userMap = {}

		for(const index in users)
			userMap[users[index].intId] = users[index]
		
		for(const index in roster)
			data.push({
				...roster[index],
				...userMap[roster[index].intId],
			})
			
		for(const index in data){
			ranking = titleToRanking(data[index].txtTitle)
			data[index].intOrdering = ranking
		}
		data.sort((a,b) => (a.intOrdering > b.intOrdering) ? 1 : ((b.intOrdering > a.intOrdering) ? -1 : 0))
		
		console.log(data)

		buttonBar = `<nav class="my-3 navbar navbar-expand-lg bg-dark rounded-pill bd-navbar shadow-lg"><div style="margin:auto;"><ul class="nav navbar-nav">`;
		
		Object.keys(roster_nav_obj).forEach(chapter => {
			buttonBar += `<li class="m-3 p-2 dropdown bg-secondary rounded nav-item bd-navbar shadow-lg"><a href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false" class="dropdown-toggle dropdown-item">${chapters[chapter]}<span class="caret"></span></a><ul role="menu" class="dropdown-menu">`;
			for(i=0; i<roster_nav_obj[chapter].length; i++){
				buttonBar += `<li class="nav-item"><a style="text-align:center;" href="/about/leadership?chapter=${chapter}&amp;year=${roster_nav_obj[chapter][i]}" class="nav-link ">${roster_nav_obj[chapter][i]}</a></li>`;
			}
			buttonBar += `</ul></li>`
		})
		buttonBar += `</ul></div></nav>`
		
		content = [{parallax: {rem:topGap, url:'/res/stock/stage_amplifiers_01.jpg'}, hero : {title:`<span class="text-muted" style="font-size:2rem;">${chapters[output_query.chapter]} Chapter ${output_query.year}</span><br>Leadership`, content:`These are the men who lead within Phi Lambda Phi.<br>${buttonBar}`}}]
		
		for(const elem of data)
			content.push({
				parallax: {
					rem:'7',
					url:'/res/stock/stage_amplifiers_01.jpg'
				}, hero: {
					title:`
						<span class="text-muted" style="font-size:2rem;">${elem.txtTitle}</span>  
						<br>${elem.txtGivenName}  ${elem.txtSurname}`, 
					content:`
						<div class="row">
							<div class="col-md-6 col-sm-8 my-auto">
								<img class="my-3 shadow-lg rounded-circle" style="max-width:15rem;" src="/res/app/photos/composite/${elem.intChapter}/${elem.intRosterYear}/${elem.intId}.png"><br></div>
							<div class="col-md-6 col-sm-8 my-auto">Enrollment<div class="lead">${elem.txtRecruitTerm} ${elem.intRecruitYear} - ${elem.intGradYear} ${elem.txtGradTerm}</div>
							<br>Biography<br><div class="lead">${elem.txtBio}</div>
						</div>
					</div>`
				}
			})
		
		res.render('pages/basicText', { 
			env: req.session.env, 
			isAuthenticated: req.oidc.isAuthenticated(), 
			activeUser: req.session.activeUser,
			title:'Leadership', 
			page:{content: content}
		})
	}
)

module.exports = router