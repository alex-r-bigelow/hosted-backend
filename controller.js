/* globals d3, uki */
import Houses from './models/Houses.js';
import AppState from './models/AppState.js';

// General-purpose views
import AuthModalView from './views/AuthModalView/AuthModalView.js';

// Main views in the app
import MapView from './views/MapView/MapView.js';
import HouseTableView from './views/HouseTableView/HouseTableView.js';
import PropertyDetailsView from './views/PropertyDetailsView/PropertyDetailsView.js';

class Controller extends uki.ui.goldenlayout.GLRootView {
  constructor () {
    const options = {
      d3el: d3.select('.root'),
      resources: [{ type: 'css', url: 'root.css' }],
      viewClassLookup: {
        MapView,
        HouseTableView,
        PropertyDetailsView
      },
      glSettings: {
        content: [{
          type: 'row',
          isCloseable: false,
          content: [{
            type: 'column',
            content: [{
              type: 'component',
              componentName: 'HouseTableView',
              componentState: {}
            }, {
              type: 'component',
              componentName: 'PropertyDetailsView',
              componentState: {}
            }]
          }, {
            type: 'component',
            componentName: 'MapView',
            componentState: {}
          }]
        }]
      }
    };
    super(options);

    this.ready.then(() => {
      this.modal = new AuthModalView();
      this.houses = new Houses();
      this.appState = new AppState();
    });
  }
}

window.controller = new Controller();
