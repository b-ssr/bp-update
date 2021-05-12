export default class OperationFilter {

    constructor(chart, target) {
        this.chart = chart;
        this.html = target;

        this.setup();
    }


    setup() {
        this.setup_element();
        this.setup_data();
        this.update_element();
    }


    setup_element() {
        this.element = new multiSelect( this.html,
            { maxVisibleOptions: 0 }
        );

        this.element.setConfig({
            className: 'op-filter',
        });
        this.element.reload();

        this.options = [];
    }


    setup_data() {
        const category_types = Array.from(new Set(this.chart.operations.map(o => o.type)));

        for (let type of category_types) {
            const option = new Option(type.toUpperCase(), type, true, true);
            this.html.add(option);
            this.options.push(option);
        }

        this.element.reload();
    }


    update_element() {
        const elem_display = this.element.element.querySelector('.multi-select-display');
        const elem_options = this.element.element.querySelector('.multi-select-options');

        elem_display.innerHTML += this.options.map(o => o.text).join(', ');

        for (let elem_option of elem_options.children) {
            const class_value = elem_option.querySelector('input').value;
            elem_option.classList.add(class_value);
        }
    }


    get_selected_types() {
        return this.options.filter(o => o.selected).map(o => o.value)
    }
}