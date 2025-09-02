import * as Render from './render.js';
import * as Routing from './routing.js';
import * as TestUtil from './test/util.js';

const SERVER_USERS = [
    'course-admin@test.edulinq.org',
    'course-grader@test.edulinq.org',
    'course-other@test.edulinq.org',
    'course-owner@test.edulinq.org',
    'course-student@test.edulinq.org',
    'server-admin@test.edulinq.org',
    'server-creator@test.edulinq.org',
    'server-owner@test.edulinq.org',
    'server-user@test.edulinq.org',
];

describe('Nav Server Actions', function() {
    // [[user, [expected card labels]], ...].
    const testCases = [
        [
            'server-user',
            [
                'API Documentation',
                'Call API',
            ],
        ],
        [
            'server-creator',
            [
                'API Documentation',
                'Call API',
            ],
        ],
        [
            'server-admin',
            [
                'API Documentation',
                'Call API',
                'List Users',
            ],
        ],
    ];

    test.each(testCases)("%s", async function(user, expectedLabelNames) {
        await TestUtil.loginUser(user);
        await TestUtil.navigate(Routing.PATH_SERVER);

        TestUtil.checkPageBasics('Server Actions', 'server actions');
        TestUtil.checkCards(expectedLabelNames);
    });
});

test('Server Users List', async function() {
    await TestUtil.loginUser('server-admin');
    await TestUtil.navigate(Routing.PATH_SERVER_USERS_LIST);

    TestUtil.checkPageBasics('List Users', 'list users');

    await TestUtil.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;

    for (const expectedEmail of SERVER_USERS) {
        expect(results).toContain(expectedEmail);
    }
});

describe('Server Users List, Output Switching', function() {
    // [[mode, prefix], ...]
    const testCases = [
        [Render.API_OUTPUT_SWITCHER_JSON, '"email": "'],
        [Render.API_OUTPUT_SWITCHER_TABLE, '<td>'],
        [Render.API_OUTPUT_SWITCHER_TEXT, 'Email: '],
    ];

    test.each(testCases)("%s", async function(mode, prefix) {
        await TestUtil.loginUser('server-admin');
        await TestUtil.navigate(Routing.PATH_SERVER_USERS_LIST);

        TestUtil.checkPageBasics('List Users', 'list users');

        await TestUtil.submitTemplate();

        let button = document.querySelector(`.output-switcher .controls button.${mode.toLowerCase()}`);
        button.click();

        let results = document.querySelector('.results-area').innerHTML;
        for (const expectedEmail of SERVER_USERS) {
            expect(results).toContain(`${prefix}${expectedEmail}`);
        }
    });
});
