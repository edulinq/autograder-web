import * as Core from '../../../core/index.js';
import * as Peek from '../peek.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_USER_PEEK, handlerUserPeek, 'User Assignment Peek', Core.Routing.NAV_COURSES, { assignment: true });
}

function handlerUserPeek(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];
    let submission = params[Core.Routing.PARAM_SUBMISSION] || '';

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'targetUser', 'Target User', {
            type: 'core.TargetCourseUserSelfOrGrader',
            placeholder: context.user.email,
        }),
        new Render.FieldType(context, 'submission', 'Submission ID', {
            defaultValue: submission,
        }),
    ];

    Render.makePage(
        params, context, container, Peek.peekCallback,
        {
            header: 'Peek User Submission',
            description: 'View a past submission for a specific user. If no submission ID is provided, the most recent submission is used.',
            inputs: inputFields,
            buttonName: 'Peek',
            iconName: Render.ICON_NAME_PEEK,
            submitOnCreation: (submission != ''),
        },
    )
        ;
}

init();
