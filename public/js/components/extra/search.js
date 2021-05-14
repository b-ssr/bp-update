// import autoComplete from "@tarekraafat/autocomplete.js";

export default class Search {

    constructor(chart, target) {
        this.chart = chart;
        this.html = target;

        this.setup();
    }


    setup() {
        this.selected_id;

        this.setup_element();
        this.setup_data();
        this.show();
    }


    setup_element() {
        const search = this;

        this.element = new autoComplete({
            selector: '#search',
            data: {
                src: []
            },
            threshold: 1,
            placeHolder: "Search...",
            onSelection: (feedback) => {
                const selection = feedback.selection.value;
                search.make_selection(selection);
            },
            resultsList: {
                render: true,
                maxResults: 7
            }
        });
    }


    setup_data() {
        let source = [];

        for (let category of this.chart.categories) {
            const resources = category.filter_hidden_resources();
            for (let resource of resources) {
                source.push(resource.id)

                const op_ids = Array.from(new Set(resource.operations.map(o => o.id)))
                for (let op_id of op_ids) {
                    source.push(op_id + ' (' + resource.category.type + ')');
                }
            }
        }
        this.element.data.src = source;
    }


    make_selection(selection) {
        this.html.value = selection;

        const parts = selection.split(' ');
        let id = parts[0];
        let res_type = parts[1];
        // res_type is resource type, but is defined for operation here!
        // (multiple operations can have the same id, but different resource type)
        if (res_type) {
            res_type = res_type.substring(1, res_type.length - 1);
        }

        this.chart.reset_resources();
        this.chart.reset_operations();
        this.selected_id = id;

        if (res_type) {
            this.make_selection_op(id, res_type);
        } else {
            this.make_selection_res(id);
        }
    }


    make_selection_res(id) {
        const resource = this.chart.find_resource(id);

        if (resource.category.is_collapsed) {
            resource.category.toggle_collapse();
        }

        resource.highlight();
        resource.html.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
    }


    make_selection_op(id, res_type) {
        const operation = this.chart.find_operation(id, res_type, null);

        if (operation.resource.category.is_collapsed) {
            operation.resource.category.toggle_collapse();
        }

        operation.highlight();
        operation.resource.highlight();

        operation.resource.html.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
        setTimeout(function() {
            operation.html.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'})
        }, 500)
    }


    show() {
        this.html.style.display = 'block';
    }
}