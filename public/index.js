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
        radio.addEventListener("click", updateChart);
    });
    
};

let awaitingResponse = false;

const updateChart = () => {
    let selected = document.querySelector('input[name="chartControls"]:checked').value;
    switch(selected) {
        case "allTime":
            
    }
    awaitingResponse = true;
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
        datasets: [{
            label: 'Temperatura',
            borderColor: 'rgba(255,69,0,1)',
            borderWidth: 3,
            fill: false
        }, {
            label: 'Wilgotność',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 3,
            fill:false
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