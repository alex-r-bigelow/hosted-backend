import GoldenLayoutView from '../common/GoldenLayoutView.js';
import IFrameViewMixin from '../common/IFrameViewMixin.js';

class IFrameTestView extends IFrameViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.src = 'https://www.xkcd.com';
    super(argObj);
  }
  get title () {
    return 'IFrame Test View';
  }
}

export default IFrameTestView;
