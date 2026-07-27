import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Pairwise Analysis', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_ANALYSIS_PAIRWISE,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'assignment pairwise analysis');

    document.querySelector('.input-field[data-name="submissions"] input').value = JSON.stringify([
            "course101::hw0::course-student@test.edulinq.org::1697406256",
            "course101::hw0::course-student@test.edulinq.org::1697406265",
        ]
    );
    document.querySelector('.input-field #dryRun').checked = true;
    document.querySelector('.input-field #wait').checked = true;
    document.querySelector('.input-field #overwrite').checked = true;

    await Test.submitTemplate();

    let resultsArea = document.querySelector('.results-area');

    // DOM-based structural assertions.
    expect(resultsArea.querySelector('.analysis-section')).not.toBeNull();
    expect(resultsArea.querySelector('.pairwise-summary')).not.toBeNull();
    expect(resultsArea.querySelector('.pairwise-pairs-table')).not.toBeNull();
    expect(resultsArea.querySelector('details.analysis-raw-json')).not.toBeNull();
    expect(resultsArea.querySelector('details.analysis-raw-json summary').textContent).toContain('Raw JSON');
});
