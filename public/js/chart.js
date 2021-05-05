import Utils from './utils.js';
import Timeline from './timeline.js';
import Category from './category.js';
import Resource from './resource.js';
import Grid from './grid.js';
import Operation from './operation.js';
import { VIEW_MODE } from './constants.js';

class Chart {

    constructor(resources) {
        // TODO
        this.ddd = resources;

        console.time('FFF')
        this.setup(resources);
        this.render();
        this.bind();
        console.timeEnd('FFF')
    }

    setup(resources) {
        this.setup_container();
        this.setup_options();
        this.setup_categories(resources);
        this.setup_resources(resources);
        this.setup_operations(resources);
        this.setup_boundary_dates();
        this.setup_chart_dates();
        this.setup_extra();
    }


    setup_container() {
        this.container = document.getElementById('chart');
        this.controls = document.getElementById('controls');

        this.container.style.display = 'block';
    }


    setup_options() {
        const default_options = {
            header_height: 50,
            column_width: 60,
            bar_height: 20,
            bar_padding: 18,
            bar_corner_radius: 2,
            step: 24,
            view_mode: VIEW_MODE.HOUR,
        };
        this.options = default_options;

        this.options.row_height =
            this.options.bar_height + this.options.bar_padding;
        this.options.grid_offset = this.options.column_width / 2;
    }


    setup_categories(resources_data) {
        this.categories = [];

        const category_types = new Set(resources_data.map(r => { return r.type; }));

        for (let category_type of category_types) {
            this.categories.push(new Category(this, category_type));
        }
    }


    setup_resources(resources_data) {
        this.resources = [];

        for (let category of this.categories) {
            const res_filtered = resources_data.filter(r => r.type === category.type);

            // resource index within category resources
            let index = 0;
            for (let res_data of res_filtered) {
                const resource = new Resource(this, category, res_data);
                resource.index = index++;

                this.resources.push(resource);
                category.resources.push(resource);
            }
        }
    }


    setup_operations(resources_data) {
        this.operations = [];

        for (let resource of this.resources) {
            const op_filtered = resources_data.find(r => r.id === resource.id).operations;

            for (let op_data of op_filtered) {
                if (op_data.type === 'full'){
                    continue;
                }
                const operation = new Operation(this, resource, op_data);

                this.operations.push(operation);
                resource.operations.push(operation);
            }

            resource.operations.sort((o1, o2) => o1.time_start - o2.time_start);
            // operation index within recource operations
            let index = 0;
            for (let operation of resource.operations) {
                operation.index = index++;
            }
        }
    }


    setup_boundary_dates() {
        this.chart_start = this.chart_end = null;

        this.resources.filter(r => r.is_hidden === false).map(resource => {
            resource.operations.map(operation => {
                if (!this.chart_start || operation.time_start < this.chart_start) {
                    this.chart_start = operation.time_start;
                }
                if (!this.chart_end || operation.time_end > this.chart_end) {
                    this.chart_end = operation.time_end;
                }
            });
        });
    }


    setup_chart_dates() {
        this.chart_dates = [];

        let current_date = Utils.adjust_date(this.chart_start, this.options.view_mode, 0);
        this.chart_dates.push(current_date);

        while (current_date < this.chart_end) {
            if (this.options.view_mode == VIEW_MODE.HOUR) {
                current_date = Utils.inc_date(current_date, 1, 'hour');
            } else if (this.options.view_mode == VIEW_MODE.QUARTER_DAY) {
                current_date = Utils.inc_date(current_date, 6, 'hour');
            } else if (this.options.view_mode == VIEW_MODE.HALF_DAY) {
                current_date = Utils.inc_date(current_date, 12, 'hour');
            } else if (this.options.view_mode == VIEW_MODE.DAY) {
                current_date = Utils.inc_date(current_date, 1, 'day');
            } else if (this.options.view_mode == VIEW_MODE.WEEK) {
                current_date = Utils.inc_date(current_date, 7, 'day');
            } else if (this.options.view_mode == VIEW_MODE.MONTH) {
                current_date = Utils.inc_date(current_date, 1, 'month');
            }
            this.chart_dates.push(current_date);
        }
        // update start & end dates of chart
        this.chart_start = this.chart_dates[0];
        this.chart_end = this.chart_dates[this.chart_dates.length - 1];

        // full time = end - start + padding
        this.full_time = this.chart_end - this.chart_start
            + Utils.get_view_step_ms(this.options.view_mode);
    }


