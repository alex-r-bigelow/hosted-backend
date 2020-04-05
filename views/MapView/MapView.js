import GoldenLayoutView from '../common/GoldenLayoutView.js';
import SvgViewMixin from '../common/SvgViewMixin.js';

class MapView extends SvgViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/MapView/style.less' },
      { type: 'text', url: './views/MapView/template.svg' }
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
    // Apply the template
    this.content.html(this.resources[1]);

    // Fill the emptyStateDiv with our warning
    this.emptyStateDiv.html('<h3>TODO: Map</h3>');
  }
  draw () {
    super.draw();

    if (this.isHidden || this.isLoading) {
      return;
    }
    console.log('TODO: implement draw()');
  }
}

export default MapView;
