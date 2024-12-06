
const toggleForm = () => {
    $(document).ready(function() {
        $('.editable-toggler').toggle()
        $('.editable').each(function() {
            const attr = {
                id: $(this).attr('id'),
                class: $(this).attr('class'),
                tag: $(this).data('tag') || 'input',
                options: $(this).data('options') || '',
                type: $(this).data('type') || 'text',
                text: $(this).html(),
                placeholder: $(this).attr('placeholder')
            }
            var input = $(`<${attr.tag}>`, {
                id: attr.id,
                type: 'text',
                name: attr.id,
                placeholder: attr.placeholder,
                value: attr.text,
                val: attr.text,
                class: attr.class,
                rows: 5,
            })
            if(attr.tag == 'select')
                Object.entries(attr.options || {}).forEach(([key, value], i) => {
                    const isDisabled = value.substring(0,1) === '-'
                    const _value = value.substring(0,1) === '-' || value.substring(0,1) === '+' ? value.slice(1) : value
                    const isSelected = key === attr.text || attr.text === _value || _value === i || i === key
                    const disabled = isDisabled ? 'disabled': ''
                    const selected = isSelected ? 'selected': ''
                    input.append(`<option value="${key}" ${disabled} ${selected}>${_value}</option>`)
                    if(attr.text == value)
                        input.val(key)
                })
            input.addClass('form-control bg-glass-secondary-3')
            input.data('tag', attr.tag)
            input.data('options', attr.options)
            input.data('type', attr.type)
            $(this).replaceWith(input)
        });
        
        $('form').each(function() {
            $(this).dirty({
                preventLeaving: true
            });
        });
    });
}

const cancelForm = () => {
    $(document).ready(function() {
        $('.editable-toggler').toggle()
        $('.editable').each(function() {
            // Get the id of the current span
            const attr = {
                name: $(this).attr('name'),
                class: $(this).attr('class'),
                content: $(this).data('tag') == 'select' ? $(this).find('option:selected').text() : $(this).val() ,
                options: $(this).data('options') || '',
                tag: $(this).data('tag') || 'input',
                type: $(this).data('type') || 'text',
            }
            // Create a new span element
            var span = $(`<span>`, {
                id: attr.name,
                html: attr.content,
                class: attr.class
            });

            // Replace the span with the input
            span.removeClass('form-control bg-glass-secondary-3')
            span.data('tag', attr.tag)
            span.data('type', attr.type)
            span.data('options', attr.options)
            $(this).replaceWith(span)
        });
        $('.marked-content').each(function() {
            $(this).html(marked.parse($(this).html()))
        });
        
        $('form').each(function() {
            $(this).dirty({
                preventLeaving: true
            });
        });
    });
}

$(document).ready(function() {
    $('.marked-content').each(function() {
        $(this).html(marked.parse($(this).html()))
    });
        
    $('form').each(function() {
        $(this).dirty({
            preventLeaving: true
        });
    });
});