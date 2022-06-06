$(document).ready(function() {
    var numRows = 10;
    var lineData = [], barData = [];
    var lineLabels = [], barLabels = [];
    var lineChart, barChart;
    var length;

    function getLineData(){
        lineData = [];
        $('th#uValues').each(function(){
            value = Number($(this).html());
            lineData.push(value);
        });
    }

    function createLineLabels(){
        lineLabels = [];
        length = (lineData.length < numRows) ? lineData.length : numRows;
        
        for(i=0; i < length; i++){
            lineLabels[i] = String(i+1);
        };
    };

    function drawLineChart(){
        $canvas = $("#lineChart");
        ctx = $canvas[0].getContext("2d");
        lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: lineLabels,
                datasets: [{
                    label: "Respiration Rate",
                    data: lineData,
                    fill: false,
                    borderColor: "rgb(75, 192, 192)",
                }]
            },
        }
        );
    }

    function getBarData(days){
        barData = [];
        for(i=0;i<days;i++){
            value = Number($("span#Day"+(i+1)).html());
            barData.push(value);
        };
        
    };

    function createBarLabels(days){
        barLabels = [];
            
        for(i=0; i < days; i++){
            barLabels[i] = String(i+1);
        };
    };

    function drawBarChart(){
        $canvas = $("#barChart");
        ctx = $canvas[0].getContext("2d");
        barChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: barLabels,
                datasets: [{
                    label: "Average Respiration Rate",
                    data: barData,
                    backgroundColor: ["#FFEC8B"],
                }]
            },
            options: {
                scales:{
                    x:{
                        title: {
                            display: true,
                            text: 'Days in month'
                        }                        
                    }
                },
                plugins:{
                    title:{
                        display: true,
                        text: 'Daily Average Respiration Rate in ' + $('#select_month').find("option:selected").text()
                    }                  
                }
            }
        });
    }

    function createLineChart(){
        getLineData();
        createLineLabels();
        drawLineChart();  
    }

    function createBarChart(){
        days = Number($("span#days").html());
        getBarData(days);
        createBarLabels(days);
        drawBarChart();  
    }


    createLineChart();
    createBarChart();

    $('#table').DataTable();

    $('select[name="table_length"]').change(function(){
        numRows = $(this).val();
        lineChart.destroy();
        createLineChart();
    });
 
    $('#table_paginate').on('click', function(){
        lineChart.destroy();
        createLineChart();
    })

    $('#select_month').change(function(){
        const re = /\?month=\w*/;
        month = $(this).val();
        url = window.location.href;
        if(!url.match(re))
            url = url + "?month=" + month;
        else
            url = url.replace(re, "?month="+month);
        $(location).prop('href', url); 
    });
});