/*	users.js
	by Blaine Harper

	PURPOSE: router for about us UI interactions
*/

const express = require('express')
const router = express.Router()
const { isAuthenticated } = require('./utils/auth')
const { titleToRanking } = require('./utils/@bhar2254/frat-cms-handler')
const { queryPromise } = require('@bhar2254/mysql')

topGap = '15'

/* GET chapters page. */
router.get('/chapters',
	isAuthenticated,
	async (req, res, next) => {
		const query = `SELECT * FROM chapters`

		data = await queryPromise(query)

		buttonBar = '<div id="Alumni" class="my-3 btn-group" role="group" aria-label="chapter_buttons">'
		for (i = 0; i < data.length; i++)
			buttonBar += `<a class="btn btn-secondary" href="#${data[i].txtName}">${data[i].txtName}</a>`

		buttonBar += '</div>'
		content = [
			{
				parallax: {
					rem: topGap,
					url: '/res/stock/stage_amplifiers_02.webp'
				},
				hero: {
					title: 'Chapters',
					content: 'Devil\'s Dive Luthiers have one active chapter located in Eagle Rock, MO.<br>' + buttonBar
				}
			}
		]
		for (i = 0; i < data.length; i++) {
			if (data[i].txtName == 'Alumni') {
				content.push({
					parallax: {
						rem: '17',
						url: '/res/stock/stage_amplifiers_02.webp'
					},
					hero: {
						title: data[i].txtName + ` Chapter`,
						content: `
							<div class='row' id='${data[i].txtName}'>
								<script>
									addEventListener("load", (event) => {
										$('html, body').animate({
											scrollTop: $("#${req.query.chapter}").offset().top
										}, 2000)
									})
								</script>
								<div class='col my-auto'>
									${data[i].txtDesc}
									<br><br>
									<b>President</b> | PLACEHOLDER
								</div>
							</div>
							<span id='${data[i + 1].txtName}'></span>
						`
					}
				})
			} else if (i == data.length - 1) {
				content.push({
					parallax: {
						rem: '17',
						url: '/res/stock/stage_amplifiers_02.webp'
					},
					hero: {
						title: data[i].txtName + ` Chapter`,
						content: `<div class='row'><div class='col my-auto'>${data[i].txtDesc}<br><br><b>President</b> | PLACEHOLDER <br><br><b>Local Address</b> | ${data[i].txtAddress}</div><div class='col'><div class="embed-responsive embed-responsive-1by1"><iframe src="${data[i].txtMapEmbed}" style="border:0; height:20rem; width:100%;" loading="lazy", referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></div>`
					}
				})
			} else {
				content.push({
					parallax: {
						rem: '17',
						url: '/res/stock/stage_amplifiers_02.webp'
					},
					hero: {
						title: data[i].txtName + ` Chapter`, content: `<div class='row'><div class='col my-auto'>${data[i].txtDesc}<br><br><b>President</b> | PLACEHOLDER <br><br><b>Local Address</b> | ${data[i].txtAddress}</div><div class='col'><div class="embed-responsive embed-responsive-1by1"><iframe src="${data[i].txtMapEmbed}" style="border:0; height:20rem; width:100%;" loading="lazy", referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></div><span id='${data[i + 1].txtName}'></span>`
					}
				})
			}
		}
		res.render('pages/basicText', {
			env: req.env,
			isAuthenticated: req.oidc.isAuthenticated(),
			activeUser: req.activeUser,
			title: 'Chapters',
			page: { content: content }
		})
	}
)

/* GET faq page. */
router.get('/faq',
	isAuthenticated,
	async (req, res, next) => {
		const query = `SELECT * FROM faq`
		data = await queryPromise(query)

		content = [{ parallax: { rem: topGap, url: '/res/stock/stage_amplifiers_02.webp' }, hero: { title: 'FAQ', content: 'Popular questions about Devil\'s Dive and our luthier process.' } }]
		for (i = 0; i < data.length; i++) {
			content.push({
				parallax: {
					rem: '10',
					url: '/res/stock/stage_amplifiers_02.webp'
				},
				hero: {
					title: data[i].query, content: `${data[i].txtResponse}`
				}
			})
		}

		res.render('pages/basicText', {
			env: req.env,
			isAuthenticated: req.oidc.isAuthenticated(),
			activeUser: req.activeUser,
			title: 'FAQ',
			page: { content: content }
		})
	}
)

