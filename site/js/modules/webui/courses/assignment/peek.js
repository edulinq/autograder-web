import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_PEEK, handlerPeek, 'Assignment Peek', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerPeek(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];
    let submission = params[Core.Routing.PARAM_SUBMISSION] || '';

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'submission', 'Submission ID', {
            defaultValue: submission,
        }),
    ];

    Render.makePage(
            params, context, container, peekCallback,
            {
                header: 'Peek a Submission',
                description: 'View a past submission. If no submission ID is provided, the most recent submission is used.',
                inputs: inputFields,
                buttonName: 'Peek',
                iconName: Render.ICON_NAME_PEEK,
                // Auto-submit if we were passed an existing submission ID.
                submitOnCreation: (submission != ''),
            },
        )
    ;
}

function peekCallback(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    let targetEmail = inputParams.targetUser ?? context.user.email;

    return Autograder.Courses.Assignments.Submissions.Fetch.User.peek(course.id, assignment.id, inputParams.submission, targetEmail)
        .then(function(result) {
            let html = "";

            if (!result['found-user']) {
                html = `<p>Could not find user: '${targetEmail}'.</p>`;
            } else if (!result['found-submission']) {
                if (inputParams.submission) {
                    html = `<p>Could not find submission: '${inputParams.submission}'.</p>`;
                } else {
                    html = `<p>Could not find most recent submission.</p>`;
                }
            } else {
                html = Render.submission(course, assignment, result['submission-result']);
            }

            return html;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

init();

export {
    peekCallback,
};
