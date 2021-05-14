import Utils from '../../../utils/utils.js';

export default class DateBlock {
    /**
     * date block consists of:
     *      upper part      -->     August (month)
     *      lower parts     -->     ...22, 23, 24, 25, 26... (days)
     */
    constructor(chart, timeline) {
        this.chart = chart;
        this.timeline = timeline;

        this.set_defaults();
    }


    set_defaults() {
        this.html;
        // upper = { date: 01.02.2000, text: 'February', html: <element> }
        this.upper = {};
        // lowers = [{ date: 22.02.2000, text: '22', html: <element> }, {...}]
        this.lowers = [];
    }


    draw() {
        this.html = Utils.create_html('div', {
            parent: this.timeline.html
        });

        this.draw_upper();
        this.draw_lower();
    }


    draw_upper() {
        this.upper.html = Utils.create_html('div', {
            innerHTML: this.upper.text,
            class: 'upper',
            parent: this.html
        });
    }


    draw_lower() {
        const lowers = Utils.create_html('div', {
            class: 'lowers',
            parent: this.html
        });

        for (let lower of this.lowers) {
            lower.html = Utils.create_html('div', {
                innerHTML: lower.text,
                class: 'lower',
                style:
                    'width: ' + this.chart.options.column_width + 'px; ' +
                    'text-align: center',
                parent: lowers
            });
        }
    }


    clear_highlight() {
        this.upper.html.classList.remove('selected');
        for (let lower of this.lowers) {
            lower.html.classList.remove('selected');
        }
    }
}