    setup_extra() {
        Utils.set_string_format();
    }


    render() {
        this.clear();
        this.setup_layers();
        this.render_controls();
        this.render_header();
        this.render_panel();
        this.render_grid();
        this.render_operations();
    }


    clear() {
        this.container.innerHTML = '';
    }


    setup_layers() {
        this.setup_header_layers();
        this.setup_content_layers();
    }


    setup_header_layers() {
        this.header_layers = {};

        const header = Utils.create_html('div', {
            class: 'header',
            style: 'height: ' + this.options.header_height + 'px',
            parent: this.container
        });

        const layers = ['corner', 'timeline'];
        for (let layer of layers) {
            this.header_layers[layer] = Utils.create_html('div', {
                innerHTML: layer === 'corner' ? 'Time' : '',
                class: 'header-' + layer,
                parent: header
            })
        }
    }


    setup_content_layers() {
        this.content_layers = {};

        const content = Utils.create_html('div', {
            class: 'content',
            parent: this.container
        });

        const layers = ['panel', 'grid'];
        for (let layer of layers) {
            this.content_layers[layer] = Utils.create_html('div', {
                class: 'content-' + layer,
                parent: content
            })
        }
    }


    render_controls() {
        // clear previous draw button event listener
        const controls = this.controls.cloneNode(true);
        this.controls.innerHTML = controls.innerHTML;

        for (let mode in VIEW_MODE) {
            Utils.create_html('button', {
                innerHTML: VIEW_MODE[mode],
                name: VIEW_MODE[mode],
                class: 'view-button',
                parent: this.controls
            });
        }
    }


    render_header() {
        this.timeline = new Timeline(this);
    }


    render_panel() {
        for (let category of this.categories) {
            category.draw();
            for (let resource of category.resources) {
                resource.draw();
            }
        }
    }


    render_grid() {
        this.grid = new Grid(this);
        this.grid.draw();
    }


    render_operations() {
        for (let resource of this.resources) {
            for (let operation of resource.operations) {
                operation.prepare();
                operation.draw();
            }
        }
    }


    // TODO !!!

    bind() {
        this.bind_controls();
        for (let category of this.categories) {
            category.bind();
        }
        for (let resource of this.resources) {
            resource.bind();
        }
        // this.setup_panel_events();
        // this.setup_bar_events();
    }


    bind_controls() {
        const chart = this;
        for (let button of this.controls.childNodes) {
            button.addEventListener('click', function() {
                if (button.name) {
                    chart.options.view_mode = button.name;
                }
                chart.on_controls_event(button);
            });
        }
    }


    on_controls_event(button) {
        // console.time('control event');
        this.highlight_controls(button);
        this.setup_boundary_dates();
        this.setup_chart_dates();
        this.setup_extra();
        this.render();
        this.bind();
        // console.timeEnd('control event');
    }


    highlight_controls(button) {
        const draw_button = this.controls.querySelector('#draw');
        if (button.id !== draw_button.id) {
            for (let node of this.controls.childNodes) {
                console.log(node.classList)
                // node.classList.remove('selected');
            }
            // button.classList.add('selected');
        }
    }


    // TODO
    panel_display_events() {
        const chart = this;
        const buttons = this.container.querySelectorAll('.category-btns .display');

        for (let button of buttons) {
            const type = button.dataset.type;

            button.addEventListener('click', function() {
                if (chart.resources.some(r => { return r.is_hidden; })) {
                }
                chart.setup_boundary_dates();
                chart.setup_chart_dates();
                chart.setup_extra();
                chart.render();
                chart.setup_panel_events();
            });
        }
    }



