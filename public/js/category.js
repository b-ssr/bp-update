import Utils from './utils.js';

// category buttons. key - button name, value - array of css classes
const BUTTONS = {
    DISPLAY: 'display show',
    SELECT: 'select',
    COLLAPSE: 'collapse up'
}

export default class Category {

    constructor(chart, type) {
        this.chart = chart;
        this.type = type;

        this.set_defaults();
    }


    set_defaults() {
        this.html;
        this.resources = [];
    }


    draw() {
        this.draw_container();
        this.draw_category();
        this.draw_buttons();
    }


    draw_container() {
        this.container = Utils.create_html('div', {
            class: 'panel-box',
            parent: this.chart.content_layers.panel,
            'data-type': this.type
        });
    }


    draw_category() {
        this.html =  Utils.create_html('div', {
            innerHTML: this.type,
            class: 'category',
            style:
                'height: ' + this.chart.options.row_height + 'px; ' +
                'position: sticky; ' +
                'top: ' + this.chart.options.header_height + 'px',
            parent: this.container
        });
    }


    draw_buttons() {
        const category_btns = Utils.create_html('div', {
            class: 'category-btns',
            parent: this.html
        });

        for (let button in BUTTONS) {
            Utils.create_html('div', {
                class: BUTTONS[button],
                parent: category_btns,
                'data-type': this.type
            });
        }
    }


    bind() {
        this.bind_collapse();
        this.bind_select();
        this.bind_display();
    }


    bind_collapse() {
        const category = this;
        const button = this.html.querySelector('.collapse');

        button.addEventListener('click', function() {
            this.classList.toggle('up');
            this.classList.toggle('down');

            // toggle visibility of sibling buttons
            this.parentNode.childNodes.forEach(e => {
                if (e !== this) {
                    e.style.visibility = e.style.visibility === 'hidden' ? '' : 'hidden';
                }
            })

            category.toggle_collapse();
        });
    }


    bind_select() {
        const category = this;
        const button = this.html.querySelector('.select');

        button.addEventListener('click', function() {
            const not_selected = category.resources.filter(r => !r.is_selected);

            if (not_selected.length) {
                not_selected.forEach(resource => {
                    resource.toggle_select();
                });
            } else {
                category.resources.forEach(resource => {
                    resource.toggle_select();
                });
            }
        });
    }


    bind_display() {
        const category = this;
        const button = this.html.querySelector('.display');

        button.addEventListener('click', function() {
            // TODO
        });
    }


    toggle_collapse() {
        // hide section with operations
        const elem = this.ops_section.parentNode;
        elem.style.display = elem.style.display === 'none' ? '' : 'none';

        for (let resource of this.resources) {
            resource.toggle_display();
        }

        this.chart.grid.update_svg_bg();
    }


    recalc_res_indexes() {
        let index = 0;
        for (let resource of this.resources) {
            if (resource.is_hidden) {
                resource.index = -1;
            } else {
                resource.index = index++;
            }
        }
    }
}