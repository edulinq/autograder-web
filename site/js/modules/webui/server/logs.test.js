import * as Core from '../core/index.js';
import * as Test from '../test/index.js';

test('Server Logs Query', async function() {
    await Test.loginUser('server-admin');
    await Test.navigate(Core.Routing.PATH_SERVER_LOGS);

    Test.checkPageBasics('View Server Logs', 'view server logs');

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('API Server Created.');
});
