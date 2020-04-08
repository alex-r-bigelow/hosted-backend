/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';
import ModalMixin from '../common/ModalMixin.js';

class AuthModalView extends ModalMixin(View) {
  constructor () {
    super(d3.select('#modal'), [
      { type: 'less', url: './views/AuthModalView/style.less' },
      { type: 'text', url: './views/AuthModalView/template.html', name: 'template' }
    ]);

    this.started = false;

    window.controller.houses.on('dataUpdated', () => { this.render(); });
    window.controller.assignments.on('dataUpdated', () => { this.render(); });
  }
  get isLoading () {
    return this.started && !this.isReady;
  }
  get isReady () {
    return window.controller.houses.loggedInAndLoaded &&
           window.controller.assignments.loggedInAndLoaded;
    // TODO: validate this for people too when we figure out SurveyMonkey
  }
  get buttons () {
    return super.buttons.slice(1);
  }
  setup () {
    super.setup();
    this.contents.html(this.getNamedResource('template'));

    this.contents.select('.google.button').on('click', async () => {
      // Can just sign into one of the tables; google uses a global
      // auth object
      window.controller.assignments.signIn();
      this.started = true;
      this.render();
    });
  }
  draw () {
    super.draw();

    this.buttonWrapper.select('.ok.button')
      .classed('disabled', !this.isReady);

    this.contents.select('.spinner')
      .style('display', this.isLoading ? null : 'none');
  }
  ok () {
    if (this.isReady) {
      super.ok();
    }
  }
}
export default AuthModalView;
