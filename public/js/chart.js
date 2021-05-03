import Utils from './utils.js';
import { VIEW_MODE } from './constants.js';

class Chart {

    constructor(resources) {
        console.time('FFF')
        this.setup_container();
        this.setup_options();
        this.setup_resources(resources);
        this.setup_operations();
        this.setup_boundary_dates();
        this.setup_chart_dates();
        this.setup_extra();
        this.render();
        this.setup_events();
        console.timeEnd('FFF')
    }


    setup_container() {
        this.container = document.getElementById('chart');
        this.controls = document.getElementById('controls');
        this.draw_button = document.getElementById('draw');

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
    }


    setup_resources(resources) {
        this.resources = resources.map(resource => {
            resource.operations.map(operation => {
                operation.time_start = new Date(operation.time_start);
                operation.time_end = new Date(operation.time_end);
                return operation;
            });
            resource.is_hidden = false;
            return resource;
        });

        this.resource_types = Array.from(
            new Set(this.resources.map(r => { return r.type; }))
        );

        for (let type of this.resource_types) {
            this.resources.filter(r => r.type === type).map((r, i) => {
                r.index = i;
            })
        }
    }


    setup_operations() {
        this.full_operations = [];

        // set full operations apart. prepare for rendering phase operations only
        for (let resource of this.resources) {
            let full_ops = resource.operations.filter(o => o.type === 'full');
            this.full_operations.push(...full_ops);

            let phase_ops = resource.operations.filter(o => o.type !== 'full');
            // sort operations and set order index for each one
            phase_ops.sort((op1, op2) => op1.time_start - op2.time_start);
            let id;
            let index;
            phase_ops.forEach((op) => {
                if (!id || id !== op.id) {
                    id = op.id;
                    index = 0;
                }
                op.order = index++;
            });
            resource.operations = phase_ops;
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
    }


    setup_extra() {
        this.options.grid_width = this.chart_dates.length * this.options.column_width;

        // view step quantity * view step time in milliseconds / entire grid width
        const time_step = this.chart_dates.length * Utils.get_view_step_ms(this.options.view_mode) 
            / this.options.grid_width;
        this.options.time_step = time_step;

        this.options.grid_offset = this.options.column_width / 2;

        Utils.set_string_format();
    }


    render() {
        this.clear();
        this.setup_layers();
        this.make_header();
        this.make_content();
        this.make_operations();
        this.update_svg_bg();
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

        const layers = ['corner', 'dates'];
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


    make_header() {
        this.prepare_date_texts();
        this.render_date_texts();
        this.make_header_offsets();
    }


    prepare_date_texts() {
        this.date_texts = [];

        let text_block;
        let prev_date;

        for (let date of this.chart_dates) {
            let date_text = this.get_date_text(date, prev_date);

            if (date_text.upper) {
                if (text_block) {
                    this.date_texts.push(text_block);
                }
                text_block = {};
                text_block.upper = date_text.upper;
                text_block.lower = [];
            }
            text_block.lower.push(date_text.lower);

            prev_date = date;
        }
        this.date_texts.push(text_block);
    }


    render_date_texts() {
        for (let text_block of this.date_texts) {
            const block = Utils.create_html('div', {
                parent: this.header_layers.dates
            });

            Utils.create_html('div', {
                innerHTML: text_block.upper,
                class: 'upper',
                parent: block
            });

            const inner_block = Utils.create_html('div', {
                class: 'lower',
                parent: block
            });

            for (let text of text_block.lower) {
                Utils.create_html('div', {
                    innerHTML: text,
                    style:
                        'width: ' + this.options.column_width + 'px; ' +
                        'text-align: center',
                    parent: inner_block
                });
            }
        }
    }


    get_date_text(date, prev_date) {
        let date_text = {};

        switch (this.options.view_mode) {
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


    make_header_offsets() {
        const nodes = this.container.querySelectorAll('.lower');
        const first = nodes[0];
        const last = nodes[nodes.length - 1];

        Utils.create_html('div', {
            style: 'width: ' + this.options.grid_offset + 'px',
            parent: first
        }, true);

        Utils.create_html('div', {
            style: 'width: ' + this.options.grid_offset + 'px',
            parent: last
        });
    }


    make_content() {
        this.make_panel();
        this.make_grid();
    }


    make_panel() {
        for (let type of this.resource_types) {
            this.render_panel_category(type);

            const resources = this.resources.filter(r => r.type === type && r.is_hidden === false);
            for (let resource of resources) {
                this.render_panel_resource(resource, type);
            }
        }
    }


    render_panel_category(type) {
        const category =  Utils.create_html('div', {
            innerHTML: type,
            class: 'category',
            style:
                'height: ' + (this.options.bar_height + this.options.bar_padding) + 'px; ' +
                'position: sticky; ' +
                'top: ' + this.options.header_height + 'px',
            parent: this.content_layers.panel
        });

        const category_btns = Utils.create_html('div', {
            class: 'category-btns',
            parent: category
        });

        const buttons = [['display', 'show'], ['select'], ['collapse', 'up']];
        for (let [index, classes] of buttons.entries()) {
            Utils.create_html('div', {
                class: classes.join(' '),
                parent: category_btns,
                // style: 'visibility: ' + (index !== 2 ? 'hidden' : ''),
                'data-type': type
            });
        }
    }


    render_panel_resource(resource, type) {
        const res = Utils.create_html('div', {
            class: 'resource',
            style: 'height: ' + (this.options.bar_height + this.options.bar_padding) + 'px;',
            parent: this.content_layers.panel,
            'data-type': type
        });

        Utils.create_html('input', {
            type: 'checkbox',
            checked: resource.is_hidden,
            class: 'res-selector',
            parent: res
        });

        Utils.create_html('div', {
            innerHTML: resource.id,
            class: 'res-id',
            parent: res
        });
    }


    make_grid() {
        this.svgs = {};
        this.svgs_sizes = {};

        this.make_grid_background();
        this.resource_types.map((type) => {
            this.make_grid_layers(type);
        });
    }


    make_grid_background() {
        const svg_bg_parent = Utils.create_html('div', {
            style: 'width: 0px; height: 0px',
            parent: this.content_layers.grid
        });

        const cnt = this.resources.filter(r => r.is_hidden === false).length
            + this.resource_types.length;

        this.svg_bg = Utils.create_svg('svg', {
            width: this.options.grid_width + this.options.grid_offset * 2,
            height: (this.options.bar_height + this.options.bar_padding) * cnt,
            style: 'display: block',
            parent: svg_bg_parent
        });

        this.make_grid_rows();
        this.make_grid_columns();
    }


    make_grid_rows() {
        const rows_layer = Utils.create_svg('g', { parent: this.svg_bg });

        const cnt = this.resources.filter(r => r.is_hidden === false).length
            + this.resource_types.length;
        const width = this.options.grid_width + this.options.grid_offset * 2;
        const height = this.options.bar_height + this.options.bar_padding;

        let y = 0;
        for (let i = 0; i < cnt; i++) {
            Utils.create_svg('rect', {
                x: 0,
                y: y,
                width: width,
                height: height,
                class: 'grid-row',
                parent: rows_layer,
            });
            y += height;
        }
    }


    make_grid_columns() {
        const columns_layer = Utils.create_svg('g', { parent: this.svg_bg });

        let cnt = this.resources.filter(r => r.is_hidden === false).length
            + this.resource_types.length;
        let x1 = 0;
        let y1 = 0;
        let x2 = 0;
        let y2 = (this.options.bar_height + this.options.bar_padding) * cnt;

        for (let i = 0; i < this.chart_dates.length + 1; i++) {
            Utils.create_svg('line', {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                class: 'column-line',
                parent: columns_layer,
            });
            x1 += this.options.column_width;
            x2 += this.options.column_width;
        }
    }


    make_grid_layers(resource_type) {
        const cnt = this.resources.filter(r => r.type === resource_type && r.is_hidden === false).length;
        const width = this.options.grid_width + this.options.grid_offset * 2;
        const height = this.options.bar_height + this.options.bar_padding;

        Utils.create_html('div', {
            class: 'grid-break',
            style:
                'width: ' + width + 'px;' +
                'height: ' + height + 'px; ' +
                'position: sticky; ' +
                'top: ' + this.options.header_height + 'px',
            parent: this.content_layers.grid
        });

        const svg_parent = Utils.create_html('div', {
            style:
                'width: ' + width + 'px; ' +
                'height: ' + height * cnt + 'px;',
            parent: this.content_layers.grid
        });

        this.svgs[resource_type] = Utils.create_svg('svg', {
            width: width,
            height: height * cnt,
            style: 'display: block',
            parent: svg_parent
        });
        this.svgs_sizes[resource_type] = {
            width: width,
            height: height * cnt
        };
    }


    make_operations() {
        this.bars = [];

        // TODO
        this.bars_cnt = 0;
        for (let resource of this.resources.filter(r => r.is_hidden === false)) {
            for (let operation of resource.operations) {
                this.bars.push(new Bar(this, resource, operation));
                this.bars_cnt++;
            }
            this.bars_cnt = 0;
        }
    }


    setup_events() {
        this.setup_controls_events();
        this.setup_panel_events();
        this.setup_bar_events();
    }


    setup_controls_events() {
        // clear previous draw_button event listener
        const draw = this.draw_button.cloneNode(true);
        this.controls.innerHTML = '';
        this.controls.appendChild(draw);

        for (let mode in VIEW_MODE) {
            Utils.create_html('button', {
                innerHTML: VIEW_MODE[mode],
                name: VIEW_MODE[mode],
                class: 'view-button',
                parent: this.controls
            });
        }

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
        console.time('control event');
        this.highlight_controls(button);
        this.setup_boundary_dates();
        this.setup_chart_dates();
        this.setup_extra();
        this.render();
        this.setup_panel_events();
        this.setup_bar_events();
        console.timeEnd('control event');
    }


    setup_panel_events() {
        this.panel_collapse_events();
        this.panel_select_all_events();
        this.panel_display_events();
        this.panel_select_events();
    }


    panel_collapse_events() {
        const chart = this;
        const buttons = this.container.querySelectorAll('.category-btns .collapse');

        for (let button of buttons) {
            const type = button.dataset.type;

            const cnt = this.resources.filter(r => r.type === type && r.is_hidden === false).length;
            const svg_parent = this.svgs[type].parentNode;

            button.addEventListener('click', function() {
                this.classList.toggle('up');
                this.classList.toggle('down');

                // toggle visibility of sibling buttons
                this.parentNode.childNodes.forEach(e => {
                    if (e !== this) {
                        e.style.visibility = e.style.visibility === 'hidden' ? '' : 'hidden';
                    }
                })
                // ... of svgs
                svg_parent.style.display = svg_parent.style.display === 'none' ? '' : 'none';

                // ... of category resources
                let res = this.closest('.category').nextElementSibling;
                for (let i = 0; i < cnt; i++) {
                    res.style.display = res.style.display === 'none' ? '' : 'none';
                    res = res.nextElementSibling;
                }
                chart.update_svg_bg();
            });
        }
    }


    panel_select_all_events() {
        const chart = this;
        const buttons = this.container.querySelectorAll('.category-btns .select');
        const resource_elems = this.container.querySelectorAll('.resource');

        for (let button of buttons) {
            const type = button.dataset.type;

            button.addEventListener('click', function() {
                const filtered = Array.from(resource_elems).filter(r => r.dataset.type === type);

                const all_checked = filtered.every(r => {
                    return r.querySelector('.res-selector').checked;
                });
                const checked_value = !all_checked;

                chart.update_resource_visibilities(filtered, checked_value);
                chart.calculate_resource_indexes(type);
            });
        }
    }


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


    panel_select_events() {
        const chart = this;
        const resource_elems = this.container.querySelectorAll('.resource');

        for (let type of this.resource_types) {
            const filtered = Array.from(resource_elems).filter(r => r.dataset.type === type);

            for (let resource_elem of filtered) {
                let selector_elem = resource_elem.firstChild;
                let id_elem = selector_elem.nextElementSibling;

                for (let child of resource_elem.childNodes) {
                    child.addEventListener('click', function() {
                        if (child === id_elem) {
                            selector_elem.checked = !selector_elem.checked;
                        }
                        const checked_value = selector_elem.checked;
                        chart.update_resource_visibilities([resource_elem], checked_value);
                        chart.calculate_resource_indexes(type);
                    });
                }
            }
        }
    }


    update_resource_visibilities(resource_elems, checked_value) {
        let resource_ids = [];

        for (let resource_elem of resource_elems) {
            let selector_elem = resource_elem.firstChild;
            let id_elem = selector_elem.nextElementSibling;

            selector_elem.checked = checked_value;
            resource_ids.push(id_elem.innerHTML);
        }

        this.resources.filter(r => resource_ids.includes(r.id)).map(r => {
            r.is_hidden = !checked_value;
        });
    }


    calculate_resource_indexes(type) {
        let cnt = 0;
        for (let resource of this.resources.filter(r => r.type === type)) {
            if (resource.is_hidden) {
                resource.index = -1;
            } else {
                resource.index = cnt++;
            }
        }
    }


    highlight_controls(button) {
        if (button.id !== this.draw_button.id) {
            for (let node of this.controls.childNodes) {
                node.classList.remove('selected');
            }
            button.classList.add('selected');
        }
    }


    // TODO 
    update_svg_bg() {
        const row_height = this.options.bar_height + this.options.bar_padding;

        let height = 0;
        for (let type of this.resource_types) {
            height += row_height;

            const svg_parent = this.svgs[type].parentNode;
            if (svg_parent.style.display !== 'none') {
                let cnt = this.resources.filter(r => r.type === type && r.is_hidden === false).length;
                height += row_height * cnt;
            }
        }
        this.svg_bg.height.baseVal.value = height;
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

        const resource = this.resources.find(r => r.index == res_index && r.type == res_type);
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


class Bar {

    constructor(chart, resource, operation) {
        this.set_defaults(chart, resource, operation);
        this.prepare();
        this.draw();
    }


    set_defaults(chart, resource, operation) {
        this.chart = chart;
        this.resource = resource;
        this.operation = operation;
    }


    prepare() {
        const options = this.chart.options;
        const offset = options.grid_offset * 2;

        this.x = (this.operation.time_start - this.chart.chart_dates[0]) / options.time_step + offset;
        this.y = (options.bar_height + options.bar_padding) * this.resource.index
            + options.bar_padding / 2;
        this.width = (this.operation.time_end - this.operation.time_start) / options.time_step;
        this.height = options.bar_height;

        this.corner_radius = options.bar_corner_radius;
    }


    draw() {
        Utils.create_svg('rect', {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rx: this.corner_radius,
            ry: this.corner_radius,
            class: 'bar',
            parent: this.chart.svgs[this.resource.type],
            'data-id': this.operation.id,
            'data-order': this.operation.order,
            'data-type': this.operation.type,
            'data-res-index': this.resource.index,
            'data-res-type': this.resource.type
        });
    }
}

export default Chart;