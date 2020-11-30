const temp = document.getElementById('temperature');
const hum = document.getElementById('humidity');

const livebars = document.getElementsByClassName('live');
changeLivebarColor = (color) => {
    [].forEach.call(livebars, (element) => {
        element.style.backgroundColor = color;
    });
};


var socket = io();
socket.on('data', data => {
    temp.innerHTML = data.temp;
    hum.innerHTML = data.hum;
    changeLivebarColor("green");
});

socket.on('error', _ => {
    temp.innerHTML = 0.0;
    hum.innerHTML = 0.0;
    changeLivebarColor("red");
});

//idk if it even does anything xd
socket.on('reconnecting', (tries) => {
    changeLivebarColor("orange");
    if (tries === 3) {
        changeLivebarColor("red");

    }
});

socket.io.on('reconnect_error', _ => {
    changeLivebarColor("red");
});
//todo tidy up this bullshit

 
window.onload = () => {
    //attach click listeners on all chartcontrols radio buttons
    const chartRadios = document.getElementsByName("chartControls");
    [].forEach.call(chartRadios, radio => {
        radio.addEventListener("click", queryChartUpdate);
    });
    queryChartUpdate();
};


const queryChartUpdate = () => {
    let selected = document.querySelector('input[name="chartControls"]:checked').value;
    let dataTo = new Date();
    let dataFrom;
    switch(selected) {
        case "allTime":
            // query for dates from epoch start
            dataFrom = new Date(0);
            // set labels to empty so chart will be stretched to its full width
            chart.data.labels = [];
            break;
        case "year":
            // create new date and subtract one year from it
            dataFrom = new Date();
            dataFrom.setFullYear(dataFrom.getFullYear() - 1);
            // set label as one year before, that guarantees the chart will always have padding in case of incomplete year in logs
            chart.data.labels = [dataFrom];
            break;
        case "month":
            dataFrom = new Date(dataTo.getTime() - 60*60*24*30 * 1000);
            chart.data.labels = [dataFrom];
            break;
        case "week":
            dataFrom = new Date(dataTo.getTime() - 60*60*24*7 * 1000);
            chart.data.labels = [dataFrom];
            break;
        case "day":
            dataFrom = new Date(dataTo.getTime() - 60*60*24 * 1000);
            chart.data.labels = [dataFrom];
            break;
        
    }
    console.log(dataFrom);
    socket.emit('chartDataRequest', dataFrom.toISOString(), dataTo.toISOString(), updateChart);

};

const updateChart = (chartData) => {
    console.log(chartData)
    if(chartData.error) {
        return; //maybe fix it later to display that the error happened
    }
    chart.data.datasets[0].data = chartData.data.map(log => {return { t: log.date, y: log.temperature }});
    chart.data.datasets[1].data = chartData.data.map(log => {return { t: log.date, y: log.humidity }});
    chart.update();
};


// Date.prototype.stdTimezoneOffset = function () {
//     var jan = new Date(this.getFullYear(), 0, 1);
//     var jul = new Date(this.getFullYear(), 6, 1);
//     return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
// }

// Date.prototype.isDstObserved = function () {
//     return this.getTimezoneOffset() < this.stdTimezoneOffset();
// }


const ctx = document.getElementById('chartCtx').getContext('2d');
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura',
            borderColor: 'rgba(255,69,0,1)',
            borderWidth: 3,
            fill: false,
            data: []
        }, {
            label: 'Wilgotność',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 3,
            fill:false,
            data:[]
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                distribution: 'linear',
                time: {
                    isoWeekday: true,
                    displayFormats: {
                        hour: 'HH'
                        
                    }
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    suggestedMax: 100
                }
            }]
        }
    }
});