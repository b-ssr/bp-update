import Utils from './utils.js';

export default class Operation {

    constructor(chart, resource, operation_data) {
        this.chart = chart;
        this.resource = resource;
        this.operation_data = operation_data;

        this.set_defaults();
    }


    set_defaults() {
        this.id = this.operation_data.id;
        this.type = this.operation_data.type;
        this.time_start = new Date(this.operation_data.time_start);
        this.time_end = new Date(this.operation_data.time_end);

        this.index;
        // container for this operation
        this.section;
    }


    prepare() {
        this.section = this.resource.category.ops_section;

        // 100px  /------- ? px ---------/operation/--------------------/
        //      8:00                   10:30                         14:00
        //
        // ? = (10:30 - 8:00) / (14:00 - 8:00) * 100 = 41.67 px

        const options = this.chart.options;

        this.x = (this.time_start - this.chart.chart_start) / this.chart.full_time
            * options.grid_width + options.grid_offset * 2;
        this.y = options.row_height * this.resource.index + options.bar_padding / 2;
        this.width = (this.time_end - this.time_start) / this.chart.full_time
            * options.grid_width;
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