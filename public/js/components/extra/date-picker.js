export default class DatepPicker {

    constructor(chart, target) {
        this.chart = chart;
        this.html = target;

        this.setup();
        this.bind();
        this.show();
    }


    setup() {
        this.element = new Datepicker(this.html, {
            format: 'dd.mm.yyyy'
        }); 

        const date = this.chart.chart_start;
        this.element.setDate(date);
    }


    bind() {
        this.bind_select();
    }


    bind_select() {
        const chart = this.chart;
        this.html.addEventListener('changeDate', function(event) {
            // console.log(event.detail);
            const date = event.detail.date;
            chart.timeline.on_selection(date);
        })
    }


    show() {
        this.html.style.display = 'block';
    }
}