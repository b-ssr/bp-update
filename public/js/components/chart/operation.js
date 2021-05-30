import Utils from '../../utils/utils.js';

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
        this.layer_number = this.operation_data.layer;

        this.order;
        this.html;
        this.section; // container for this operation
    }


    prepare(index) {
        this.section = this.resource.category.ops_section;

        // 100px  /------- ? px ---------/operation/--------------------/
        //      8:00                   10:30                         14:00
        //
        // ? = (10:30 - 8:00) / (14:00 - 8:00) * 100 = 41.67 px

        const options = this.chart.options;

        // start            6:00               12:00              18:00            end
        // ------------------|------------------|------------------|------------------
        // 2 * grid_padding                             60px

        // grid_width = chart_dates.length * column_width + 2 * grid_padding
        //            = 3 * 60px + 2 * 30px = 240px
        //
        // full_time = 18:00 - 6:00 = 6 hours (in milliseconds)
        // full_time_width = grid_width - 4 * grid_padding = 120px

        const full_time_width = options.grid_width - 4 * options.grid_padding;

        this.x = (this.time_start - this.chart.chart_start) / this.chart.full_time
            * full_time_width + 2 * options.grid_padding;
        this.y = options.row_height * index + options.bar_padding / 2;
        this.width = (this.time_end - this.time_start) / this.chart.full_time
            * full_time_width;
        this.height = options.bar_height;

        this.corner_radius = this.chart.options.bar_corner_radius;
    }


    draw() {
        this.html = Utils.create_svg('rect', {
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
            'data-res-type': this.resource.category.type,
        });
    }


    highlight() {
        this.html.style['stroke-width'] = '2.5px';
    }


    clear_highlight() {
        this.html.style['stroke-width'] = '1px';
    }


    reset_bars() {
        const bars = this.container.querySelectorAll('.bar');

        bars.forEach(bar => {
            bar.classList.remove('group-select');
            bar.style['stroke-width'] = '1px';
        });
    }
}