/* GET history page. */
router.get('/history',
	isAuthenticated,
	function (req, res, next) {
		res.render('pages/basicText', {
			env: req.env,
			isAuthenticated: req.oidc.isAuthenticated(),
			activeUser: req.activeUser,
			title: 'History',
			page: {
				content: [{
					parallax: {
						rem: topGap,
						url: '/res/stock/stage_amplifiers_02.webp'
					},
					hero: {
						title: 'History',
						content: `Our history of building and enjoying quiality guitars.`
					}
				}, {
					parallax: {
						rem: '10',
						url: '/res/stock/stage_amplifiers_02.webp'
					},
					hero: {
						title: 'Timeline',
						content: `<iframe src='https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1MJaDzskNiVn5lPTwtAdwsclfgibALj3UxLZYUUUZz8Y&font=Default&lang=en&initial_zoom=2&height=650' width='100%' height='650' webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder='0'></iframe>`
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
			year: '2024',
			chapter: '2'
		}
		const output_query = {
			...default_query,
			...url_query
		}

		// get the chapter names for populating the navbar
		const chapter_names_query = `SELECT id AS chapter_id, name FROM chapters`
		// get the entire roster for populating the navbar
		const full_roster_query = `SELECT year, chapter_id FROM viewroster WHERE title > '' ORDER BY year DESC`
		// get the roster based on url params or default values for navbar
		const roster_query = `SELECT * FROM viewroster WHERE chapter_id = ${output_query.chapter} AND year = ${output_query.year} AND title > '' ORDER BY id`

		const chapter_names = await queryPromise(chapter_names_query)
		const full_roster = await queryPromise(full_roster_query)
		chapters = {}

		for (const index in chapter_names)
			chapters[chapter_names[index].chapter_id] = chapter_names[index].name

		// setup the roster navbar by filtering duplicates from each list and sending final object
		roster_nav = {
			year: [],
			chapter_id: []
		}

		for (const each of full_roster) {
			roster_nav.year.push(each.year)
			roster_nav.chapter_id.push(each.chapter_id)
		}

		roster_nav = {
			year: [...new Set(roster_nav.year)],
			chapter_id: [...new Set(roster_nav.chapter_id)]
		}

		roster_nav_obj = {}
		for (i = 0; i < roster_nav.chapter_id.length; i++) {
			roster_nav_obj[roster_nav.chapter_id[i]] = []
			for (j = 0; j < full_roster.length; j++)
				if (full_roster[j].chapter_id == roster_nav.chapter_id[i] && !roster_nav_obj[roster_nav.chapter_id[i]].includes(full_roster[j].year))
					roster_nav_obj[roster_nav.chapter_id[i]].push(full_roster[j].year)
		}

		const roster = await queryPromise(roster_query)

		ids = []
		for (const each of roster)
			ids.push(each.user_id)

		let data = roster
		for (const index in roster) {
			const ranking = titleToRanking(data[index].title)
			data[index].ordering = ranking
		}
		data.sort((a, b) => (a.ordering > b.ordering) ? 1 : ((b.ordering > a.ordering) ? -1 : 0))

		buttonBar = `
				<nav class="my-3 navbar navbar-expand-lg bg-dark rounded-pill bd-navbar shadow-lg"><div style="margin:auto;"><div class="btn-group">`;

		Object.keys(roster_nav_obj).forEach(chapter => {
			buttonBar += `
				<btn class="btn dropdown bg-secondary bd-navbar shadow-lg">
					<a href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false" class="dropdown-toggle dropdown-item">
						${chapters[chapter]}
						<span class="caret"></span>
					</a>
					<ul role="menu" class="dropdown-menu">`;
			for (i = 0; i < roster_nav_obj[chapter].length; i++) {
				buttonBar += `
						<li>
							<a style="text-align:center;" href="/about/leadership?chapter=${chapter}&amp;year=${roster_nav_obj[chapter][i]}" class="nav-link ">
								${roster_nav_obj[chapter][i]}
							</a>
						</li>`;
			}
			buttonBar += `
					</ul>
				</btn>`
		})
		buttonBar += `</div></nav>
				<div class="mx-auto col-2">
					<div class="form-check form-switch">
						<input class="form-check-input" type="checkbox" role="switch" id="sliderToggleAll">
						<label class="form-check-label text-muted" for="sliderToggleAll">Toggle all sliders</label>
					</div>
				</div>`

		content = [{ parallax: { rem: topGap, url: '/res/stock/stage_amplifiers_02.webp' }, hero: { title: `<span class="text-muted" style="font-size:2rem;">${chapters[output_query.chapter]} Chapter ${output_query.year}</span><br>Leadership`, content: `Our leaders at Devil\'s Dive Luthiers<br>${buttonBar}` } }]


		for (const elem of data) {
			const bio = elem.bio ? `Biography<br><div class="lead">${elem.bio}</div>` : ``
			const composite_base = `/res/default_comp/app/photos/composite`
			const user_defined = `/${elem.chapter_id}/${elem.year}/${elem.user_id}`
			const profile = `/res/default_profile/app/photos/profile/${elem.user_guid}.webp`
			const composite_link = `${composite_base}${user_defined}`
			let left = true

			if (elem.user_name)
				content.push({
					parallax: {
						rem: '7',
						url: '/res/stock/stage_amplifiers_02.webp'
					}, hero: {
						title: `
							<span class="text-muted" style="font-size:2rem;">${elem.title}</span>  
							<br>${elem.user_name}`,
						content: `
							<div class="row">
								<div style="min-height:300px" class="mx-auto col-md-6 col-sm-8 my-auto">
									<div style="max-width:300px" class="mx-auto img-comp-container">
										<div class="img-comp-img">
											<img width="300" height="300" style="object-fit: cover; overflow: hidden;" class="mx-auto rounded-circle" src="${composite_link}.webp" alt="composite photo">
										</div>
										<div class="img-comp-img img-comp-overlay">
											<img width="300" height="300" style="object-fit: cover; overflow: hidden;" class="mx-auto rounded-circle" src="${profile}"  alt="current profile image">
										</div>
									</div>
								</div>
								<div class="mx-auto col-md-6 col-sm-8 my-auto">
									${bio}
								</div>
							</div>`
					}
				})
		}

		res.render('pages/basicText', {
			env: req.env,
			isAuthenticated: req.oidc.isAuthenticated(),
			activeUser: req.activeUser,
			title: 'Leadership',
			page: { content: content }
		})
	}
)

/* GET leadership page. */
router.get('/luthiers',
	isAuthenticated,
	async (req, res, next) => {
		const url_query = req.query
		const default_query = {
			year: '2024',
			chapter: '2'
		}
		const output_query = {
			...default_query,
			...url_query
		}

		// get the chapter names for populating the navbar
		const chapter_names_query = `SELECT id AS chapter_id, name, campus_address FROM chapters`
		// get the entire roster for populating the navbar
		const full_roster_query = `SELECT year, chapter_id FROM viewroster ORDER BY year DESC`
		// get the roster based on url params or default values for navbar
		const roster_query = `SELECT * FROM viewroster WHERE chapter_id = ${output_query.chapter} AND year = ${output_query.year} ORDER BY id`

		const chapter_names = await queryPromise(chapter_names_query)
		const full_roster = await queryPromise(full_roster_query)
		chapters = {}

		for (const index in chapter_names)
			chapters[chapter_names[index].chapter_id] = chapter_names[index].name

		const {campus_address = 'Eagle Rock, MO'} = chapters[output_query.chapter]

		// setup the roster navbar by filtering duplicates from each list and sending final object
		roster_nav = {
			year: [],
			chapter_id: []
		}

		for (const each of full_roster) {
			roster_nav.year.push(each.year)
			roster_nav.chapter_id.push(each.chapter_id)
		}

		roster_nav = {
			year: [...new Set(roster_nav.year)],
			chapter_id: [...new Set(roster_nav.chapter_id)]
		}

		roster_nav_obj = {}
		for (i = 0; i < roster_nav.chapter_id.length; i++) {
			roster_nav_obj[roster_nav.chapter_id[i]] = []
			for (j = 0; j < full_roster.length; j++)
				if (full_roster[j].chapter_id == roster_nav.chapter_id[i] && !roster_nav_obj[roster_nav.chapter_id[i]].includes(full_roster[j].year))
					roster_nav_obj[roster_nav.chapter_id[i]].push(full_roster[j].year)
		}

		const roster = await queryPromise(roster_query)

		ids = []
		for (const each of roster)
			ids.push(each.user_id)

		let data = roster
		for (const index in roster) {
			const ranking = titleToRanking(data[index].title)
			data[index].ordering = ranking
		}
		data.sort((a, b) => (a.ordering > b.ordering) ? 1 : ((b.ordering > a.ordering) ? -1 : 0))

		buttonBar = `<nav class="my-3 navbar navbar-expand-lg bg-dark rounded-pill bd-navbar shadow-lg"><div style="margin:auto;"><div class="btn-group">`;

		Object.keys(roster_nav_obj).forEach(chapter => {
			buttonBar += `
				<btn class="btn dropdown bg-secondary bd-navbar shadow-lg">
					<a href="#" data-bs-toggle="dropdown" role="button" aria-expanded="false" class="dropdown-toggle dropdown-item">
						${chapters[chapter]}
						<span class="caret"></span>
					</a>
					<ul role="menu" class="dropdown-menu">`;
			for (i = 0; i < roster_nav_obj[chapter].length; i++) {
				buttonBar += `
						<li>
							<a style="text-align:center;" href="/about/luthiers?chapter=${chapter}&amp;year=${roster_nav_obj[chapter][i]}" class="nav-link ">
								${roster_nav_obj[chapter][i]}
							</a>
						</li>`;
			}
			buttonBar += `
					</ul>
				</btn>`
		})
		buttonBar += `</div></nav>`

		content = [{ parallax: { rem: topGap, url: '/res/stock/stage_amplifiers_02.webp' }, hero: { title: `<span class="text-muted" style="font-size:2rem;">${chapters[output_query.chapter]} Chapter ${output_query.year}</span>
			<br>Our Luthiers`, content: `These are the people who have participated in our history of quality craftsmanship<br>${buttonBar}` } }]

		const images = []
		let vp_break = false
		let exec_break = false

		for (const elem of data) {
			const nickname = elem.user_nickname ? ` (${elem.user_nickname})` : ``
			const name = elem.user_name ? `<h4>${elem.user_name}${nickname}</h4>` : ``
			const title = elem.title ? `<h3>${elem.title}</h3>` : ``
			const composite_base = `/res/default_comp/app/photos/composite`
			const user_defined = `/${elem.chapter_id}/${elem.year}/${elem.user_id}`
			const profile = `/res/default_profile/app/photos/profile/${elem.user_guid}.webp`
			const composite_link = `${composite_base}${user_defined}`

			if(!vp_break && !elem.title.toLowerCase().includes('pres')){
				images.push('<br>')
				vp_break = true
			}
			if(!exec_break && !elem.title) {
				images.push('<br>')
				exec_break = true
			}	

			images.push(`<div style="min-height:200px" class="mx-auto  col-md-3 col-sm-4 my-auto">
							<div style="max-width:200px" class="mx-auto img-comp-container">
								<div class="img-comp-img">
									<img width="200" height="200" style="object-fit: cover; overflow: hidden;" class="mx-auto rounded-circle" src="${composite_link}.webp" alt="composite photo">
								</div>
								<div class="img-comp-img img-comp-overlay">
									<img width="200" height="200" style="object-fit: cover; overflow: hidden;" class="mx-auto rounded-circle" src="${profile}"  alt="current profile image">
								</div>
							</div>
							<div class="col">
								${title}
								${name}
								<div class="lead">
									${elem.recruit_term || ''} ${elem.recruit_year || 'NA'} - ${elem.grad_year || ''} ${elem.grad_term || 'NA'}
								</div>
							</div>
						</div>`)
				
		}

		content.push({
			parallax: {
				rem: '7',
				url: '/res/stock/stage_amplifiers_02.webp'
			}, hero: {
				title: `
					<span class="text-muted" style="font-size:2rem;">Devil's Dive Luthiers</span>
					<div class="lead">${campus_address}</div>`,
				content: `<div class="row">
						<div class="mx-auto col-2">
							<div class="form-check form-switch">
								<input class="form-check-input" type="checkbox" role="switch" id="sliderToggleAll">
								<label class="form-check-label text-muted" for="sliderToggleAll">Toggle all sliders</label>
							</div>
						</div>
					</div>
					<div class="row mt-3">${images.join(' ')}</div>`
				}
			})
		return res.render('pages/basicText', {
			env: req.env,
			isAuthenticated: req.oidc.isAuthenticated(),
			activeUser: req.activeUser,
			title: 'Our Luthiers',
			page: { content: content }
		})
	}
)

module.exports = router