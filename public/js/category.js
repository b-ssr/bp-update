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

        this.prepare();
        this.draw();
    }


    prepare() {
        this.make_container();
    }


    make_container() {
        this.container = Utils.create_html('div', {
            class: 'panel-box',
            parent: this.chart.content_layers.panel,
            'data-type': this.type
        });
    }


    draw() {
        const category =  Utils.create_html('div', {
            innerHTML: this.type,
            class: 'category',
            style:
                'height: ' + this.chart.options.row_height + 'px; ' +
                'position: sticky; ' +
                'top: ' + this.chart.options.header_height + 'px',
            parent: this.container
        });

        const category_btns = Utils.create_html('div', {
            class: 'category-btns',
            parent: category
        });

        for (let button in BUTTONS) {
            Utils.create_html('div', {
                class: BUTTONS[button],
                parent: category_btns,
                'data-type': this.type
            });
        }

        this.html = category;
    }


    bind() {
        this.bind_collapse();
        this.bind_select();
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

            category.collapse();
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


    collapse() {
        // hide section with operations
        const elem = this.ops_section.parentNode;
        elem.style.display = elem.style.display === 'none' ? '' : 'none';

        for (let resource of this.resources) {
            resource.hide();
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