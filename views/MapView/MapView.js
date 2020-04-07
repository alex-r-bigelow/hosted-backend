import GoldenLayoutView from '../common/GoldenLayoutView.js';
import { makeMap } from "./leaflet.js"
import { gMap } from "./googlemaps.js"

class MapView extends GoldenLayoutView {
  constructor(argObj) {

    argObj.resources = [
      { type: "css", url: "https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" },
      { type: "js", url: "https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" },
      { type: 'less', url: './views/MapView/style.less' },
      { type: 'text', url: './views/MapView/template.html' }
    ];
    super(argObj);
  }
  get title() {
    return 'Map';
  }
  get isEmpty() {
    return true;
  }
  setup() {
    super.setup();
    // div holding the actual map elements
    let leafletMap = makeMap()
    this.leafletMap = leafletMap
    // Apply the template; this.content is the div inside the GoldenLayout pane
    this.content.node().append(leafletMap.container)
    this.content.node().id = "mapholder"
    // setup google maps api





    // Fill the emptyStateDiv with our warning
    this.emptyStateDiv.html('<h3>TODO: Map</h3>');
  }
  draw() {
    super.draw();
    this.leafletMap.mapObj.invalidateSize()
    if (google.maps) {
      this.gMap = gMap
      this.gMap.geocoder("2334 e parkway terrace, Tucson, AZ")
    }
    if (this.isHidden || this.isLoading) {
      return;
    }
  }
}

export default MapView;
