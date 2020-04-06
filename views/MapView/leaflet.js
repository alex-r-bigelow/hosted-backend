console.log("loaded")

export let makeMap = () => {


    let mapContainer = document.createElement("div")
    mapContainer.id = "mapcontainer"
    


    // make the map
    
    let map = L.map(mapContainer, {
        center: [32.253460, -110.911789], // latitude, longitude in decimal degrees (find it on Google Maps with a right click!)
        zoom: 12, // can be 0-22, higher is closer
        scrollWheelZoom: true // don't zoom the map on scroll
    });
    map.invalidateSize()
    // add the basemap tiles
    L.tileLayer(
        "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}@2x.png" // stamen toner tiles
        // stamen toner tiles
    ).addTo(map);

    // now add the geojson

    let newIcon = L.icon({
        iconSize: [10, 20],
        iconUrl: "./views/MapView/hospital_icon.svg",
    })
    let markerSetFunc = (gjpt, latlng) => {
        // substitute the newIcon as the marker
        return L.marker(latlng, {
            icon: newIcon
        })
    }
    fetch("./views/MapView/Hospitals.geojson")
        .then(res => res.json())
        .then(geojson => {

            //modify the icon used for popup
            //geojson pt, and latlng[num,num]
            L.geoJSON(geojson, {
                pointToLayer: markerSetFunc
            }).bindPopup(l => {
                return l.feature.properties.name
            }).addTo(map)

        })
    return {container:mapContainer,mapObj:map}
}
