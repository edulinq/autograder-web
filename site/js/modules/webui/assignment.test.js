import fs from 'node:fs';
import path from 'node:path';

import * as Event from './event.js';
import * as Input from './input.js';
import * as Routing from './routing.js';
import * as TestUtil from './test/util.js';

test('Fetch User Attempt, No Result', async function() {
    await TestUtil.loginUser('course-admin');
    await TestUtil.navigate(
            Routing.PATH_ASSIGNMENT_FETCH_USER_ATTEMPT,
            {[Routing.PARAM_COURSE]: 'course101', [Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    TestUtil.checkPageBasics('hw0', 'fetch submission attempt');

    await TestUtil.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('"found-submission": false');
});

test('Fetch User Attempt, Target Other', async function() {
    await TestUtil.loginUser('course-admin');
    await TestUtil.navigate(
            Routing.PATH_ASSIGNMENT_FETCH_USER_ATTEMPT,
            {[Routing.PARAM_COURSE]: 'course101', [Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    TestUtil.checkPageBasics('hw0', 'fetch submission attempt');

    document.querySelector('.input-field #targetEmail').value = 'course-student@test.edulinq.org';
    document.querySelector('.input-field #targetSubmission').value = '1697406265';

    await TestUtil.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('"found-submission": true');
    expect(results).toContain('"id": "course101::hw0::course-student@test.edulinq.org::1697406265"');
    expect(results).toContain('"score": 1');

    let downloadWaitPromisePromise = Event.getEventPromise(Event.EVENT_TYPE_DOWNLOAD_FILE_COMPLETE);
    document.querySelector('.results-area button.download').click();
    await downloadWaitPromisePromise;
});

test('Submit Assignment', async function() {
    await TestUtil.loginUser('course-admin');

    let targetCourse = 'course101';
    let targetAssignment = 'hw0';
    let pathComponents = {
        'path': Routing.PATH_SUBMIT,
        'params': {
            [Routing.PARAM_ASSIGNMENT]: targetAssignment,
            [Routing.PARAM_COURSE]: targetCourse,
        },
    };

    let loadWaitPromise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, pathComponents);

    Routing.routeComponents(pathComponents);
    await loadWaitPromise;

    TestUtil.checkPageBasics(targetAssignment, 'assignment submit');

    const fileContent = fs.readFileSync(path.join('site', 'js', 'modules', 'autograder', 'test', 'data', 'hw0_solution.py'), 'utf8');
    const fileObj = new File([fileContent], 'hw0_solution.py');
    document.querySelector('div[data-name="files"] input')[Input.TEST_FILES_KEY] = [fileObj];

    let resultWaitPromise = Event.getEventPromise(Event.EVENT_TYPE_TEMPLATE_RESULT_COMPLETE);
    document.querySelector('.template-button').click();
    await resultWaitPromise;

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toMatch(targetCourse);
    expect(results).toMatch(targetAssignment);
    expect(results).toMatch('Score');
});
