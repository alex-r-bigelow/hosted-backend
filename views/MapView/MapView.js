import GoldenLayoutView from '../common/GoldenLayoutView.js';
import {makeMap} from "./leaflet.js"

class MapView extends GoldenLayoutView {
  constructor (argObj) {
    argObj.resources = [
      {type:"css",url:"https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"},
      {type:"js",url:"https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"},
      { type: 'less', url: './views/MapView/style.less' },
      { type: 'text', url: './views/MapView/template.html' }
    ];
    super(argObj);
  }
  get title () {
    return 'Map';
  }
  get isEmpty () {
    return true;
  }
  setup () {
    super.setup();
    // div holding the actual map elements
    let leafletMap = makeMap(window.controller.houses.table)
    this.leafletMap = leafletMap
    // Apply the template; this.content is the div inside the GoldenLayout pane
    this.content.node().append(leafletMap.container)




    // Fill the emptyStateDiv with our warning
    this.emptyStateDiv.html('<h3>TODO: Map</h3>');
  }
  draw () {
    super.draw();
    this.leafletMap.mapObj.invalidateSize()
    if (this.isHidden || this.isLoading) {
      return;
    }
  }
}

export default MapView;
