/* globals d3, less, GoldenLayout */
import { Model } from './node_modules/uki/dist/uki.esm.js';

// General-purpose views
import TooltipView from './views/TooltipView/TooltipView.js';
import ModalView from './views/ModalView/ModalView.js';

// Main views in the app
import PersonTableView from './views/PersonTableView/PersonTableView.js';
import AssignmentView from './views/AssignmentView/AssignmentView.js';
import AssignmentHistoryView from './views/AssignmentHistoryView/AssignmentHistoryView.js';
import MapView from './views/MapView/MapView.js';
import HouseTableView from './views/HouseTableView/HouseTableView.js';

import recolorImageFilter from './utils/recolorImageFilter.js';

const viewClassLookup = {
  PersonTableView,
  AssignmentView,
  AssignmentHistoryView,
  MapView,
  HouseTableView
};

class Controller extends Model {
  constructor () {
    super();
    this.modal = new ModalView();
    this.tooltip = new TooltipView();
    this.setupLayout();
    window.onresize = () => {
      this.goldenLayout.updateSize();
      this.renderAllViews();
    };
    (async () => {
      await less.pageLoadFinished;
      // GoldenLayout sometimes misbehaves if LESS hasn't finished loading
      this.goldenLayout.init();
      recolorImageFilter();
      this.renderAllViews();
    })();
  }
  setupLayout () {
    this.goldenLayout = new GoldenLayout({
      settings: {
        // GoldenLayout has a (really buggy) feature for popping a view out in a
        // separate browser window; I usually disable this unless there is a
        // clear user need
        showPopoutIcon: false
      },
      content: [{
        type: 'row',
        isCloseable: false,
        content: [{
          type: 'column',
          content: [{
            type: 'component',
            componentName: 'PersonTableView',
            componentState: {}
          },
          {
            type: 'component',
            componentName: 'AssignmentView',
            componentState: {}
          },
          {
            type: 'component',
            componentName: 'AssignmentHistoryView',
            componentState: {}
          }]
        }, {
          type: 'column',
          content: [{
            type: 'component',
            componentName: 'MapView',
            componentState: {}
          },
          {
            type: 'component',
            componentName: 'HouseTableView',
            componentState: {}
          }]
        }]
      }]
    }, d3.select('#layoutRoot').node());
    this.views = {};
    for (const [className, ViewClass] of Object.entries(viewClassLookup)) {
      const self = this;
      this.goldenLayout.registerComponent(className, function (container, state) {
        const view = new ViewClass({ container, state });
        self.views[className] = view;
      });
    }
  }
  renderAllViews () {
    this.modal.render();
    this.tooltip.render();
    for (const view of Object.values(this.views)) {
      view.render();
    }
  }
}

window.controller = new Controller();
