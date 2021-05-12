import $ from 'jquery';
import Chart from './js/chart.js';

import multiSelect from 'multiselect-dropdown';

import '@tarekraafat/autocomplete.js/dist/css/autoComplete.01.css';
import 'multiselect-dropdown/multiselect-dropdown.css';

$(document).ready(function() {

    // Minimal parameters
    const dropdown = new multiSelect(
        document.getElementById("test-select"), // target element
        {className: '', maxVisibleOptions: 0}   // options
    );

    $("#draw").click(function() {
        $.get("/go", function(data) {
            console.log(data);
            const chart = new Chart(data);
        });
    });

});