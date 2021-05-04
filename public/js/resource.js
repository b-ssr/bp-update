import Utils from './utils.js';

export default class Resource {

    constructor(chart, category, resource_data) {
        this.chart = chart;
        this.category = category;
        this.resource_data = resource_data;

        this.prepare();
        this.draw();
    }


    prepare() {
        this.id = this.resource_data.id;
        this.index = this.resource_data.index;
        this.type = this.resource_data.type;

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

        Utils.create_html('input', {
            type: 'checkbox',
            checked: this.resource_data.is_hidden,
            class: 'res-selector',
            parent: res
        });

        Utils.create_html('div', {
            innerHTML: this.resource_data.id,
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


    hide() {
        this.is_hidden = true;
        this.html.style.display = this.html.style.display === 'none' ? '' : 'none';

        // TODO 
        // this.category.recalc_res_indexes();
    }


    toggle_select() {
        this.is_selected = !this.is_selected;

        const elem = this.html.querySelector('.res-selector');
        elem.checked = !elem.checked;
    }
}