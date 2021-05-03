import { VIEW_MODE, MONTH_NAMES } from './constants.js'

class Utils {

    // TODO grid width. DELETE this.options.column_width
    // let width = this.options.grid_width + this.options.column_width + 170; // + panel width
    // let height = this.options.header_height + 
    //     (this.options.bar_height + this.options.bar_padding) * Object.values(this.svgs_sizes).length;
    // // TODO grid height !!!!
    // Object.values(this.svgs_sizes).forEach(v => height += v.height);

    static set_string_format() {
        if (!String.format) {
            String.format = function(format) {
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/{(\d+)}/g, function(match, number) { 
                    return typeof args[number] != 'undefined'
                        ? args[number] 
                        : match;
                });
            };
        }
    }


    static get_date_text(date) {
        let date_string = date.toString();
        return date_string.substr(0, date_string.indexOf('GMT') - 1);
    }


    static create_popup(parent, width, height, margin_top, margin_left, content) {
        const svg = this.create_svg('svg', {
            width: width,
            height: height,
            style:
                'margin-top: ' + margin_top + 'px;' +
                'margin-left: ' + margin_left + 'px',
            parent: parent
        });

        const foreign = this.create_svg('foreignObject', {
            width: width,
            height: height,
            parent: svg
        });

        this.create_html('div', {
            innerHTML: content,
            class: 'popup',
            parent: foreign
        });
    }

    // cuts given date to the nearest previous one according to view mode
    // and shifts cutted result to the left or right
    static adjust_date(date, view_mode, shift) {
        let new_date = new Date(date.getTime());

        if (view_mode == VIEW_MODE.HOUR) {
            new_date.setHours(date.getHours() + shift, 0, 0, 0);
        } else if (view_mode == VIEW_MODE.QUARTER_DAY) {
            new_date.setHours((Math.floor(date.getHours() / 6) + shift) * 6, 0, 0, 0);
        } else if (view_mode == VIEW_MODE.HALF_DAY) {
            new_date.setHours((Math.floor(date.getHours() / 12) + shift) * 12, 0, 0, 0);
        } else if (view_mode == VIEW_MODE.DAY) {
            new_date.setHours(0, 0, 0, 0);
        } else if (view_mode == VIEW_MODE.WEEK) {
            // TODO
            current_date = Utils.inc_date(current_date, 7, 'day');
        } else if (view_mode == VIEW_MODE.MONTH) {
            current_date = Utils.inc_date(current_date, 1, 'month');
        }
        return new_date;
    }

    static inc_date(date, quantity, scale) {
        const values = [
            date.getFullYear(),
            date.getMonth() + (scale === 'month' ? quantity : 0),
            date.getDate() + (scale === 'day' ? quantity : 0),
            date.getHours() + (scale === 'hour' ? quantity : 0),
            date.getMinutes() + (scale === 'minute' ? quantity : 0),
            date.getSeconds(),
        ];
        return new Date(...values)
    }

    static create_svg(tag, attrs) {
        const elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let attr in attrs) {
            if (attr === 'parent') {
                const parent = attrs[attr];
                parent.appendChild(elem);
            } if (attr === 'innerHTML') {
                elem.innerHTML = attrs[attr];
            } else {
                elem.setAttribute(attr, attrs[attr]);
            }
        }
        return elem;
    }

    static create_html(tag, attrs, prepend) {
        const elem = document.createElement(tag);
        for (let attr in attrs) {
            if (attr === 'parent') {
                const parent = attrs[attr];
                if (prepend) {
                    parent.prepend(elem);
                } else {
                    parent.appendChild(elem);
                }
            } if (attr === 'innerHTML') {
                elem.innerHTML = attrs[attr];
            } else {
                elem.setAttribute(attr, attrs[attr]);
            }
        }
        return elem;
    }

    static format(date, format_string = 'YYYY-MM-DD HH:mm:ss.SSS') {
        const values = this.get_date_values(date);
        const format_map = {
            YYYY: values[0],
            MM: values[1],
            DD: values[2],
            HH: values[3],
            mm: values[4],
            ss: values[5],
            SSS:values[6],
            D: values[2],
            MMMM: MONTH_NAMES.LONG[+values[1]],
            MMM: MONTH_NAMES.SHORT[+values[1]]
        };

        let keys = format_string.split(' ');
        let result_values = [];

        keys.forEach(key => {
            if (format_map[key]) {
                result_values.push(format_map[key]);
            }
        });
        let str = result_values.join(' ');

        return str;
    }

    static get_view_step_ms(view_mode) {
        let base = 3600000;
        switch (view_mode) {
            case VIEW_MODE.HOUR:
                return base;
            case VIEW_MODE.QUARTER_DAY:
                return base * 6;
            case VIEW_MODE.HALF_DAY:
                return base * 12;
            case VIEW_MODE.DAY:
                return base * 24;
            case VIEW_MODE.WEEK:
                return base * 24 * 7;
            case VIEW_MODE.MONTH:
                return base * 24 * 7 * 30;
        }
    }

    static get_date_values(date) {
        return [
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];
    }

}

export default Utils;