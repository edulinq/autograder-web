import * as Event from './event.js';
import * as Routing from './routing.js';
import * as TestUtil from './test/util.js';

test('Enrolled Courses', async function() {
    await TestUtil.loginUser('course-student');
    await TestUtil.navigate(Routing.PATH_COURSES);

    TestUtil.checkPageBasics('Enrolled Courses', 'enrolled courses');

    const expectedLabelNames = [
        'Course 101',
        'Course Using Different Languages',
    ];
    TestUtil.checkCards(expectedLabelNames);
});

describe('Nav Course101', function() {
    // [[user, [expected card labels]], ...].
    const testCases = [
        [
            'course-other',
            [
                'Homework 0',
            ],
        ],
        [
            'course-student',
            [
                'Homework 0',
            ],
        ],
        [
            'course-grader',
            [
                'Homework 0',
                'Email Users',
                'List Users',
            ],
        ],
    ];

    const targetCourse = 'course101';

    test.each(testCases)("%s", async function(user, expectedLabelNames) {
        await TestUtil.loginUser(user);
        await TestUtil.navigate(Routing.PATH_COURSE, {[Routing.PARAM_COURSE]: targetCourse});

        TestUtil.checkPageBasics(targetCourse, 'course');
        TestUtil.checkCards(expectedLabelNames);
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
        await TestUtil.loginUser(user);
        await TestUtil.navigate(
                Routing.PATH_ASSIGNMENT,
                {[Routing.PARAM_COURSE]: targetCourse, [Routing.PARAM_ASSIGNMENT]: targetAssignment});

        TestUtil.checkPageBasics(`${targetAssignment} :: Autograder`, 'assignment');
        TestUtil.checkCards(expectedLabelNames);
    });
});

test('Course Users List', async function() {
    const targetCourse = 'course101';
    const expectedEmails = [
        'course-admin@test.edulinq.org',
        'course-grader@test.edulinq.org',
        'course-other@test.edulinq.org',
        'course-owner@test.edulinq.org',
        'course-student@test.edulinq.org',
    ];

    await TestUtil.loginUser('course-admin');
    await TestUtil.navigate(Routing.PATH_COURSE_USERS_LIST, {[Routing.PARAM_COURSE]: targetCourse});

    TestUtil.checkPageBasics(targetCourse, 'users');

    await TestUtil.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;

    for (const expectedEmail of expectedEmails) {
        expect(results).toContain(expectedEmail);
    }
});
