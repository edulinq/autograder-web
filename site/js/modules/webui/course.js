import * as Autograder from '../autograder/base.js';
import * as Icon from './icon.js';
import * as Input from './input.js';
import * as Render from './render.js';
import * as Routing from './routing.js';

const COURSE_USER_REFERENCE_DOC_LINK = "https://github.com/edulinq/autograder-server/blob/main/docs/types.md#course-user-reference-courseuserreference";

function init() {
    let requirements = {course: true};
    Routing.addRoute(/^courses$/, handlerCourses, 'Enrolled Courses', Routing.NAV_COURSES);
    Routing.addRoute(/^course$/, handlerCourse, 'Course', Routing.NAV_COURSES, {course: true});
    Routing.addRoute(/^course\/email$/, handlerEmail, 'Email', Routing.NAV_COURSES, {course: true});
    Routing.addRoute(/^course\/list$/, handlerUsers, 'Users', Routing.NAV_COURSES, {course: true});
}

function handlerCourses(path, params, context, container) {
    let cards = [];
    for (const [id, course] of Object.entries(context.courses)) {
        let link = Routing.formHashPath(Routing.PATH_COURSE, {[Routing.PARAM_COURSE]: course.id});
        cards.push(new Render.Card(
            'course',
            course.name,
            link,
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_OTHER,
                courseId: id,
            },
        ));
    }

    let cardSections = [
        ['Enrolled Courses', cards],
    ];

    container.innerHTML = Render.makeCardSections(context, '', cardSections);
}

function handlerCourse(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let assignmentCards = [];
    for (const [id, assignment] of Object.entries(course.assignments)) {
        let args = {
            [Routing.PARAM_COURSE]: course.id,
            [Routing.PARAM_ASSIGNMENT]: assignment.id,
        };

        let link = Routing.formHashPath(Routing.PATH_ASSIGNMENT, args);
        assignmentCards.push(new Render.Card(
            'assignment',
            assignment.name,
            link,
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_OTHER,
                courseId: course.id,
            },
        ));
    }

    let actionCards = [];
    actionCards.push(new Render.Card(
        "course-action",
        "Email Users",
        Routing.formHashPath(Routing.PATH_EMAIL, {
            [Routing.PARAM_COURSE]: course.id,
        }),
        {
            minServerRole: Autograder.Users.SERVER_ROLE_USER,
            minCourseRole: Autograder.Users.COURSE_ROLE_GRADER,
            courseId: course.id,
        },
    ));

    actionCards.push(new Render.Card(
        "course-action",
        "List Users",
        Routing.formHashPath(Routing.PATH_COURSE_USERS_LIST, {
            [Routing.PARAM_COURSE]: course.id,
        }),
        {
            minServerRole: Autograder.Users.SERVER_ROLE_USER,
            minCourseRole: Autograder.Users.COURSE_ROLE_GRADER,
            courseId: course.id,
        },
    ));

    let cardSections = [
        ['Assignments', assignmentCards],
        ['Actions', actionCards],
    ];

    container.innerHTML = Render.makeCardSections(context, course.name, cardSections, Icon.ICON_NAME_COURSES);
}

function handlerEmail(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let description = `
        Send an email to course users.
        Separate recipient values with commas.
        For valid recipient values reference
        this <a href="${COURSE_USER_REFERENCE_DOC_LINK}" target="_blank">documentation</a>.
    `;

    let inputFields = [
        new Input.FieldType(context, 'to', 'To', {
            extractInputFunc: extractRecipients,
        }),
        new Input.FieldType(context, 'cc', 'CC', {
            extractInputFunc: extractRecipients,
        }),
        new Input.FieldType(context, 'bcc', 'BCC', {
            extractInputFunc: extractRecipients,
        }),
        new Input.FieldType(context, 'subject', 'Subject', {
            required: true,
        }),
        new Input.FieldType(context, 'content', 'Content', {
            type: Input.INPUT_TYPE_TEXTAREA,
            additionalAttributes: 'rows="10"',
        }),
        new Input.FieldType(context, 'dryRun', 'Send as Dry Run', {
            type: Input.INPUT_TYPE_BOOL,
        }),
        new Input.FieldType(context, 'html', 'Content is HTML', {
            type: Input.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, sendEmail,
            {
                header: 'Email Users',
                description: description,
                inputs: inputFields,
                buttonName: 'Send Email',
                iconName: Icon.ICON_NAME_MAIL,
            },
        )
    ;
}

function sendEmail(params, context, container, inputParams) {
    let args = {
        [Routing.PARAM_COURSE_ID]: context.courses[params[Routing.PARAM_COURSE]].id,
        [Routing.PARAM_EMAIL_TO]: inputParams.to ?? [],
        [Routing.PARAM_EMAIL_CC]: inputParams.cc ?? [],
        [Routing.PARAM_EMAIL_BCC]: inputParams.bcc ?? [],
        [Routing.PARAM_EMAIL_SUBJECT]: inputParams.subject,
        [Routing.PARAM_EMAIL_BODY]: inputParams.content,
        [Routing.PARAM_DRY_RUN]: inputParams.dryRun,
        [Routing.PARAM_EMAIL_HTML]: inputParams.html,
    };

    if ((args[Routing.PARAM_EMAIL_TO].length === 0) &&
            (args[Routing.PARAM_EMAIL_CC].length === 0) &&
            (args[Routing.PARAM_EMAIL_BCC].length === 0)) {
        return Promise.resolve('<p>Specify at least one recipient.</p>');
    }

    return Autograder.Course.email(args)
        .then(function(result) {
            return `
                <p>Email sent successfully.</p>
                ${Render.codeBlockJSON(result)}
            `;
        })
        .catch(function(message) {
            console.error(message);
            return Render.autograderError(message);
        })
    ;
}

function handlerUsers(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let inputFields = [
        new Input.FieldType(context, Routing.PARAM_TARGET_USERS, 'Target Users', {
            type: Input.COURSE_USER_REFERENCE_LIST_FIELD_TYPE,
        }),
    ];

    let description = `
        List the users in the course (defaults to all users).
    `;

    Render.makePage(
            params, context, container, listUsers,
            {
                header: 'List Users',
                description: description,
                inputs: inputFields,
                buttonName: 'List Users',
                iconName: Icon.ICON_NAME_LIST,
            },
        )
    ;
}

function listUsers(params, context, container, inputParams) {
    inputParams[Routing.PARAM_COURSE_ID] = context.courses[params[Routing.PARAM_COURSE]].id;

    return Autograder.Course.users(inputParams)
        .then(function(result) {
            if (result.users.length === 0) {
                return '<p>Unable to find target users.</p>';
            }

            Render.apiOutputSwitcher(result.users, container, {
                renderOptions: new Render.APIValueRenderOptions({
                    keyOrdering: ['email', 'name', 'role', 'lms-id'],
                    initialIndentLevel: -1,
                }),
                modes: [
                    Render.API_OUTPUT_SWITCHER_TEXT,
                    Render.API_OUTPUT_SWITCHER_TABLE,
                    Render.API_OUTPUT_SWITCHER_JSON,
                ],
            });

            return undefined;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function extractRecipients(input) {
    let recipientString = input.value;

    return recipientString
        .split(',')
        .map((recipient) => (recipient.trim()))
        .filter((recipient) => (recipient.length > 0))
    ;
}

export {
    init,
};
