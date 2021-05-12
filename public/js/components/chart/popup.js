import Utils from '../../utils/utils.js';

export default class Popup {

    constructor(chart, operation) {
        this.chart = chart;
        this.operation = operation;

        this.set_defaults();
    }


    set_defaults() {
        this.html;
        this.layer = this.chart.popup_layer;

        this.text = `
        <table>
            <tr>
                <td><strong>Operation ID - </strong></td>
                <td class="op"></td>
            </tr>
            <tr>
                <td><strong>Start - </strong></td><td class="start"></td>
            </tr>
            <tr>
                <td><strong>End - </strong></td>
                <td class="end"></td>
            </tr>
            <tr>
                <td><strong>State - </strong></td>
                <td class="op-state"></td>
            </tr>
            <tr>
                <td><strong>Resource - </strong></td>
                <td><div class="res"></div> (<div class="res-type"></div>)</td>
            </tr>
        </table>
        `;
    }


    draw(x, y) {
        this.prepare(x, y);
        this.draw_popup();
        this.make_content();
        this.update_sizes();
        this.bind_destroy();
    }


    prepare(x, y) {
        this.layer.innerHTML = '';

        this.margin_top = y;
        this.margin_left = x;
    }


    draw_popup() {
        const svg = Utils.create_svg('svg', {
            width: 0,
            height: 0,
            parent: this.layer
        });

        const foreign = Utils.create_svg('foreignObject', {
            parent: svg
        });

        this.html = Utils.create_html('div', {
            innerHTML: this.text,
            class: 'popup',
            parent: foreign
        });
    }


    make_content() {
        const operation = this.operation;
        const resource = this.operation.resource;

        this.html.querySelector('.op').innerHTML = operation.id;
        this.html.querySelector('.res').innerHTML = resource.id;
        this.html.querySelector('.start').innerHTML = operation.time_start.toLocaleString('cs-CZ');
        this.html.querySelector('.end').innerHTML = operation.time_end.toLocaleString('cs-CZ');
        this.html.querySelector('.res-type').innerHTML = resource.category.type;
        this.html.querySelector('.op-state').innerHTML = operation.type;
    }


    update_sizes() {
        const svg = this.html.closest('svg');
        const foreign = this.html.closest('foreignObject');

        const width = this.html.scrollWidth;
        const height = this.html.scrollHeight;

        svg.width.baseVal.value = width;
        svg.height.baseVal.value = height;
        foreign.width.baseVal.value = width;
        foreign.height.baseVal.value = height;

        svg.style['margin-top'] = this.margin_top - height - 10 + 'px';
        svg.style['margin-left'] = this.margin_left - width / 5 + 'px';
    }


    bind_destroy() {
        const popup = this;

        const html_body = this.chart.container.closest('body');
        const blocker = Utils.create_html('div', {
            class: 'popup-blocker',
            parent: html_body
        }, true);

        const destroy_callback = function() {
            popup.destroy();
            blocker.remove();
        }

        blocker.addEventListener('click', destroy_callback);
        blocker.addEventListener('wheel', destroy_callback);
    }


    destroy() {
        this.html.closest('svg').remove();
    }
}