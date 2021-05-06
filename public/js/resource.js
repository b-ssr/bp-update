import Utils from './utils.js';

export default class Resource {

    constructor(chart, category, resource_data) {
        this.chart = chart;
        this.category = category;
        this.resource_data = resource_data;

        this.set_defaults();
    }


    set_defaults() {
        this.id = this.resource_data.id;
        this.type = this.resource_data.type;

        this.index;
        this.operations = [];
        this.is_hidden = false;
        this.is_selected = true;
    }


    draw() {
        const res = Utils.create_html('div', {
            class: 'resource',
            style: 'height: ' + this.chart.options.row_height + 'px;',
            parent: this.category.container,
            'data-type': this.category.type
        });

        const checkbox = Utils.create_html('input', {
            type: 'checkbox',
            class: 'res-selector',
            parent: res
        });
        checkbox.checked = this.is_selected;

        Utils.create_html('div', {
            innerHTML: this.id,
            class: 'res-id',
            parent: res
        });

        this.html = res;
    }


    bind() {
        this.bind_select();
    }


    bind_select() {
        const resource = this;

        // both checkbox and id are bind to 'select' event
        const buttons = this.html.childNodes;

        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.matches('.res-selector')) {
                    this.checked = !this.checked;
                }
                resource.toggle_select();
            });
        });
    }


    toggle_display() {
        this.html.style.display = this.html.style.display === 'none' ? '' : 'none';
    }


    toggle_select() {
        this.is_selected = !this.is_selected;

        const elem = this.html.querySelector('.res-selector');
        elem.checked = !elem.checked;
    }
}