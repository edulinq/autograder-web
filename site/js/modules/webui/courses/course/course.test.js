import * as Core from '../../core/index.js';
import * as Test from '../../test/index.js';

describe('Nav Course101', function() {
    // [[user, [expected card labels], error substring], ...].
    const testCases = [
        [
            'course-other',
            [
                'Homework 0',
            ],
            undefined,
        ],
        [
            'course-student',
            [
                'Homework 0',
            ],
            undefined,
        ],
        [
            'course-grader',
            [
                'Homework 0',
                'Email Users',
                'List Users',
            ],
            undefined,
        ],
        [
            'server-user',
            undefined,
            'is not enrolled in course',
        ],
        [
            'server-admin',
            [
                'Homework 0',
                'Email Users',
                'List Users',
                'Update Course',
            ],
            undefined,
        ],
    ];

    const targetCourse = 'course101';

    test.each(testCases)("%s", async function(user, expectedLabelNames, errorSubstring) {
        await Test.loginUser(user);

        // If there is an error substring, we expect navigation to fail.
        if (errorSubstring) {
            await Test.expectFailedNavigation(Core.Routing.PATH_COURSE, {[Core.Routing.PARAM_COURSE]: targetCourse}, errorSubstring);
            return;
        }

        await Test.navigate(Core.Routing.PATH_COURSE, {[Core.Routing.PARAM_COURSE]: targetCourse});

        Test.checkPageBasics(targetCourse, 'course');
        Test.checkCards(expectedLabelNames);
    });
});

describe('Nav HW0', function() {
    // [[user, [expected card labels]], ...].
    const testCases = [
        [
            'course-other',
            [],
        ],
        [
            'course-student',
            [
                'Peek a Previous Submission',
                'Submit',
                'View Submission History',
                'Fetch Submission Attempt',
            ],
        ],
        [
            'course-grader',
            [
                'Peek a Previous Submission',
                'Submit',
                'View Submission History',
                'Fetch Course Scores',
                'Fetch Submission Attempt',
                'Peek User Submission',
                'Proxy Regrade',
                'Proxy Resubmit',
                'Remove Submission',
                'View User History',
            ],
        ],
        [
            'course-admin',
            [
                'Peek a Previous Submission',
                'Submit',
                'View Submission History',
                'Fetch Course Scores',
                'Fetch Submission Attempt',
                'Individual Analysis',
                'Pairwise Analysis',
                'Peek User Submission',
                'Proxy Regrade',
                'Proxy Resubmit',
                'Remove Submission',
                'View User History',
            ],
        ],
    ];

    const targetCourse = 'course101';
    const targetAssignment = 'hw0';

    test.each(testCases)("%s", async function(user, expectedLabelNames) {
        await Test.loginUser(user);
        await Test.navigate(
                Core.Routing.PATH_ASSIGNMENT,
                {[Core.Routing.PARAM_COURSE]: targetCourse, [Core.Routing.PARAM_ASSIGNMENT]: targetAssignment});

        Test.checkPageBasics(`${targetAssignment} :: Autograder`, 'assignment');
        Test.checkCards(expectedLabelNames);
    });
});

// Navigate to multiple courses to ensure that the course context is properly loaded for each.
test('Nav Multiple Courses', async function() {
    const user = 'course-admin';

    await Test.loginUser(user);

    await Test.navigate(Core.Routing.PATH_COURSE, {[Core.Routing.PARAM_COURSE]: 'course101'});
    Test.checkPageBasics('course101', 'course');

    await Test.navigate(Core.Routing.PATH_COURSE, {[Core.Routing.PARAM_COURSE]: 'course-languages'});
    Test.checkPageBasics('course-languages', 'course');
});
