export default class OperationFilter {

    constructor(chart, target) {
        this.chart = chart;
        this.html = target;

        this.setup();
    }


    setup() {
        this.setup_data();
        this.setup_element();
        this.update_element();
    }


    setup_data() {
        this.options = [];

        const category_types = Array.from(new Set(this.chart.operations.map(o => o.type)));

        for (let type of category_types) {
            const option = new Option(type.toUpperCase(), type, true, true);
            this.html.add(option);
            this.options.push(option);
        }
    }


    setup_element() {
        this.element = $(this.html).multiselect({
            buttonWidth: '200px'
        });
    }


    update_element() {
        for (let option of this.element.parent().find('li')) {
            const type = $(option).find('input').val();
            $(option).addClass(type);
        }
    }


    get_selected_types() {
        return this.options.filter(o => o.selected).map(o => o.value)
    }
}