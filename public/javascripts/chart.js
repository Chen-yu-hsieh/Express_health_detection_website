$(document).ready(function() {
    var numRows = 10;
    var data = [];
    var labels = [];
    var length, myChart;

    function getData(){
        data = [];
        $('th#values').each(function(){
            value = Number($(this).html());
            data.push(value);
        });
    }

    function createLabels(){
        labels = [];
        length = (data.length < numRows) ? data.length : numRows;
        
        for(i=0; i < length; i++){
            labels[i] = String(i+1);
        };
    };

    function drawChart(){
        $canvas = $('#chart');
        ctx = $canvas[0].getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '呼吸率',
                    data: data,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                }]
            },
        }
        );
    }

    function draw(){
        getData();
        createLabels();
        drawChart();  
    }

    draw();

    $('#table').DataTable();

    $('select').change(function(){
        numRows = $('select').val();
        myChart.destroy();
        draw();
    });
 
    $('#table_paginate').on('click', function(){
        myChart.destroy();
        draw();
    })
});