    setup_bar_events() {
        this.bar_select_events();
        this.bar_popup_events();
        this.bar_multiselect_events();
    }


    bar_select_events() {
        const chart = this;
        const content = this.container.querySelector('.content-grid');

        content.addEventListener('click', function(event) {
            if (event.target.matches('.group-select')) {
                return;
            }
            chart.reset_bars();
            if (event.target.matches('.bar')) {
                event.target.style['stroke-width'] = '2.5px';
            }
        });
    }


    bar_popup_events() {
        // TODO create popup area
        this.popup_area = Utils.create_html('div', {
            class: 'popup-area',
            parent: this.container,
            style: 'width: 0px; height: 0px; position: relative; z-index: 50'
        }, true);

        // TODO add to chart options
        const popup_width = 440;
        const popup_height = 86;

        const chart = this;
        const content = this.container.querySelector('.content-grid');

        content.addEventListener('click', function(event) {
            if (event.target.matches('.bar') && event.detail == 2) {
                setTimeout(function() {
                    chart.popup_area.innerHTML = '';
                    const margin_top = event.layerY - popup_height - 10;
                    const margin_left = event.layerX - popup_width / 5;
                    const popup_text = chart.prepare_popup_text(event.target);

                    Utils.create_popup(chart.popup_area, popup_width, popup_height,
                        margin_top, margin_left, popup_text);
                }, 200);
            } else {
                chart.popup_area.innerHTML = '';
            }
        });
    }


    prepare_popup_text(operation_elem) {
        let popup_text = `
            <strong>Resource ID</strong>: {0}<br/>
            <strong>Operation ID</strong>: {1}<br/>
            <strong>Time</strong>: {2} -- {3}<br/>
            <strong>Resource type</strong>: {4}. <strong>Operation state</strong>: {5}`;

        const op_id = operation_elem.dataset.id;
        const op_order = operation_elem.dataset.order;
        const op_type = operation_elem.dataset.type;
        const res_index = operation_elem.dataset.resIndex;
        const res_type = operation_elem.dataset.resType;

        const resource = this.data.resources.find(r => r.index == res_index && r.type == res_type);
        const operation = resource.operations.find(o => o.id == op_id && o.order == op_order);

        let time_start = Utils.get_date_text(operation.time_start);
        let time_end = Utils.get_date_text(operation.time_end);

        return String.format(popup_text, resource.id, operation.id,
            time_start, time_end, res_type.toUpperCase(), op_type.toUpperCase());
    }


    bar_multiselect_events() {
        const chart = this;
        const content = this.container.querySelector('.content-grid');
        content.addEventListener("mousedown", mouse_down);
        content.addEventListener("mouseup", mouse_up);

        let mouse_timer;
        let op_elem;

        function mouse_down(event) { 
            mouse_up();
            if (event.target.matches('.bar')) {
                op_elem = event.target;
            }
            mouse_timer = window.setTimeout(exec_mouse_down, 1000);
        }

        function mouse_up() { 
            if (mouse_timer) {
                op_elem = null;
                window.clearTimeout(mouse_timer);
            }
        }

        function exec_mouse_down() { 
            if (op_elem) {
                chart.reset_bars();

                const op_id = op_elem.dataset.id;
                const res_index = op_elem.dataset.resIndex;
                const selector = '.bar'
                    + '[data-id="' + op_id + '"]'
                    + '[data-res-index="' + res_index + '"]'

                const bars = op_elem.parentNode.querySelectorAll(selector);
                bars.forEach(bar => {
                    bar.style['stroke-width'] = '2.5px';
                    bar.classList.add('group-select');
                });
            }
        }
    }


    reset_bars() {
        const bars = this.container.querySelectorAll('.bar');

        bars.forEach(bar => {
            bar.classList.remove('group-select');
            bar.style['stroke-width'] = '1px';
        });
    }
}

export default Chart;