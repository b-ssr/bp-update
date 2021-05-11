import Utils from '../../utils/utils.js';
import Operation from './operation.js';
import Popup from './popup.js';

export default class Grid {

    constructor(chart) {
        this.chart = chart;

        this.set_defaults();
    }


    set_defaults() {
        this.svg_bg;
        this.svg_sections = [];
        this.html = this.chart.content_layers.grid;

        this.offset = this.chart.options.grid_offset;
        this.row_height = this.chart.options.row_height;
        this.column_width = this.chart.options.column_width;

        this.width = this.chart.chart_dates.length * this.column_width;
        this.chart.options.grid_width = this.width;
    }


    prepare() {
        this.filtered_resources = [];
        for (let category of this.chart.categories) {
            this.filtered_resources.push(...category.filter_hidden_resources());
        }
    }


    draw() {
        this.draw_background();
        this.draw_rows();
        this.draw_columns();

        for (let category of this.chart.categories) {
            this.draw_break();
            this.draw_section(category);
        }
    }

    draw_background() {
        const bg_container = Utils.create_html('div', {
            style: 'width: 0px; height: 0px',
            parent: this.html
        });

        const cnt = this.filtered_resources.length + this.chart.categories.length;

        this.svg_bg = Utils.create_svg('svg', {
            width: this.width + this.offset * 2,
            height: this.row_height * cnt,
            style: 'display: block',
            parent: bg_container
        });
    }


    draw_rows() {
        const rows_layer = Utils.create_svg('g', { parent: this.svg_bg });

        const cnt = this.filtered_resources.length + this.chart.categories.length;
        let y = 0;
        for (let i = 0; i < cnt; i++) {
            Utils.create_svg('rect', {
                x: 0,
                y: y,
                width: this.width + this.offset * 2,
                height: this.row_height,
                class: 'grid-row',
                parent: rows_layer,
            });
            y += this.row_height;
        }

    }


    draw_columns() {
        const columns_layer = Utils.create_svg('g', { parent: this.svg_bg });

        const cnt = this.filtered_resources.length + this.chart.categories.length;
        let x1 = 0;
        let y1 = 0;
        let x2 = 0;
        let y2 = this.row_height * cnt;

        for (let i = 0; i < this.chart.chart_dates.length + 1; i++) {
            Utils.create_svg('line', {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                class: 'column-line',
                parent: columns_layer,
            });
            x1 += this.column_width;
            x2 += this.column_width;
        }
    }


    draw_break() {
        const width = this.width + this.offset * 2;
        const height = this.row_height;

        Utils.create_html('div', {
            class: 'grid-break',
            style:
                'width: ' + width + 'px;' +
                'height: ' + height + 'px; ' +
                'position: sticky; ' +
                'top: ' + this.chart.options.header_height + 'px',
            parent: this.html
        });
    }


    draw_section(category) {
        const cnt = this.filtered_resources
            .filter(r => r.category === category).length;

        const width = this.width + this.offset * 2;
        const height = this.row_height;

        const svg_container = Utils.create_html('div', {
            style:
                'width: ' + width + 'px; ' +
                'height: ' + height * cnt + 'px;',
            parent: this.html
        });

        const svg_section = Utils.create_svg('svg', {
            width: width,
            height: height * cnt,
            style: 'display: block',
            parent: svg_container,
            'data-type': category.type
        });

        // attach svg section (container for operations) to category
        category.ops_section = svg_section;
        this.svg_sections.push(svg_section);
    }


    bind() {
        const chart = this.chart;

        this.html.addEventListener('click', function(event) {
            chart.reset_operations();

            if (event.target.matches('.bar')) {
                const id = event.target.dataset.id;
                const order = event.target.dataset.order;
                const res_type = event.target.dataset.resType;
                const operation = chart.find_operation(id, res_type, order);

                if (event.detail == 2) {
                    const popup = new Popup(chart, operation);
                    popup.draw(event.layerX, event.layerY);
                    chart.popups.push(popup);
                }
                operation.highlight();
            }
        })
    }


    update_svg_bg() {
        let height = 0;
        for (let category of this.chart.categories) {
            height += this.chart.options.row_height;

            const svg_container = category.ops_section.parentNode;
            if (svg_container.style.display !== 'none') {
                height += svg_container.clientHeight;
            }
        }
        this.svg_bg.height.baseVal.value = height;
    }
}