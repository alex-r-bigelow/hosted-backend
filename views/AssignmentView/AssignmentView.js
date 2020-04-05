import GoldenLayoutView from '../common/GoldenLayoutView.js';
import SvgViewMixin from '../common/SvgViewMixin.js';

class AssignmentView extends SvgViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/AssignmentView/style.less' },
      { type: 'text', url: './views/AssignmentView/template.svg' }
    ];
    super(argObj);
  }
  get title () {
    return 'Assignments';
  }
  get isEmpty () {
    return true;
  }
  setup () {
    super.setup();
    // Apply the template
    this.content.html(this.resources[1]);

    // Fill the emptyStateDiv with our warning
    this.emptyStateDiv.html('<h3>TODO: View for making assignments</h3>');
  }
  draw () {
    super.draw();

    if (this.isHidden || this.isLoading) {
      return;
    }
    console.log('TODO: implement draw()');
  }
}

export default AssignmentView;
