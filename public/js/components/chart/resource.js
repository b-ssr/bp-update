import Utils from '../../utils/utils.js';

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
        this.layers = [];
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

        this.toggle_layers_svg();
        for (let layer of this.layers) {
            layer.toggle_display();
        }
    }


    toggle_select() {
        this.is_selected = !this.is_selected;

        const elem = this.html.querySelector('.res-selector');
        elem.checked = !elem.checked;
    }


    highlight() {
        this.html.classList.add('selected');
    }


    clear_highlight() {
        this.html.classList.remove('selected');
    }


    draw_layers_svg() {
        const svg_container = Utils.create_html('div', {
            style: 'width: 0px; height: 0px',
            parent: this.category.container
        });

        this.layers_svg = Utils.create_svg('svg', {
            // TODO
            // width: this.chart.options,
            width: 170,
            height: this.chart.options.row_height * this.layers.length,
            parent: svg_container
        });

        this.draw_layers_lines();
    }


    draw_layers_lines() {
        Utils.create_svg('line', {
            // TODO
            x1: 10,
            x2: 140,
            y1: 0,
            y2: 0,
            style: 'stroke: rgb(0,0,0); stroke-width:1',
            parent: this.layers_svg
        });

        Utils.create_svg('line', {
            // TODO
            x1: 30,
            x2: 30,
            y1: 0,
            y2: this.chart.options.row_height * this.layers.length,
            style: 'stroke: rgb(0,0,0); stroke-width:1',
            parent: this.layers_svg
        });
    }


    toggle_layers_svg() {
        if (this.layers_svg) {
            this.layers_svg.parentNode.style.display =
                this.layers_svg.parentNode.style.display === 'none' ? '' : 'none';
        }
    }
}