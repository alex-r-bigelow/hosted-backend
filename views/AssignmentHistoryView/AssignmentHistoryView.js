import GoldenLayoutView from '../common/GoldenLayoutView.js';

class AssignmentHistoryView extends GoldenLayoutView {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/AssignmentHistoryView/style.less' },
      { type: 'text', url: './views/AssignmentHistoryView/template.html' }
    ];
    super(argObj);
  }
  get title () {
    return 'History';
  }
  get isEmpty () {
    return true;
  }
  setup () {
    super.setup();
    // Apply the template
    this.content.html(this.resources[1]);

    // Fill the emptyStateDiv with our warning
    this.emptyStateDiv.html('<h3>TODO: table of a person\'s assignment history</h3>');
  }
  draw () {
    super.draw();

    if (this.isHidden || this.isLoading) {
      return;
    }
    console.log('TODO: implement draw()');
  }
}

export default AssignmentHistoryView;
