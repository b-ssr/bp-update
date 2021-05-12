import { VIEW_MODE, MONTH_NAMES } from './constants.js'

class Utils {

    // cuts given date to the nearest one according to view mode
    // is_upper specifies, if date corresponds to upper or lower date block
    static adjust_date(date, view_mode, is_upper) {
        let new_date = new Date(date.getTime());

        switch (view_mode) {
            case VIEW_MODE.HOUR:
                if (is_upper) new_date.setHours(0, 0, 0, 0);
                else new_date.setHours(date.getHours(), 0, 0, 0)
                break;
            case VIEW_MODE.QUARTER_DAY:
                if (is_upper) new_date.setHours(0, 0, 0, 0);
                else new_date.setHours(Math.floor(date.getHours() / 6) * 6, 0, 0, 0)
                break;
            case VIEW_MODE.HALF_DAY:
                if (is_upper) new_date.setHours(0, 0, 0, 0);
                else new_date.setHours(Math.floor(date.getHours() / 12) * 12, 0, 0, 0)
                break;
            case VIEW_MODE.DAY:
                new_date.setHours(0, 0, 0, 0);
                if (is_upper) new_date.setDate(1);
                break;
            case VIEW_MODE.WEEK:
                new_date.setHours(0, 0, 0, 0);
                if (is_upper) new_date.setDate(1);
                else new_date.setDate(date.getDate() - 3);
                break;
            case VIEW_MODE.MONTH:
                new_date.setHours(0, 0, 0, 0);
                if (is_upper) new_date.setMonth(0, 1);
                else new_date.setDate(1);
                break;
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

    // merge with create svg
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