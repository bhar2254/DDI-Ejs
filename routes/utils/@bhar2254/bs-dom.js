/**
 * dom.js
 * Module for creating UI (Bootstrap 5) applications with Cloudflare Workers
 */

const formatDate = (date) => {
	const padZero = (num) => num.toString().padStart(2, '0');
  
	const year = date.getFullYear();
	const month = padZero(date.getMonth() + 1); // Months are zero-indexed
	const day = padZero(date.getDate());
	const hours = padZero(date.getHours());
	const minutes = padZero(date.getMinutes());
  
	return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const { loadStringPrototypes } = require('@bhar2254/string-utils')
// Load custom string methods
loadStringPrototypes()

class Defaults {
   static defaults = {}
   static setup = (setup) => {
       if (setup.defaults) {
           setDefts(setup.defaults)
       }
   }
   static setDefs = (setDefaults) => {
       for (const [key, value] of Object.entries(setDefaults)) {
           this.defaults[key] = value
       }
   }
}

class HtmlElement extends Defaults {
   constructor(args) {
       super(args)
       const _args = {...args}
       this.tag = _args.tag || ''
       this.attributes = _args.attributes || {}
       this.classes = _args.classes || []
       this.content = _args.content || ''
       this.parent = _args.parent || {}
       this.children = _args.children || []
   }
   set attributes(attr) {
       this._attributes = attr
   }
   get attributes() {
       let output = ''
       for (const [key, value] of Object.entries(this._attributes))
           output = ` ${key}='${value}'`
       return output
   }
   set children(children) {
       this._children = children
   }
   get children() {
       return this._children
   }
   set styles(styles) {
       this._styles = Array.isArray(styles) ? styles : [styles]
   }
   get styles() {
       const { _styles = [] } = this
       return _styles
   }
   set classes(classes) {
       this._classes = Array.isArray(classes) ? classes : [classes]
   }
   get classes() {
       const { _classes = [] } = this
       return _classes
   }
   set content(content) {
       this._content = content
   }
   get content() {
       return this._content
   }
   set parent(parent) {
       this._parent = parent
   }
   get parent() {
       return this._parent
   }
   set tag(tag) {
       const htmlTags = ['!--...--', '!DOCTYPE', 'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'search', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']
       this._tag = htmlTags.includes(tag) ? tag : 'div'
   }
   get tag() {
       return this._tag
   }
   addChild(child) {
       if (!this._children.includes(child))
           this._children.push(child)
   }
   addClass(classString) {
       this._classes.push(classString)
       return this.classes
   }
   renderChildren() {
       let output = ''
       for (const each of this.children)
           output += ` ${each.render()} `
       return output
   }
   render() {
       return `<${this.tag}${this.attributes} styles='${this.styles.join('; ')}' class='${this.classes.join(' ')}'>${this.content}</${this.tag}>`
   }
}

/*	Class for creating buttons used in modals and around the site	*/
class Button extends HtmlElement {
   constructor(args) {
       super('div', args)
       const _args = { ...args }
       this.id = _args.id || 0
       this.buttonText = _args.text || ''
       this.onclickAction = _args.onclick || 0
       this.isSubmit = false
       this.round = false
       if (_args.form)
           this.form = _args.form
       this.style = ''
       if (_args.modal)
           this.modal = _args.modal
       this.classes = args.classes
       this.classes = this._classes.concat(['btn', 'bh-primary'])
   }
   set modal(modal) {
       this._modal = `data-bs-toggle="modal" data-bs-target="#${modal}" `
   }
   get modal() {
       return this._modal
   }
   set form(id) {
       this._form = id != 'undefined' ? ` form="${id}" ` : ``
       return this._form
   }
   get form() {
       return this._form
   }
   set isSubmit(bool) {
       this.type = bool ? 'type="submit"' : 'type="button"'
       return this._isSubmit = bool ? true : false
   }
   get isSubmit() {
       return this._isSubmit
   }
   setColor(option) {
       let colorOptions = {
           'primary': 'bh-primary',
           'secondary': 'bh-secondary',
           'sand': 'bh-sand'
       }

       //	remove old colors
       for (const each of Object.values(colorOptions))
           this.removeClass(each)

       //	set current color
       this.addClass(colorOptions[option] || 'bh-primary')

       return this._classes
   }
   removeRound() {
       this._classes.length = 0
       this.addClass('rounded-0')
   }
   removeMargin() {
       this.removeClass('m-3')
   }
   print() {
       let clickAction = ""
       if (this.onclickAction !== undefined) {
           clickAction = `onclick="${this.onclickAction}"`
       }
       return this.output = `<button ${clickAction} ${this.form} styles="${this.styles}" classes="${this.classes}" ${this.type} id="${this.id}" ${this.modal}>${this.buttonText}</button>`
   }
   addMargin() {
       this.addClass('m-3')
   }
   render() {
       return this.print()
   }
   square() {
       this.removeClass('rounded')
       this.removeClass('rounded-end')
       this.removeClass('rounded-start')
       this.addClass('rounded-0')
       this.styles = ['']
       return this.print()
   }
   rounded() {
       this.removeClass('rounded-0')
       this.removeClass('rounded-end')
       this.removeClass('rounded-start')
       this.addClass('rounded')
       return this.print()
   }
   roundedStart() {
       this.removeClass('rounded')
       this.removeClass('rounded-0')
       this.removeClass('rounded-end')
       this.addClass('rounded-start')
       return this.print()
   }
   roundedEnd() {
       this.removeClass('rounded')
       this.removeClass('rounded-0')
       this.removeClass('rounded-start')
       this.addClass('rounded-end')
       return this.print()
   }
   printSubmit() {
       this.isSubmit = true
       return this.print()
   }
}

class Breadcrumb extends HtmlElement { 
   constructor(args) { 
       super(args)
       const _classes = ['row']
       this.classes = Array.isArray(args.classes) ? args.classes.concat(_classes) : _classes
       const { links = {}, buttons = '' } = args
       this.buttons = buttons
       this.links = links
   }
   set links(links) {
       this._links = links
   }
   get links() {
       const links = []
       Object.keys(this._links).forEach( each => {
           const value = this._links[each] === null || typeof this._links[each] === 'undefined' ? 
               `<li class="breadcrumb-item active" aria-current="page">${each}</li>` : 
               `<li class="breadcrumb-item" aria-current="page"><a href="${this._links[each]}">${each}</a></li>`
           links.push(value)
       })
       return links
   }
   set buttons(buttons) {
       this._buttons = buttons || ''
   }
   get buttons() {
       return this._buttons
   }
   set content(content) {
       this._content = content
   }
   get content() {
       return `<nav aria-label="breadcrumb" class="bg-body-tertiary rounded-3 p-3 shadow-lg">
               <div class="row">
                   <ol class="px-3 breadcrumb mb-0 d-flex justify-content-center align-items-center">
                       ${this.links.join('')}
                       <li class="ms-auto">
                           ${this.buttons}
                       </li>
                   </ol>
               </div>
           </nav>`
   }
}

class Card extends HtmlElement {
   constructor(args) {
       super(args)
       this.addClass('card')
       const { header = '', body = '', footer = '', options = '' } = args
       this.header = header
       this.centered = options.centered ? 'text-center' : ''
       this.body = body
       this.footer = footer
       this.content = `
           <div class='card-header ${this.centered}'>
               ${this.header}
           </div>
           <div class="card-body">
               ${this.body}
           </div>          
           <div class="card-footer">
               <div class="row ${this.centered}">
                   ${this.footer}
               </div>
           </div>`
   }
   set header(header) {
       this._header = String(header)
   }
   get header() {
       return this._header
   }
   set body(body) {
       this._body = String(body)
   }
   get body() {
       return this._body
   }
   set footer(footer) {
       this._footer = String(footer)
   }
   get footer() {
       return this._footer
   }
}
/*
   FormInput
       key, id, tag, type, label, pattern, options, value, width, placeholder
*/
class FormInput extends HtmlElement {
   constructor(args) {
       super(args)
       this.key = args.key || ''
       this.id = args.id || this.key
       this.tag = args.format || args.tag || 'input'
       this.type = args.type || 'text'
       this.label = args.label || 'Field'
       this.pattern = args.pattern || ''
       this.options = args.options || []
       this.disabledOptions = args.disabledOptions || []
       this.value = args.value || ''
       this.width = args.width || 'sm'
       this.placeholder = typeof args.placeholder != 'undefined' && args.placeholder != 'null' ? args.placeholder : ''
       this.centered = args.centered || false
       this.autocomplete = args.autocomplete || false
       this.classes = [this.width, 'mb-3', 'mx-auto']
       if (args.readonly)
           this.readonly = true
       if (args.required)
           this.required = true
   }
   set key(key) {
       this._key = String(key)
   }
   get key() {
       return this._key
   }
   set label(label) {
       this.formattedLabel = String(label).trim().capitalize().replaceUnderscoreWith();
       this._label = this.formattedLabel
   }
   get label() {
       return this._label
   }
   set tag(tag) {
       const typeList = ['select', 'input', 'textarea']
       const reformattedType = String(tag).trim().toLowerCase()
       this._tag = typeList.includes(reformattedType) ? String(tag) : 'input'
   }
   get tag() {
       return this._tag
   }
   set type(type) {
       this._type = type
   }
   get type() {
       return this._type
   }
   set width(width) {
       const widths = {
           'xs': 'col-sm-2 col-xs-11',
           'sm': 'col-sm-4 col-xs-11',
           'md': 'col-sm-5 col-xs-11',
           'lg': 'col-11',
       }
       this._width = widths[width] || width || ''

   }
   get width() {
       return this._width
   }
   fieldWrapper(args) {
       const _args = { ...args }
       const id = _args.id || 'page_form'
       const content = _args.content || ''
       return `
           <div id='${id}' styles="${this.styles.join('; ')}" class="${this.classes.join(' ')}">
               ${content}
           </div>`
   }
   get render() {
       const isReadonly = typeof this.readonly == 'undefined' 
       const readonly = isReadonly ? '' : ' disabled readonly '
       const styles = ['box-sizing:border-box','min-height: 2.35rem']
       const classes = ['form-control', 'border']
       const isRequried = typeof this.required == 'undefined'
       const required = isRequried ? '' : ' required '
       if(this.centered)
           classes.push('mx-auto', 'text-centered')
       classes.push(readonly)
       styles.push(typeof this.readonly != 'undefined' ? 'cursor: not-allowed' : 'cursor: auto;')
       const fieldTypes = {
           'select': () => {
               const options = []
               let disabled = false
               if (typeof this.options !== 'undefined' && !Array.isArray(this.options))
                   Object.entries(this.options).forEach(([key, value]) => {
                       const isDisabled = Array.isArray(this.disabledOptions) && ( this.disabledOptions.includes(key) || this.disabledOptions.includes(value) )
                       const isActive = key == this.value || value == this.value ? ' selected' : ''
                       options.push(`<option value='${key}' ${isDisabled ? 'disabled': ''} ${isActive}>${value}</option>`)
                       disabled = isActive && isDisabled
                   })
               if (typeof this.options !== 'undefined' && Array.isArray(this.options))
                   this.options.forEach((each, index) => {
                       const current = String(each).toLowerCase()
                       const isDisabled = Array.isArray(this.disabledOptions) && ( this.disabledOptions.includes(each) || this.disabledOptions.includes(index) )
                       const isActive = current === String(this.value).toLowerCase() || this.value === index ? ' selected' : ''
                       options.push(`<option value='${each}' ${isDisabled ? 'disabled': ''} ${isActive}>${capitalize(each)}</option>`)
                       disabled = isActive && isDisabled
                   })
               let content = `
                   <label class='border-0' id='${this.key}_label'>${this.label}</label>
                   <select class="${classes.join(' ')}" style="${styles.join(';')}" id='${this.key}_field' name='${this.key}' type='select' ${disabled ? 'disabled': ''} ${readonly} ${required}>`
               content += `${options.join('')}
                   </select>`
               return this.fieldWrapper({ id: this.key, content: content })
           },
           'textarea': () => {
               const { id, key, value, label, placeholder = '' } = this
               styles.length = 0;
               styles.push('height: 40.5px', 'min-height: 7.5rem;')
               let content = `
                   <label class='border-0' id='${id}_label'>${label}</label>
                   <textarea class="${classes.join(' ')}" style="${styles.join('; ')}' autocomplete="${this.autocomplete}" rows='4' id='${id}_field' name='${key}' placeholder='${placeholder}' ${readonly} ${required}>
                       ${value}
                   </textarea>`
               return this.fieldWrapper({ id: id, content: content })
           },
           // box-sizing:border-box; min-height: 2.35rem; cursor: pointer;
           'input': () => {
               const { id, key, label, type, placeholder = '', pattern = 0 } = this
               let { value = '' } = this 
               const type_classes = {
                   checkbox: ['w-100 my-0', 'form-check-input', 'border'],
                   default: ['form-control', 'border']
               }
               if(type.includes('datetime'))
                   value = formatDate(new Date(value))
               classes.push(...type_classes[type] || type_classes.default)
               const fullPattern = pattern ? ` pattern=${pattern}` : ``
               const checked = type == 'checkbox' && value == 1 ? ' checked ' : ''
               if(type === 'checkbox') {
                   styles.push('cursor: pointer')
               }
               let content = `
                   <label class='border-0' id='${id}_label'>${label}</label>
                   <input class="${classes.join(' ')}" style="${styles.join('; ')}" autocomplete="${this.autocomplete}" id='${id}_field' name='${key}' type='${type}' ${value ? `value="${value}"` : ''} placeholder='${placeholder}' ${fullPattern} ${checked} ${readonly} ${required}>`
               return this.fieldWrapper({ id: id, content: content })
           }
       }
       return fieldTypes[this.tag]()
   }
}

/*
   Form
       Id, Method, Action, Columns,
       Fields (FormInput {key, id, tag, type, label, pattern, options, value, width, placeholder})
*/
class Form extends HtmlElement {
   static buildForm = options => {
       // Fields: label, scope, required, options, etc...
           // built from env and MySQL and sent to Form
       // Data: array of data with keys from the field
           // retrieved from player and combinde with DB data to populate form
       const { title = "",
           action = null, 
           id = 'form', 
           fields = {}, 
           data = {},
           removeSubmit = false, 
           trigger = {} } = options
       const formInputs = []
       Object.keys(fields).forEach(x => {
           const field = fields[x] || {}
           const placeholder = field.placeholder || field.label || field.id || ''
           formInputs.push({
               id: field.id || field.key || `field_${x}`,
               label: field.label || x,
               name: field.name || field.key || x,
               key: field.key || x,
               scope: field.scope || [],
               required: field.required || false,
               readonly: field.readonly || field.system  ? true : false,
               options: field.options || [],
               disabledOptions: field.disabledOptions || [],
               pattern: field.pattern || '',
               type: field.type || '',
               width: field.width || '',
               centered: field.centered || false,
               autocomplete: field.autocomplete || false,
               tag: field.format || field.tag || '',
               placeholder: placeholder.capitalizeWords(),
               value: data[x] || '',
           })
       })
       const form = new Form({
           id, method: 'POST', action, fields: formInputs, classes: ['my-3'], removeSubmit
       })
       const _trigger = {
           text: trigger.text || title || '',
           classes: trigger.classes || ['bh-sand'],
           styles: trigger.styles || ['bh-sand'],
       }
       const modal = new Modal({
           id: `modal${id}`,
           title: title.length ? title.capitalizeWords().replaceUnderscoreWith() : `Form`,
           content: form.render,
           trigger: _trigger,
           form: id,
       })
       return { modal, form }
   }
   constructor(args) {
       super(args)
       const _args = { ...args }
       this.id = _args.id || 'page_form'
       this.form_html = ''
       this.field_length = _args.fields ? _args.fields.length : 0
       this.method = _args.method || 'GET'
       this.action = _args.action || ''
       this.fields = _args.fields || []
       this.columns = _args.columns || 2
       this.classes = _args.classes || []
       this.classes = [...this.classes, 'mx-auto', 'col-lg-9', 'col-md-11', 'col-sm-12']
       this.removeSubmit = typeof _args.removeSubmit === 'undefined' ? false : _args.removeSubmit
   }
   addField = field => {
       return this.fields.push(field)
   }
   get render() {
       let form_html = `    
           <form id='${this.id}' styles="${this.styles.join(';')}" class="${this.classes.join(' ')}" action='${this.action}' method='${this.method}'>
               <div class='row'>`
       const additional_fields = {
           'hr': (x) => {
               return `${x.value}<hr>`
           },
           'br': (x) => {
               return `${x.value}<br>`
           },
           'row': (x) => {
               return `</div><div class='row'>`
           }
       }
       if(this.fields && Array.isArray(this.fields))
           for (const each of this.fields) {
               if (Object.keys(additional_fields).includes(each.key) && !each.system) {
                   form_html += additional_fields[each.key](each)
                   continue
               }
               const formInput = new FormInput(each)
               form_html += formInput.render
           }
       const submit = this.removeSubmit ? '' : `
                   <div class="text-center"> 
                       <button form="${this.id}" type="submit" class="btn bh-primary">Submit</button>
                   </div>`
       return this.form_html = form_html + submit + `
               </div>
           </form>`
   }
}

class Modal extends HtmlElement {
   constructor(args) {
       super(args)
       this.id = args.id
       this.title = args.title
       this.form = args.form || undefined
       this.body = args.body || args.content
       this.vertically_centered = typeof args.vertically_centered === 'undefined' ? true : args.vertically_centered
       this.footer = args.footer || args.buttons || `
                   <button type='button' class='btn btn-secondary' data-bs-dismiss='modal'>Close</button>
                   <button type='submit' ${this.form} class='btn bh-primary'>Save</button>`
       this.trigger = args.trigger || {}
       
   }
   set title(title) {
       this._title = title.trim().capitalizeWords().replaceUnderscoreWith()
   }
   get title() {
       return this._title
   }
   set body(body) {
       this._body = String(body).trim()
   }
   get body() {
       return this._body
   }
   set form(id) {
       this._form = id
       return this._form
   }
   get form() {
       return this._form !== undefined ? ` form="${this._form}" ` : ``
   }
   set footer(footer) {
       this._footer = footer
   }
   get footer() {
       return this._footer
   }
   set trigger(trigger) {
       const _trigger = {
           styles: trigger.styles ? trigger.styles : [],
           classes: trigger.classes ? trigger.classes : ['bh-primary'],
           text: trigger.text ? trigger.text : 'Trigger Modal',
           ...trigger,
       }
       this._trigger = _trigger
   }
   get trigger() {
       return `<button type='button' style="${this._trigger.styles.join(';')}" class='btn ${this._trigger.classes.join(' ')}' data-bs-toggle='modal' data-bs-target='#${this.id}'>
           ${this._trigger.text}
       </button>
       `
   }
   render() {
       return `<div id='${this.id}' class='modal' tabindex='-1'>
               <div class="modal-dialog ${this.vertically_centered ? 'modal-dialog-centered' : ''}">
                   <div class="modal-content">
                   <div class="modal-header">
                       <h5 class='modal-title'>${this.title}</h5>
                   <button type='button' class='btn-close' data-bs-dismiss='modal' aria-label='Close'></button>
               </div>
               <div class='modal-body'>
                   <p>${this.body}</p>
               </div>
               <div class='modal-footer'>
                   ${this.footer}
               </div>
               </div>
           </div>
       </div>
       `
   }
}

class Parallax extends HtmlElement {
   constructor(args) {
       super(args)
       const _args = {...args}
       this.classes = ['parallax-canvas']
       this.height = _args.height || '15'
       this.link = _args.link || `${process.env.URI}/favicon.png`
   }
   set content(content) {
       this._content = content
   }
   get content() {
       return `<div class="parallax" style="position: relative;opacity: 0.75;background-attachment: fixed;background-position: center;background-repeat: no-repeat;background-size: cover; min-height: ${this.height}vh; background-image: url('${this.link}');"></div>`
   }
   render(args) {
       const _args = {...args}
       if(_args.link)
           this.link = _args.link
       if(_args.height)
           this.height = _args.height

       return `<${this.tag}${this.attributes} styles='${this.stlyes.join(';')}' class='${this.classes.join(' ')}'>${this.content}</${this.tag}>`
   }
}

class Table extends HtmlElement {
   constructor(args) {
       super(args)
       this.tag = 'table'
       const { content = [], 
           header = [], 
           data = [{empty: 'No Data to Display'}], 
           classes = ['table-striped', 'table-compact'], 
           styles = ['table-striped', 'table-compact'], 
           includesHeader = false, 
           dropColumns = ['guid','create_time','update_time'],
           links = {} } = args
       const { columns = Object.keys(data[0]) } = args
       this.classes = classes.concat(['table'])
       this.styles = styles.concat(['table'])
       const premier = data[0]
       for (const [key, value] of Object.entries(premier)){
           if(columns.includes(key) && !dropColumns.includes(key) && key.substring(key.length-2) != 'id'){
               header.push(includesHeader ? value : key)
               content.push(`<th>${String(key).capitalizeWords().replaceUnderscoreWith()}</th>`)
           }
       }
       content.push('</tr>')
       data.forEach((row, index) => {
           content.push('<tr>')
           for(const key of header){
               const setLink = links[key] || links.default || false
               const link = links[key] ? links[key] : links.default || ''
               if(!row[key]){
                   content.push(`<td></td>`)
                   continue
               }
               if(setLink){
                   content.push(`<td><a href="${link[index]}">${row[key]}</a></td>`)
                   continue
               }
               content.push(`<td>${row[key]}</td>`)
           }
           content.push('</tr>')
       })
       this.content = content.join('')
   }
}

class Page extends Defaults {
   static defaults = {
       siteTitle: 'Default',
       pageTitle: 'Page',
       brand: 'BlaineHarper.com',
       navbar: [{}],
       body: 'Bootstrap 5 Starter',
       header: '',
       footer: '',
   }
   constructor(args) {
       super(args)
       this.siteTitle = args.siteTitle ? args.siteTitle.capitalizeWords().replaceUnderscoreWith() : Page.defaults.siteTitle
       this.pageTitle = args.pageTitle ? args.pageTitle.capitalizeWords().replaceUnderscoreWith() : Page.defaults.pageTitle
       this.style = args.style || ''
       const header = args.header || {}
       this.header = {
           title: `${this.siteTitle} | ${this.pageTitle}`,
           overwrite: header.overwrite || false,
           append: header.append || '',
           block: header.block || false,
           dark: header.dark || false
       }
       this.brand = args.brand || args.siteTitle || Page.defaults.brand
       this.navbar = args.navbar || Page.defaults.navbar
       this.body = args.body || Page.defaults.body
       this.footer = args.footer || Page.defaults.footer
       this.tag = 'html'
   }
   set body(content) {
   //  <div class='m-5 mx-auto bg-glass bg-gradient shadow-lg bh-left-bar-secondary col-lg-9 col-md-12 col-sm-12'>'
       const body = `
   <body>
       <div class='main'>
           ${content}
       </div>`
       this.content = body
   }
   get body() {
       return this.content
   }
   set footer(content) {
       this._footer = content
   }
   get footer() {
       return `${this._footer}
   </body>
</html>`
   }
   set header(args) {
       this._header = { ...args }
   }
   get header() {
       return this._header.block || this._header.overwrite ? 
           this._header.overwrite || '' : 
           `<!DOCTYPE html>
<html lang="en" data-bs-theme="${this.dark ? 'light' : 'dark'}">
   <head>
       <meta charset="utf-8">
       <meta name="viewport" content="width=device-width, initial-scale=1" />
       <meta name="description" content="${this._header.title}">
       <title>${this._header.title}</title>
       <link rel="icon" type="image/x-icon" href="/favicon.png">
       ${this._header.append}
   </head>`
   }
   set navbar(navbar) {
       this._navbar = navbar
   }
   get navbar() {
       const generateDropdown = (args) => {
           const _args = { ...args }
           const text = _args.text || ''
           const links = _args.links || []

           let responseHtml = `
               <li class='nav-item dropdown'>
                   <a id='navbar_dropdown_item' class='nav-link' href='#' role='button' data-bs-toggle='dropdown' aria-expanded='false'>${text}</a>
                       <ul class='dropdown-menu table-responsive border shadow-lg'>`
           for (const each of links)
               if (each.text == 'hr')
                   responseHtml += `<hr style='color:#533; margin:0; padding:0;'>`
               else
                   responseHtml += `<li><a class='dropdown-item' target='${each.target || '_self'}' href='${each.link || '#'}'>${each.text || ''}</a></li>`
           return responseHtml + `</ul>
       </li>`
       }
       const dropdowns = this._navbar || [{}]
       let dropDownHtml = ''
       for (const each of dropdowns) {
           const link = each.link || false
           dropDownHtml += link ?
               `<li class='nav-item'>
                   <a id='navbar_item' class='nav-link' href='${link}' role='button'>${each.text}</a>` :
               generateDropdown(each)
       }
       return `
           <nav class='navbar navbar-expand-lg text-end bg-glass sticky-top shadow-lg'>
               <div class='col-10 container-fluid'>
               <button class='ms-auto bg-glass my-1 navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'><i class='fa-solid fa-bars'></i></button>
               <div class='collapse navbar-collapse' id='navbarSupportedContent'>
                   <a id='navbar_banner_button' class='fs-5 navbar-brand hide-on-shrink' href='/'>${this.brand}</a>
                   <ul class='navbar-nav ms-auto'>
                       ${dropDownHtml}
                   </ul>
               </div>
               </div>
           </nav>`
   }
   set style(style) {
       this._style = style
   }
   get style() {
       return this._style
   }
   render() {
       return this.header + this.navbar + this.body + this.footer
   }
}

module.exports = {
   Defaults,
   Button,
   HtmlElement,
   Breadcrumb,
   Card,
   FormInput,
   Form,
   Modal,
   Parallax,
   Table,
   Page,
}