import Operation from "../chart/operation.js";
import Resource from "../chart/resource.js";

export default class Search {

    constructor(chart, target) {
        this.chart = chart;
        this.html = target;

        this.setup();
    }


    setup() {
        this.selected_item;

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
        let src;
        let sources = [];

        for (let category of this.chart.categories) {
            const resources = category.filter_hidden_resources();
            for (let resource of resources) {
                src = {};
                src.key = resource.id;
                src.value = resource,
                sources.push(src);

                for (let operation of resource.operations) {
                    src = {};
                    src.key = operation.id;
                    src.value = operation,
                    sources.push(src);
                }
            }
        }
        this.element.data.src = sources;
        this.element.data.key = ['key'];
    }


    make_selection(selection) {
        this.html.value = selection.key;
        this.selected_item = selection.value;

        this.chart.reset_resources();
        this.chart.reset_operations();

        if (this.selected_item instanceof Operation) {
            this.make_selection_op();
        } else if (this.selected_item instanceof Resource){
            this.make_selection_res();
        }
    }


    make_selection_res() {
        const resource = this.selected_item;

        if (resource.category.is_collapsed) {
            resource.category.toggle_collapse();
        }

        resource.highlight();
        resource.html.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'})
    }


    make_selection_op() {
        const operation = this.selected_item;

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