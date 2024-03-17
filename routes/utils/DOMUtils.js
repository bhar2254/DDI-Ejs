/*	DOMUtils.js

	For Indian Hills Community College
	Parking On Hills, https://parking.indianhils.edu
	by Blaine Harper

	PURPOSE: Useful functions and variables used throughout the application
*/

/*	Custom classes

#	General
	-	Color(hex)
		>	Used for chart generation and general color manipulation.
		>	Not used for DOM, that's done through CSS
	
#	DOM
	-	Button(id, text, onclick, classes)
		>	Adding prefab HTML buttons to pass to templates
	-	ButtonBar(...)	#	TBD
		>	Prefab button bar for HTML templating
	-	Modal(id, title, subtitle, content, buttons)
		>	Prefab HTML modal for passing to templates

module exports 
//	Environment
	colors: {
		'ihcc_red': new Color("782F40"),
		'ihcc_yellow': new Color("FFA400"),
		'ihcc_grey': new Color("776E64"),
		'grey': new Color("949FB1"),
		'yellow': new Color("FDB45C"),
		'red': new Color("F7464A"),
		'green': new Color("8ab28a"),
		'charcoal': new Color("4D5360")
	},
	Button: Button,
	Modal: Modal,
	DataTable: DataTable,
//	PDF Generation
	savePdfToFile: savePdfToFile
*/

class Color {
	constructor(hex){
		this.__hoverMultiplier = 1.25
		this._hex = hex.toUpperCase()
		this._red = this._hex.substring(0,2)
		this._green = this._hex.substring(2,4)
		this._blue = this._hex.substring(4,6)
	}
//	Modify the brightness of a 2 digit hex
	brightnessSingle(hex, brightness){
		let output = parseInt(hex, 16)
//		Change brightness
		output = Math.floor(output * brightness)
//		Account for white/black limits
		output = output > 255 ? output = 255: output
		output = output < 0 ? output = 0: output
//		Concat, convert, and return
		output = output.toString(16).toUpperCase().padStart(2,'0')
		return output
  	}
//	Modify the brightness of an n*2 digit hex
	brightness(hex, bright){
		let arr = []
		let strOutput = ''
//		Split the incoming values into 2 digit hexes
		for(let i=0;i<hex.length-1;i+=2)
			arr.push(hex[i] + hex[i+1])
//		This creates an array of values to brighten
		arr.forEach(value => {
			strOutput += this.brightnessSingle(value, bright)
		})
		return strOutput
	}
	getHoverColor(hex){
		return this.brightness(this._hex, this.__hoverMultiplier)
	}
	getRGB(){
		return [this._red, this._green, this._blue]
	}
	getHex(){
		return '#' + this._hex
	}
	getRawHex(){
		return this._hex
	}
	getHover(){
		return '#' + this.brightness(this._hex, this.__hoverMultiplier)
	}
	getRawHover(){
		return this.brightness(this._hex, this.__hoverMultiplier)
	}
	setHex(hex){
		this._hex = hex.toUpperCase()
	}
}

/*	Class for creating buttons used in modals and around the site	*/
class Button {
	constructor(id, text, onclick, classes){
		this.id=id
		this.buttonText=text
		this.onclickAction=onclick
		
		this.isSubmit=false
		this.round=false
		this.classes=['btn','poh-primary'].concat(classes)
		this.classesString=''
		this.form = ''
		this.style=''
		this.modalLink=''
	}
	linkModal(modalId){
		this.modalLink=` data-bs-toggle="modal" data-bs-target="#${modalId}" `
		return modalId
	}
	set form(formId){
		this._form = formId !== 'undefined' ? ` form="${formId}" ` : ``
		return this._form
	}
	get form(){
		return this._form
	}
	set isSubmit(bool){
		this.type = bool ? 'type="submit"' : 'type="button"'
		return this._isSubmit = bool 
	}
	get isSubmit(){
		return this._isSubmit
	}
	setColor(option){
		let colorOptions = {
			'secondary':'poh-secondary',
			'sand':'poh-sand'
		}

	//	remove old colors
		for(const each of Object.values(colorOptions))
			this.removeCSS(each)
		
	//	set current color
		this.addCSS(colorOptions[option] || 'poh-primary')
		
		return this.classes
	}
	removeCSS(cssClass){
		let i = this.classes.indexOf(cssClass)
		if(i !== -1)
			this.classes.splice(i, 1)
		return this.classes
	}
	addCSS(cssClass){
		let i = this.classes.indexOf(cssClass)
		if(i === -1)
			this.classes.push(cssClass)
		return this.classes
	}
	removeRound(){
		this.removeCSS('rounded-0')
		this.addCSS('rounded-0')
	}
	removeMargin(){
		this.removeCSS('m-3')
	}
	buildClass(){
		this.classesString=''
		for(let i=0;i<this.classes.length;i++){
			this.classesString += ' ' + this.classes[i]
		}
	}	
	print(){
		this.buildClass()
		let clickAction = ""
		if(this.onclickAction !== undefined){
			clickAction = `onclick="${this.onclickAction}"`
		}
		return this.output=`<button ${clickAction} ${this.form} ${this.type} id="${this.id}" ${this.modalLink} ${this.style} class="${this.classesString}">${this.buttonText}</button>`
	}
	addMargin(){
		this.classes.push('m-3')
	}
	square(){
		this.removeCSS('rounded')
		this.addCSS('rounded-0')
		this.style=''
		return this.print()
	}
	rounded(){
		this.removeCSS('rounded-0')
		this.addCSS('rounded')
		return this.print()
	}
	leftCap(){
		this.removeCSS('rounded')
		this.removeCSS('rounded-0')
		this.style=`style="border-radius: 32px 0 0 32px;"`
		return this.print()
	}
	rightCap(){
		this.removeCSS('rounded-0')
		this.removeCSS('rounded')
		this.style=`style="border-radius: 0 32px 32px 0;"`
		return this.print()
	}
	printSubmit(){
		this.isSubmit=true
		return this.print()
	}
}

