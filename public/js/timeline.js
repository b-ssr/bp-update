import Utils from './utils.js';
import { VIEW_MODE } from './constants.js';

export default class Timeline {

    constructor(chart) {
        this.chart = chart;

        this.prepare();
        this.draw();
        this.make_padding();
    }


    prepare() {
        // date block consists of:
        //      upper date text             -->     12 August
        //      array of lower date texts   -->     9, 10, 11, 12, 1, 2, 3...
        let date_block;
        this.date_blocks = [];

        let prev_date;
        for (let date of this.chart.chart_dates) {
            let date_text = this.get_date_text(date, prev_date);

            if (date_text.upper) {
                if (date_block) {
                    this.date_blocks.push(date_block);
                }
                date_block = {};
                date_block.upper = date_text.upper;
                date_block.lower = [];
            }
            date_block.lower.push(date_text.lower);
            prev_date = date;
        }
        this.date_blocks.push(date_block);
    }


    draw() {
        for (let date_block of this.date_blocks) {
            const block = Utils.create_html('div', {
                parent: this.chart.header_layers.timeline
            });

            Utils.create_html('div', {
                innerHTML: date_block.upper,
                class: 'upper',
                parent: block
            });

            const lower_block = Utils.create_html('div', {
                class: 'lower',
                parent: block
            });

            for (let lower_text of date_block.lower) {
                Utils.create_html('div', {
                    innerHTML: lower_text,
                    style:
                        'width: ' + this.chart.options.column_width + 'px; ' +
                        'text-align: center',
                    parent: lower_block
                });
            }
        }

    }


    make_padding() {
        const nodes = this.chart.container.querySelectorAll('.header-timeline .lower');
        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        Utils.create_html('div', {
            style: 'width: ' + this.chart.options.grid_offset + 'px',
            parent: first
        }, true);

        Utils.create_html('div', {
            style: 'width: ' + this.chart.options.grid_offset + 'px',
            parent: last
        });
    }


    get_date_text(date, prev_date) {
        let date_text = {};

        switch (this.chart.options.view_mode) {
            case VIEW_MODE.HOUR:
                if (!prev_date || date.getDate() != prev_date.getDate()) {
                    date_text.upper = Utils.format(date, 'D MMMM');
                }
                date_text.lower = date.getHours();
                break;
            case VIEW_MODE.QUARTER_DAY:
                if (!prev_date || date.getDate() != prev_date.getDate()) {
                    date_text.upper = Utils.format(date, 'D MMM');
                }
                date_text.lower = date.getHours();
                break;
            case VIEW_MODE.HALF_DAY:
                break;
            case VIEW_MODE.DAY:
                if (!prev_date || date.getMonth() != prev_date.getMonth()) {
                    date_text.upper = Utils.format(date, 'MMMM');
                }
                date_text.lower = date.getDate();
                break;
            case VIEW_MODE.WEEK:
                break;
            case VIEW_MODE.MONTH:
                break;
        }
        return date_text;
    }
}