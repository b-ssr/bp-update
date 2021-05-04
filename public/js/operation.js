import Utils from './utils.js';

export default class Operation {

    constructor(chart, resource, operation_data) {
        this.chart = chart;
        this.resource = resource;
        this.operation_data = operation_data;

        this.prepare();
        this.draw();
    }


    prepare() {
        this.id = this.operation_data.id;
        this.order = this.operation_data.order;
        this.type = this.operation_data.type;
        this.time_start = this.operation_data.time_start;
        this.time_end = this.operation_data.time_end;
        // container for this operation
        this.section = this.resource.category.ops_section;

        const options = this.chart.options;

        this.x = (this.time_start - this.chart.chart_start) / options.time_step
            + options.grid_offset * 2;
        this.y = options.row_height * this.resource.index + options.bar_padding / 2;
        this.width = (this.time_end - this.time_start) / options.time_step;
        this.height = options.bar_height;

        this.corner_radius = this.chart.options.bar_corner_radius;
    }


    draw() {
        Utils.create_svg('rect', {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'bar',
            parent: this.section,
            'data-id': this.id,
            'data-order': this.order,
            'data-type': this.type,
            'data-res-index': this.resource.index,
            'data-res-type': this.resource.type
        });
    }
}