window.onload = function () {
    var evtSource = new EventSource('/stream');
    evtSource.onmessage = e => {
        let data = JSON.parse(e.data);
        document.getElementById('fuelhead').innerText = data.fuelhead;
    };
}