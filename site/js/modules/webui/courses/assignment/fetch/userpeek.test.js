import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Peek User Submission, Success', async function () {
    await Test.loginUser('course-admin');
    await Test.navigate(
        Core.Routing.PATH_USER_PEEK,
        { [Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0' },
    );

    Test.checkPageBasics('hw0', 'user assignment peek');

    document.querySelector('.input-field #targetUser').value = 'course-student@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    // Verify that a submission rendered with the submission ID.
    expect(results).toMatch(/Submission 1697406272/);
});
