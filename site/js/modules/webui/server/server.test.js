import * as Core from '../core/index.js';
import * as Test from '../test/index.js';

describe('Nav Server Actions', function() {
    // [[user, [expected card labels]], ...].
    const testCases = [
        [
            'server-user',
            [
                'API Documentation',
                'Call API',
                'View Server Logs',
            ],
        ],
        [
            'server-creator',
            [
                'API Documentation',
                'Call API',
                'View Server Logs',
            ],
        ],
        [
            'server-admin',
            [
                'API Documentation',
                'Call API',
                'List Courses',
                'List Users',
                'View Server Logs',
            ],
        ],
    ];

    test.each(testCases)("%s", async function(user, expectedLabelNames) {
        await Test.loginUser(user);
        await Test.navigate(Core.Routing.PATH_SERVER);

        Test.checkPageBasics('Server Actions', 'server actions');
        Test.checkCards(expectedLabelNames);
    });
});
