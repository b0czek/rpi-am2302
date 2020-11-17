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
    
    if(data.temp ===null || data.hum === null ) {
        changeLivebarColor("red");
    }
    else {
        changeLivebarColor("green");
    }
});

socket.on('error', _ => {
    temp.innerHTML = null;
    hum.innerHTML = null;
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
