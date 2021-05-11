import Utils from '../../utils/utils.js';
import { VIEW_MODE } from '../../utils/constants.js';
import DateBlock from './parts/date-block.js';

export default class Timeline {

    constructor(chart) {
        this.chart = chart;

        this.set_defaults();
        this.prepare();
        this.draw();
        this.make_padding();
    }


    set_defaults() {
        this.dates = this.chart.chart_dates;
        this.html = this.chart.header_layers.timeline;
    }


    prepare() {
        this.prepare_days();
        this.prepare_date_blocks();
    }


    prepare_days() {
        this.days = [];

        let day;
        for (let date of this.dates) {
            if (day != date.getDate()) {
                this.days.push(new Date(date.toDateString()));
                day = date.getDate();
            }
        }
    }


    prepare_date_blocks() {
        this.date_blocks = [];

        let date_block;
        let prev_date;

        for (let date of this.chart.chart_dates) {
            let date_text = this.get_date_text(date, prev_date);
            if (date_text.upper) {
                if (date_block) {
                    // add to array previously made block
                    this.date_blocks.push(date_block);
                }
                date_block = new DateBlock(this.chart, this);
                date_block.upper.date = Utils.adjust_date(date, this.chart.options.view_mode, true);
                date_block.upper.text = date_text.upper;
            }
            const lower = {};
            lower.date = date;
            lower.text = date_text.lower;
            date_block.lowers.push(lower);

            prev_date = date;
        }
        // add last one
        this.date_blocks.push(date_block);
    }


    draw() {
        for (let date_block of this.date_blocks) {
            date_block.draw();
        }
    }


    make_padding() {
        const nodes = this.html.querySelectorAll('.lowers');
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
        const view_mode = this.chart.options.view_mode;
        const date_text = {};

        switch (view_mode) {
            case VIEW_MODE.HOUR:
            case VIEW_MODE.QUARTER_DAY:
            case VIEW_MODE.HALF_DAY:
                if (!prev_date || date.getDate() != prev_date.getDate()) {
                    if (view_mode == VIEW_MODE.HOUR) {
                        date_text.upper = Utils.format(date, 'D MMMM');
                    } else {
                        date_text.upper = Utils.format(date, 'D MMM');
                    }
                }
                date_text.lower = date.getHours();
                break;
            case VIEW_MODE.DAY:
            case VIEW_MODE.WEEK:
                if (!prev_date || date.getMonth() != prev_date.getMonth()) {
                    date_text.upper = Utils.format(date, 'MMMM');
                }
                date_text.lower = date.getDate();
                break;
            case VIEW_MODE.MONTH:
                if (!prev_date || date.getFullYear() != prev_date.getFullYear()) {
                    date_text.upper = Utils.format(date, 'YYYY');
                }
                date_text.lower = Utils.format(date, 'MMM');
                break;
        }
        return date_text;
    }


    on_selection(date) {
        let found_block = this.find_matched_element(date, this.date_blocks);

        switch (this.chart.options.view_mode) {
            case VIEW_MODE.HOUR:
            case VIEW_MODE.QUARTER_DAY:
            case VIEW_MODE.HALF_DAY:
                this.make_selection(found_block.upper.html);
                break;
            case VIEW_MODE.DAY:
            case VIEW_MODE.WEEK:
            case VIEW_MODE.MONTH:
                let found_lower = this.find_matched_element(date, found_block.lowers);
                this.make_selection(found_lower.html);
                break;
        }
    }


    make_selection(element) {
        this.clear_selection();

        element.classList.add('selected');
        element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'})
    }


    clear_selection() {
        this.date_blocks.forEach(block => {
            block.clear_highlight();
        });
    }


    /**
     * Finds element, where target date is located.
     */
    find_matched_element(date, elements) {
        //  target:         30.09
        //  date blocks:    01.09 (sept), 01.10 (oct)   --> found 01.09 (sept)
        //  lowers:         29.09, 30.09, 31.09         --> found 30.09

        let found_element;
        for (let element of elements) {
            let elem_date = element.upper ? element.upper.date : element.date;
            if (elem_date > date) {
                if (!found_element) {
                    found_element = element;
                }
                break;
            }
            found_element = element;
        }
        return found_element;
    }
}