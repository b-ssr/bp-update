import Utils from './utils/utils.js';
import Timeline from './components/chart/timeline.js';
import Category from './components/chart/category.js';
import Resource from './components/chart/resource.js';
import Grid from './components/chart/grid.js';
import Operation from './components/chart/operation.js';
import Layer from './components/chart/layer.js';
import TimelineControl from './components/extra/timeline-control.js';
import DatepPicker from './components/extra/date-picker.js';
import Search from './components/extra/search.js';
import OperationFilter from './components/extra/operation-filter.js';
import { VIEW_MODE } from './utils/constants.js';

class Chart {

    constructor(resources) {
        console.time('FFF')
        this.setup(resources);
        this.render();
        this.bind();
        console.timeEnd('FFF')
        this.make_features();
    }

    setup(resources) {
        this.setup_container();
        this.setup_options();
        this.setup_categories(resources);
        this.setup_resources(resources);
        this.setup_operations(resources);
        this.setup_resource_layers();
        this.setup_boundary_dates();
        this.setup_chart_dates();
    }


    setup_container() {
        this.container = document.getElementById('chart');
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

                category.resources.push(resource);
                this.resources.push(resource);
            }
        }
    }


    setup_operations(resources_data) {
        this.operations = [];

        for (let category of this.categories) {
            for (let resource of category.resources) {
                const operations_data = resources_data
                    .find(r => r.id === resource.id).operations;

                for (let operation_data of operations_data) {
                    if (operation_data.type === 'full') {
                        continue;
                    }
                    const operation = new Operation(this, resource, operation_data);
                    resource.operations.push(operation);
                    this.operations.push(operation);
                }

                resource.operations.sort((o1, o2) => o1.time_start - o2.time_start);
                this.setup_operations_order(resource.operations);
            }
        }
    }


    setup_operations_order(operations) {
        // indicates order of phase operation within its parent full operation
        // all phase operations have the same id
        let id;
        let order = 0;
        for (let operation of operations) {
            if (id != operation.id) {
                order = 0;
            }
            operation.order = order++;
            id = operation.id;
        }
    }


    setup_resource_layers() {
        for (let resource of this.resources) {
            const layers_numbers = Array.from(
                new Set(resource.resource_data.operations
                    .map(operation => operation.layer))
                );

            if (layers_numbers.length > 1) {
                layers_numbers.sort();
                for (let layer_number of layers_numbers) {
                    const operations = resource.operations.filter(o => o.layer == layer_number);
                    resource.layers.push(new Layer(this, resource, operations, layer_number));
                }
            }
        }
    }


    update_resources() {
        for (let category of this.categories) {
            let index = 0;

            for (let resource of category.resources) {
                if (category.show_hidden) {
                    resource.is_hidden = false;
                    resource.index = index++;
                } else {
                    resource.is_hidden = !resource.is_selected;
                    if (!resource.is_hidden) {
                        resource.index = index++;
                    } else {
                        resource.index = -1;
                    }
                }
            }
        }
    }


    setup_boundary_dates() {
        this.chart_start = this.chart_end = null;

        // find selected operation types, then filter them. 
        // by default all types are selected
        let selected_types;
        if (this.filter) {
            selected_types = this.filter.get_selected_types();
        }

        for (let category of this.categories) {
            const resources = category.filter_hidden_resources();

            for (let resource of resources) {
                let operations = resource.operations;
                if (selected_types) {
                    operations = operations.filter(o => selected_types.includes(o.type));
                }
                operations.map(operation => {
                    if (!this.chart_start || operation.time_start < this.chart_start) {
                        this.chart_start = operation.time_start;
                    }
                    if (!this.chart_end || operation.time_end > this.chart_end) {
                        this.chart_end = operation.time_end;
                    }
                });
            }
        }
    }


    setup_chart_dates() {
        this.chart_dates = [];

        let current_date = Utils.adjust_date(this.chart_start, this.options.view_mode, false);
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
        this.full_time = this.chart_end - this.chart_start;
            // + Utils.get_view_step_ms(this.options.view_mode);
    }


    render() {
        this.clear();
        this.setup_layers();
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
        this.setup_popup_layer();
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


    setup_popup_layer() {
        this.popups = [];

        this.popup_layer = Utils.create_html('div', {
            class: 'popup-layer',
            parent: this.container,
        }, true);
    }


    render_header() {
        this.timeline = new Timeline(this);
    }


    render_panel() {
        for (let category of this.categories) {
            category.draw();

            const resources = category.filter_hidden_resources();
            for (let resource of resources) {
                resource.draw();

                if (resource.layers.length) {
                    resource.draw_layers_svg();
                    for (let layer of resource.layers) {
                        layer.draw();
                    }
                }
            }
        }
    }


    render_grid() {
        this.grid = new Grid(this);
        this.grid.prepare();
        this.grid.draw();
    }


    render_operations() {
        // by default all types are selected
        let selected_types;
        if (this.filter) {
            selected_types = this.filter.get_selected_types();
        }

        for (let category of this.categories) {
            const resources = category.filter_hidden_resources();

            let index = 0;
            for (let resource of resources) {
                let operations = resource.operations;
                if (selected_types) {
                    operations = operations.filter(o => selected_types.includes(o.type));
                }

                if (resource.layers.length) {
                    for (let layer of resource.layers) {
                        index++;
                        const ops = operations.filter(o => o.layer_number == layer.number);
                        for (let op of ops) {
                            op.prepare(index);
                            op.draw();
                        }
                    }
                } else {
                    for (let op of operations) {
                        op.prepare(index);
                        op.draw();
                    }
                }
                index++;
            }
        }
    }


    bind() {
        for (let category of this.categories) {
            category.bind();
            const resources = category.filter_hidden_resources();
            for (let resource of resources) {
                resource.bind();
            }
        }
        this.grid.bind();
    }


    make_features() {
        const control_target = document.getElementById('control');
        const picker_target = document.getElementById('picker');
        const search_target = document.getElementById('search');
        const filter_target = document.getElementById('filter');

        this.control = new TimelineControl(this, control_target);
        this.picker = new DatepPicker(this, picker_target);
        this.search = new Search(this, search_target);
        this.filter = new OperationFilter(this, filter_target);
    }


    find_resource(id) {
        let res = this.resources.find(r => r.id == id);
        return res;
    }
    

    find_operation(id, res_type, order) {
        let ops;
        ops = this.operations.filter(o => o.id == id);
        if (res_type) {
            ops = ops.filter(o => o.resource.category.type == res_type);
        }
        if (order) {
            ops = ops.filter(o => o.order == order);
        }
        return ops[0];
    }


    reset_resources() {
        this.resources.forEach(resource => {
            resource.clear_highlight();
        });
    }


    reset_operations() {
        this.operations.forEach(operation => {
            operation.clear_highlight();
        });
    }
}

export default Chart;