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

        this.order;
        this.html;
        this.section; // container for this operation
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
        });
    }


    select() {
        this.html.style['stroke-width'] = '2.5px';
    }


    deselect() {
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