/*	Class for creating buttons used in modals and around the site	*/
//	Can include modals to allow buttons to trigger custom modals
class ButtonBar {
	constructor(arrButtons){
		this.buttonList=arrButtons
	}
	static Button = class {
		constructor(){

		}
	}
}

/*	Used for creating general modals and displaying them on the page.	*/
class Modal {
	constructor(id, title, subtitle, content, buttons){
	//	set the user_id for the load function
		this.id=id
		this.title=title
		this.subtitle=subtitle
		this.content=content
		this.buttons = buttons || ''
		this.buttons=this.closeButton + this.buttons 
	}
	get closeButton(){
		this.close = this.close || `<button type="button" class="btn btn-secondary mx-1 rounded" data-bs-dismiss="modal">Close</button>`
		return this.close
	}
	get print(){
		this._outerHtml
	}
	get outerHtml(){
		return this._outerHtml = `<div id="${this.id}" class="modal fade" id="generalModal" tabindex="-1" aria-labelledby="generalModalLabel" aria-hidden="true">
			<div id="${this.id}_dialog" class="modal-dialog  modal-dialog-centered">
				<div id="${this.id}_content" class="modal-content">
					<div id="${this.id}_header" class="modal-header poh-primary card shadow-lg" style="border-radius: 6px 6px 0 0;">
						<button type="button" class="btn-close btn-close-light-grey" data-bs-dismiss="modal" aria-label="Close"></button>
						<div id="${this.id}_header_text" class='fs-3 modal-title'>${this.title}</div>
						<div class="text-center" id="${this.id}_header_subtext">${this.subtitle}</div>
					  </div>
					<div id="${this.id}_body" class="modal-body m-3">
						${this.content}
					</div>
					<div id="${this.id}_footer" class="modal-footer text-center poh-primary" style="border-radius: 0 0 6px 6px;">
						<div id="${this.id}_buttons" class="btn-group">
							${this.buttons}
						</div>
					</div>
				</div>
			</div>
		</div>`
	}
}

class onLoadModal extends Modal {
	constructor(title, subtitle, content, buttons){
		super('modalOnLoad', title, subtitle, content, buttons)
	}
}

