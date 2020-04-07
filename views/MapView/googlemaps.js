
var map;
// initiate with correct import

export let gMap = (() => {
    let ob = {}
    ob.geocoder = (address) => {
        let coder = new google.maps.Geocoder()
        coder.geocode({address},(res,status)=> {
            if (status == "OK"){
                console.log("results",res[0].geometry.location)
                console.log("results",res[0].geometry.location.lat())
                console.log("results",res[0].geometry.location.lng())
            }
        })
    }
    return ob
})();

// stuck trying to figure out how to make a script load their conventional way without using a src literal containing the maps api key
(async () => {
    let mapsApiKey = await fetch("https://www.googleapis.com/drive/v3/files/1-QxP4CYu1tGhrm6sRgwwkU-vX7AAxJXc/?key=AIzaSyC5TwUDONA6mxYRM3JnQLStSb0bnh6rI2o&alt=media")
        .then(res => res.text())

        console.log("key is",mapsApiKey,"now importing")
    let script = document.createElement("script")

    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`
    document.body.append(script)
})()