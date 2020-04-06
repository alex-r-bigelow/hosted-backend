import GoldenLayoutView from '../common/GoldenLayoutView.js';
import IFrameViewMixin from '../common/IFrameViewMixin.js';

class PropertyDetailsView extends IFrameViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/PropertyDetailsView/style.less' }
    ];
    super(argObj);

    window.controller.appState.on('houseSelection', () => {
      this.src = window.controller.houses.selectedHouse;
      this.render();
    });
  }
  get title () {
    return 'Property Details';
  }
  get isEmpty () {
    return window.controller.appState.selectedHouse === undefined;
  }
  setup () {
    super.setup();
    // Apply the template
    this.content.html(this.resources[1]);

    // Fill the emptyStateDiv with our warning
    this.emptyStateDiv.html('<h3>No property selected</h3>');
  }
}

export default PropertyDetailsView;
