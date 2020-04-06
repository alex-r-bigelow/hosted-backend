import GoldenLayoutView from '../common/GoldenLayoutView.js';
import IFrameViewMixin from '../common/IFrameViewMixin.js';

class PropertyDetailsView extends IFrameViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    super(argObj);

    this.missingMessage = 'No property selected';

    window.controller.appState.on('houseSelection', () => {
      const house = window.controller.houses.selectedHouse;
      if (house && house.url) {
        this.src = house.url;
        this.missingMessage = '';
      } else if (house) {
        this.src = null;
        this.missingMessage = 'Selected property has no URL';
      } else {
        this.src = null;
        this.missingMessage = 'No property selected';
      }
      this.render();
    });
  }
  get title () {
    return 'Property Details';
  }
  get isEmpty () {
    return window.controller.appState.selectedHouse === undefined;
  }
  draw () {
    super.draw();

    // If we don't have a URL, update the emptyStateDiv to explain why
    this.emptyStateDiv.html(`<h3>${this.missingMessage}</h3>`);
  }
}

export default PropertyDetailsView;
