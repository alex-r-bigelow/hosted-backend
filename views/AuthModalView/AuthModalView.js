/* globals d3 */
import { View, GoogleSheetModel } from '../../node_modules/uki/dist/uki.esm.js';
import ModalMixin from '../common/ModalMixin.js';

class AuthModalView extends ModalMixin(View) {
  constructor () {
    super(d3.select('#modal'), [
      { type: 'less', url: './views/AuthModalView/style.less' },
      { type: 'text', url: './views/AuthModalView/template.html', name: 'template' }
    ]);

    this.startedLogin = false;

    window.controller.houses.on('dataUpdated', () => { this.render(); });
    window.controller.houses.on('statusChanged', () => {
      if (window.controller.houses.status === GoogleSheetModel.STATUS.ERROR) {
        // Let the user try to log in again if there's an error
        this.startedLogin = false;
      }
      this.render();
    });
    window.controller.people.on('dataUpdated', () => { this.render(); });
    window.controller.people.on('statusChanged', () => {
      if (window.controller.people.status === GoogleSheetModel.STATUS.ERROR) {
        // Let the user try to log in again if there's an error
        this.startedLogin = false;
      }
      this.render();
    });
    window.controller.assignments.on('dataUpdated', () => { this.render(); });
    window.controller.assignments.on('statusChanged', () => {
      if (window.controller.assignments.status === GoogleSheetModel.STATUS.ERROR) {
        // Let the user try to log in again if there's an error
        this.startedLogin = false;
      }
      this.render();
    });
  }
  get isReady () {
    return window.controller.houses.loggedInAndLoaded &&
           window.controller.people.loggedInAndLoaded &&
           window.controller.assignments.loggedInAndLoaded;
  }
  get isLoggedOut () {
    return window.controller.houses.status === GoogleSheetModel.STATUS.SIGNED_OUT ||
      window.controller.people.status === GoogleSheetModel.STATUS.SIGNED_OUT ||
      window.controller.assignments.status === GoogleSheetModel.STATUS.SIGNED_OUT;
  }
  get isPending () {
    return window.controller.houses.status === GoogleSheetModel.STATUS.PENDING ||
      window.controller.people.status === GoogleSheetModel.STATUS.PENDING ||
      window.controller.assignments.status === GoogleSheetModel.STATUS.PENDING;
  }
  get hasError () {
    return window.controller.houses.status === GoogleSheetModel.STATUS.ERROR ||
      window.controller.people.status === GoogleSheetModel.STATUS.ERROR ||
      window.controller.assignments.status === GoogleSheetModel.STATUS.ERROR;
  }
  get buttons () {
    return super.buttons.slice(1);
  }
  setup () {
    super.setup();
    this.contents.html(this.getNamedResource('template'));

    this.contents.select('.google.button').on('click', () => {
      if (!this.isPending && !this.startedLogin && !this.isReady) {
        this.startedLogin = true;
        window.controller.assignments.signIn();
        window.controller.houses.signIn();
        this.render();
      }
    });

    this.contents.select('.logout.button').on('click', () => {
      if (!this.isPending && !this.isLoggedOut) {
        window.controller.assignments.signOut();
        window.controller.houses.signOut();
        this.startedLogin = false;
        this.render();
      }
    });
  }
  draw () {
    super.draw();

    this.contents.select('.google.button')
      .classed('disabled', this.isPending || this.startedLogin || this.isReady);

    this.contents.select('.logout.button')
      .classed('disabled', this.isPending || this.isLoggedOut);

    this.contents.select('.errorMessage')
      .style('display', this.hasError ? null : 'none');

    this.buttonWrapper.select('.ok.button')
      .classed('disabled', !this.isReady);

    this.contents.select('.statusIcon')
      .style('display', this.isReady ||
        this.hasError ||
        this.isPending ||
        this.startedLogin ? null : 'none')
      .attr('src', this.isReady ? 'img/check.svg'
        : this.hasError ? 'img/ex.svg'
          : this.isPending || this.startedLogin ? 'img/spinner.gif'
            : null);
  }
  ok () {
    if (this.isReady) {
      super.ok();
      window.controller.renderAllViews();
    }
  }
}
export default AuthModalView;
