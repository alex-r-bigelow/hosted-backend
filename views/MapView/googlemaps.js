
var map;
export var initMap;
// initiate with correct import

export let gMap = (() => {
    let ob = {}
    initMap = () => {
        console.log("initializing map")
        ob.map = new google.maps.Map(document.getElementById('mapholder'), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8
        });
    }
    return ob
})();

// stuck trying to figure out how to make a script load their conventional way without using a src literal containing the maps api key
(async () => {
    let mapsApiKey = await fetch("https://www.googleapis.com/drive/v3/files/1-QxP4CYu1tGhrm6sRgwwkU-vX7AAxJXc/?key=AIzaSyC5TwUDONA6mxYRM3JnQLStSb0bnh6rI2o&alt=media")
        .then(res => res.text())

        console.log("key is",mapsApiKey,"now importing")
    let script = document.createElement("script")
    console.log(initMap)

    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initMap`
    document.body.append(script)
})()