import $ from 'jquery';
import Chart from './js/chart.js';

// TODO into js vanilla
$(document).ready(function() {

    $("#draw").click(function() {
        $.get("/go", function(data) {
            console.log(data);
            const chart = new Chart(data);
        });
    });

});