class Form extends Modal {
	constructor(id, title, subtitle, data, table, buttons, scope, action){
		if(table == 'users') 
			subtitle = 'Users must at least have an IHCC ID. <br> Display Name and Email will sync with MS when they first log in. <br> If new student / emploee\'s do not have an IHCC ID, contact IT before creating an account.'
		super(id, title || '', subtitle || '', '', buttons || '')
		this.table = table || ''
		this.data = data
		this.scope = scope || 1
		this.formId = id + '_form'
		this.action = action || `/?table=${table}`
		this.buttons += this.submitButton
		this.new_form = false
		this.innerHtml()
	}
	static generateNewForm(table, scope, defaultData = {}){
		let formData = {}
		let dropData = {
			'users':[],
			'vehicles':['pass_num','pass_type','pass_id','status'],
			'pass':['vehicle_title','vehicle_id'],
			'citations':[],
		}
		
		for(const key of Object.keys(ENV.scopes[table]))
			if(!(ENV.forms[key].system || dropData[table].includes(key))){
				if(ENV[key] && Array.isArray(ENV[key])){
					formData[key] = ENV[key][0]
					continue
				}
				formData[key] = defaultData[key] || ENV.forms[key].default || ''
			}

		for(const key of Object.keys(defaultData))
			if(Object.keys(ENV.scopes[table]).includes(key))
				formData[key] = defaultData[key] ? defaultData[key] : ''

		let response = new Form(`formNew${capitalize(table)}`,
			`New ${capitalize(table)}`, '', formData, 
			table, '', scope,
			`/insert?table=${table}`)
		response.new_form = true

		return response
	}
	static generateNewFormTrigger(table){
		let response = new Button(`triggerNew${capitalize(table)}Modal`,
			`<i class="fa fa-plus-square-o" aria-hidden="true"></i> New ${capitalize(table)}`
		)
		response.linkModal(`formNew${capitalize(table)}`)
		return response
	}

//	load html content from a dataset
//	dataTables.js on the .ejs tempmlate footer.ejs will
//		take over rendering the dynamic elements of the table
	get submitButton(){
		this.submit = this.submit || new Button(`${this.id}_submit`,'Submit',``)
		this.submit.isSubmit = true
		this.submit.form = this.formId
		return this.submit.rounded()
	}
	innerHtml(){
		let form_length = Object.keys(this.data).length
		let half = form_length / 2
		let html = `<form method="post" action="${this.action}" id=${this.formId}><div class="row"><div id="page_form_left" class="col-lg-6 col-sm-6 col-xs-12">`
		let activeRole = this.scope
		let new_page = true || this.new_form 
		
		for(let i = 0; i < form_length; i++){
			let field_key = Object.keys(this.data)[i]
			let allow = false
			if(ENV.scopes[this.table][field_key])
				allow = ENV.scopes[this.table][field_key][2] <= this.scope

			html += `<div id="page_form_${field_key}_div" `
			if(field_key.includes("id") && this.table != 'users' && field_key != "user_id")
				html += `style='display:none;'`
			html += `>`

			if(!(new_page && ENV.forms[field_key].type == "datetime-local") && field_key != "id"){ 
				html += `<label id="page_form_${field_key}_label">${ENV.forms[field_key].label}</label>
							<span id="page_form_${field_key}_validator" style="color:red;"></span>`
				if(ENV.forms[field_key].format == "select"){
					html +=`<select class="form-control border mb-3" id="page_form_${field_key}" name="${field_key}" value="${data[field_key]}" style="cursor:auto;box-sizing:border-box;height:40.5px" type="${ENV.forms[field_key].type}"`
					if(!(allow || new_page))
						html += ` disabled `
					html += `><option value="0" disabled>Select an option...</option>`
					
					let optionsLength = field_key == "role" ? activeRole + 1 : ENV[field_key].length
					let value_in_list = ENV[field_key].includes(data[field_key])
					let hideIdFields = !(new_page) &&  field_key.includes("id") ? ` style="display:none;" ` : ``

					for(j = field_key == "role" ? 1 : 0; j < optionsLength; j++){
						let env_field =  ENV[field_key][j]
						let optionSelected = this.data[field_key] == env_field ? ' selected ' : ''

						if(field_key == "role"){
							html += `<option value="${j}"${optionSelected}>${env_field}</option>`
							continue
						}
						html += `<option value="${env_field}"${optionSelected}>${env_field}</option>`
					}
					html += `</select>
						<script>
							other_field_${field_key} = jQuery('<div class="mt-3" id="page_form_${field_key}_options"${hideIdFields}><label id="page_form_${field_key}_label">${ENV.forms[field_key].label}<span style="font-size:x-small;color:var(--poh-dark-grey)"> (Custom)</span></label><span id="page_form_${field_key}_validator" style="color:red;"></span><input id="page_form_${field_key}_other" name="${field_key}" class="form-control border mb-3" style="cursor:auto;box-sizing:border-box;height:40.5px" type="${ENV.forms[field_key].type}" required></div>')
		
							select_field_${field_key} = document.getElementById("page_form_${field_key}")
							
							function update_select_field_${field_key}(){
								if(select_field_${field_key}.value == "Other" || select_field_${field_key}.value == "Other - Custom"){
									jQuery('#page_form_${field_key}_div').append(other_field_${field_key})
								} else {
									jQuery('#page_form_${field_key}_options').remove()
								}
							}
							$(document).ready(function(){
								update_select_field_${field_key}()
							})
							
							select_field_${field_key}.addEventListener("change", function(){
								update_select_field_${field_key}()
							})
		
						</script>`
				} else if(ENV.forms[field_key].format == "textarea"){
					html += `<textarea rows="4" id="page_form_${field_key}" name="${field_key}" class="form-control border mb-3" style="cursor:auto;box-sizing:border-box;"`
					if(!allow && !new_page)
						html += ` readonly `
					html += `>${this.data[field_key]}</textarea>`
				} else {
					html += `<input id="page_form_${field_key}" name="${field_key}" value="${this.data[field_key]}" class="form-control border mb-3" style="cursor:auto;box-sizing:border-box;height:40.5px" type="${ENV.forms[field_key].type}" `
					if(ENV.forms[field_key].type == "tel")
						html += ` placeholder="641-123-4567" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" `
					if(field_key == "year")
						html += ` pattern="(?:19|20)[0-9]{2}" `
					if(!allow && !new_page)
						html +=  ` readonly `
					if(ENV.required_fields.includes(field_key) && !(this.table == 'users' && field_key == 'user_id'))
						html +=  ` required `
					html +=  `></input>`
				} 
			} 
			html +=  `</div>`
			if(i == Math.floor(half))
				html += `</div>
					<div id="page_form_right" class="col-lg-6 col-sm-6 col-xs-12">`
		}	
		html +=  `</div>`
		html +=  `</div>`
		html += '</form>'
		this.content += html
		return this._innerHtml = html
	}
}

