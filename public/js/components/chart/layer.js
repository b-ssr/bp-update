import Utils from '../../utils/utils.js';

export default class Layer {

    constructor(chart, resource, operations, layer_number) {
        this.chart = chart;
        this.resource = resource;
        this.operations = operations;
        this.number = layer_number;

        this.set_defaults();
    }


    set_defaults() {
    }


    draw() {
        this.html = Utils.create_html('div', {
            innerHTML: this.number + '. layer',
            class: 'layer',
            style: 'height: ' + this.chart.options.row_height + 'px;',
            parent: this.resource.category.container
        });
    }


    toggle_display() {
        this.html.style.display = this.html.style.display === 'none' ? '' : 'none';
    }
}