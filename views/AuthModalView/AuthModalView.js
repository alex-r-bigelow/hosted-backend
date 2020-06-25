/* globals d3, uki */
const AuthSheetModel = uki.google.AuthSheetModel;

class AuthModalView extends uki.ui.components.ModalView {
  constructor () {
    super({
      d3el: d3.select('.modal'),
      resources: [
        { type: 'less', url: './views/AuthModalView/style.less' },
        { type: 'text', url: './views/AuthModalView/template.html', name: 'template' }
      ]
    });
    this.startedLogin = false;
  }
  get defaultButtons () {
    return [
      {
        label: 'OK',
        className: 'ok',
        primary: true,
        onclick: () => { this.ok(); }
      }
    ];
  }
  get defaultContent () {
    return contentEl => {
      contentEl.html(this.getNamedResource('template'));

      contentEl.select('.google.button').on('click', () => {
        if (!this.isPending && !this.startedLogin && !this.isReady) {
          this.startedLogin = true;
          window.controller.houses.signIn();
          this.render();
        }
      });

      contentEl.select('.logout.button').on('click', () => {
        if (!this.isPending && !this.isLoggedOut) {
          window.controller.houses.signOut();
          this.startedLogin = false;
          this.render();
        }
      });
    };
  }
  get isReady () {
    return window.controller.houses.loggedInAndLoaded;
  }
  get isLoggedOut () {
    return window.controller.houses.status === AuthSheetModel.STATUS.SIGNED_OUT;
  }
  get isPending () {
    return window.controller.houses.status === AuthSheetModel.STATUS.PENDING;
  }
  get hasError () {
    return window.controller.houses.status === AuthSheetModel.STATUS.ERROR;
  }
  get buttons () {
    return super.buttons.slice(1);
  }
  setup () {
    super.setup(...arguments);

    this.d3el.classed('AuthModalView', true);

    window.controller.houses.on('dataUpdated', () => { this.render(); });
    window.controller.houses.on('statusChanged', () => {
      if (window.controller.houses.status === AuthSheetModel.STATUS.ERROR) {
        // Let the user try to log in again if there's an error
        this.startedLogin = false;
      }
      this.render();
    });
  }
  draw () {
    super.draw(...arguments);

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
      this.hide();
      window.controller.renderAllViews();
    }
  }
}
export default AuthModalView;