class DataTable extends Modal {
	constructor(id, title, subtitle, data, table, links, buttons){
		super(id, title || '', subtitle || '', '', buttons || '')
		this.links = links || []
		this.table = table || ''
		this.innerHtml = data || []
	}
//	load html content from a dataset
//	dataTables.js on the .ejs tempmlate footer.ejs will
//		take over rendering the dynamic elements of the table
	set innerHtml(data){
		if(!data.length || data.length == 0)
			return this._innerHtml = '<p>No data to display...</p>'
		let html = '<table class="table scroll-x table-hover table-stripe dataTable no-footer" id="dataTable" style="width: 100%"><thead>'
		for(const prop of Object.keys(data[0]))
			html += `<th>${ENV.forms[prop].label}</th>`
		html += '</thead><tbody>'
		for(const row in data){
			html += '<tr>'
			for(const elem of Object.values(data[row]))
			html += `<td class="poh-table-link" onclick="${this.links[row]}">${elem}</td>`
			html += '</tr>'
		}
		html += '</tbody></table>'
		this.content += html
		return this._innerHtml = html
	}
	get innerHtml(){
		return this._innerHtml
	}
}

const GeneralModals = {
	'emailFailed': new onLoadModal(
		'Email Failed!',
		'',
		'<div class="text-center">Sucessfully failed email./div>'),
	'emailSent': new onLoadModal(
		'Email Sent!',
		'',
		'<div class="text-center">Sucessfully sent email./div>'),
	'createFailure': new onLoadModal(
		'Failure',
		'<div class="text-center">The system encountered an error attempting to create your resource</div>',
		'<div class="text-center">If you continue to encounter this error, contact the IT Helpdesk</div>'),
	'createSuccess': new onLoadModal(
		'Success',
		'',
		'<div class="text-center">Your record has been created!</div>'),
	'updateFailure': new onLoadModal(
		'Failure',
		'<div class="text-center">The system encountered an error attempting to update your resource</div>',
		'<div class="text-center">If you continue to encounter this error, contact the IT Helpdesk</div>'),
	'updateSuccess': new onLoadModal(
		'Success',
		'',
		'<div class="text-center">Your record has been updated!</div>'),
	'notUpdated': new onLoadModal(
		'Not Updated',
		'',
		'<div class="text-center">No changes were made</div>'
	)
}

/*	Function to save citation/permit/recipts as PDFs */
function savePdfToFile(pdf, fileName, res){
	return new Promise((resolve, reject) => {
	
		// To determine when the PDF has finished being written successfully 
		// we need to confirm the following 2 conditions:
		//
		//   1. The write stream has been closed
		//   2. PDFDocument.end() was called syncronously without an error being thrown

		let pendingStepCount=2;

		const stepFinished=() => {
			if (--pendingStepCount == 0)
				resolve()
		}

		const writeStream=fs.createWriteStream(fileName)
		writeStream.on('close', stepFinished)
		pdf.pipe(writeStream)
		pdf.end()

		stepFinished()
	}) 
}

// 	Export functions for later use
module.exports={
	colors: {
		'ihcc_red': new Color("782F40"),
		'ihcc_yellow': new Color("FFA400"),
		'ihcc_grey': new Color("776E64"),
		'grey': new Color("949FB1"),
		'yellow': new Color("FDB45C"),
		'red': new Color("F7464A"),
		'green': new Color("8ab28a"),
		'charcoal': new Color("4D5360")
	},
//	Template Populating
	Button: Button,
	Modal: Modal,
	Form: Form,
	DataTable: DataTable,
	GeneralModals: GeneralModals,
//	PDF Generation
	savePdfToFile: savePdfToFile
}