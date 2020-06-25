/* globals uki */

class PropertyDetailsView extends uki.ui.utils.EmptyStateViewMixin(
                                    uki.ui.utils.LoadingViewMixin( // eslint-disable-line indent
                                      uki.ui.goldenlayout.IFrameGLView)) { // eslint-disable-line indent
  constructor (argObj) {
    super(argObj);

    this.missingMessage = 'No property selected';
  }
  get title () {
    return 'Property Details';
  }
  get isEmpty () {
    return window.controller.appState.selectedHouse === undefined;
  }
  setup () {
    super.setup(...arguments);

    window.controller.appState.on('houseSelection', () => {
      const house = window.controller.houses.selectedHouse;
      if (house && house['Link to property (e.g. AirBnB listing, hotel website, etc)']) {
        // Show the official link
        this.src = house['Link to property (e.g. AirBnB listing, hotel website, etc)'];
        this.missingMessage = '';
      } else if (house) {
        this.src = null;
        this.missingMessage = 'Selected property provided no link';
      } else {
        this.src = null;
        this.missingMessage = 'No property selected';
      }
      this.render();
    });
  }
  get emptyMessage () {
    return this.missingMessage;
  }
}

export default PropertyDetailsView;
