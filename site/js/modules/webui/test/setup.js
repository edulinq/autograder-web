import * as Base from '../base.js';
import * as Util from '../util.js';

function init() {
    Util.setTesting(true);
    Base.init(false);
}

beforeEach(function() {
    init();
});
