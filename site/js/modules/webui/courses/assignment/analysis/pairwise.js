import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_ANALYSIS_PAIRWISE, handlerAnalysisPairwise, 'Assignment Pairwise Analysis', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerAnalysisPairwise(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'submissions', 'List of Submission IDs', {
            type: '[]string',
            required: true,
        }),
        new Render.FieldType(context, 'wait', 'Wait for Completion', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'overwrite', 'Overwrite Records', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'dryRun', 'Dry Run', {
            type: Render.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, analysisPairwise,
            {
                header: 'Pairwise Analysis',
                description: 'Get the result of a pairwise analysis for the specified submissions.',
                inputs: inputFields,
                buttonName: 'Analyze',
                iconName: Render.ICON_NAME_ANALYSIS,
            },
        )
    ;
}

function analysisPairwise(params, context, container, inputParams) {
    return Autograder.Courses.Assignments.Submissions.Analysis.pairwise(
            inputParams.submissions, inputParams.overwrite,
            inputParams.wait, inputParams.dryRun,
        )
        .then(function(result) {
            return Render.renderPairwiseAnalysis(result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

init();
