import Utils from './utils.js';
import {VIEW_MODE} from './constants.js';

export default class TimelineControl {

    constructor(chart, target) {
        this.chart = chart;
        this.html = target;

        this.prepare();
        this.render();
        this.bind();
    }


    prepare() {
    }


    render() {
        // clear previous draw button event listener
        const control = this.html.cloneNode(true);
        this.html.innerHTML = control.innerHTML;

        for (let mode in VIEW_MODE) {
            Utils.create_html('button', {
                innerHTML: VIEW_MODE[mode],
                name: VIEW_MODE[mode],
                class: 'view-button',
                parent: this.html
            });
        }

        // removes whitespace text nodes
        this.html.childNodes.forEach(node => {
            if (node.nodeType == 3) {
                this.html.removeChild(node);
            }
        });

        this.highlight(this.html.querySelector('button[name='
            + this.chart.options.view_mode + ']'));
    }


    bind() {
        const control = this;
        for (let button of this.html.childNodes) {
            button.addEventListener('click', function() {
                if (button.name) {
                    control.chart.options.view_mode = button.name;
                }
                control.highlight(button);
                control.on_click();
            });
        }
    }


    on_click() {
        this.chart.update_resources();
        this.chart.setup_boundary_dates();
        this.chart.setup_chart_dates();
        this.chart.render();
        this.chart.bind();
    }


    highlight(button) {
        const draw_button = this.html.querySelector('#draw');
        if (button.id !== draw_button.id) {
            for (let node of this.html.childNodes) {
                node.classList.remove('selected');
            }
            button.classList.add('selected');
        }
    }
}