import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_ASSIGNMENT, handlerAssignment, 'Assignment', Core.Routing.NAV_COURSES, { assignment: true });
}

function handlerAssignment(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let args = {
        [Core.Routing.PARAM_COURSE]: course.id,
        [Core.Routing.PARAM_ASSIGNMENT]: assignment.id,
    };

    // Simple Actions
    let studentCards = [
        new Render.Card(
            'assignment-action',
            'Submit',
            Core.Routing.formHashPath(Core.Routing.PATH_SUBMIT, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_STUDENT,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Peek a Previous Submission',
            Core.Routing.formHashPath(Core.Routing.PATH_PEEK, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_STUDENT,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'View Submission History',
            Core.Routing.formHashPath(Core.Routing.PATH_HISTORY, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_STUDENT,
                courseId: course.id,
            },
        ),
    ];

    // Advanced Actions
    let staffCards = [
        new Render.Card(
            'assignment-action',
            'Fetch Course Scores',
            Core.Routing.formHashPath(Core.Routing.PATH_ASSIGNMENT_FETCH_COURSE_SCORES, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Fetch Submission Attempt',
            Core.Routing.formHashPath(Core.Routing.PATH_ASSIGNMENT_FETCH_USER_ATTEMPT, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_STUDENT,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Proxy Regrade',
            Core.Routing.formHashPath(Core.Routing.PATH_PROXY_REGRADE, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Proxy Resubmit',
            Core.Routing.formHashPath(Core.Routing.PATH_PROXY_RESUBMIT, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Individual Analysis',
            Core.Routing.formHashPath(Core.Routing.PATH_ANALYSIS_INDIVIDUAL, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_ADMIN,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Pairwise Analysis',
            Core.Routing.formHashPath(Core.Routing.PATH_ANALYSIS_PAIRWISE, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_ADMIN,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Remove Submission',
            Core.Routing.formHashPath(Core.Routing.PATH_SUBMIT_REMOVE, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'View User History',
            Core.Routing.formHashPath(Core.Routing.PATH_USER_HISTORY, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Peek User Submission',
            Core.Routing.formHashPath(Core.Routing.PATH_USER_PEEK, args),
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
    ];

    let cardSections = [
        ['Student Actions', studentCards],
        ['Advanced Actions', staffCards],
    ];

    container.innerHTML = Render.makeCardSections(context, assignment.name, cardSections, Render.ICON_NAME_COURSES);
}

init();
