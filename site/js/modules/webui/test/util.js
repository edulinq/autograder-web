import * as Autograder from '../../autograder/base.js';

import * as Context from '../context.js';
import * as Event from '../event.js';
import * as Login from '../login.js';
import * as Routing from '../routing.js';

// A helper function for tests to login as a user.
// This is not in ../login.test.js to avoid importing a test file from other tests.
async function loginUser(displayName) {
    Autograder.clearCredentials();
    Context.clear();
    Routing.init();

    let loginRenderedProimise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, {
        'path': 'login',
    });

    Routing.redirectLogin();
    await loginRenderedProimise;

    let homeRenderedPromise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, {
        'path': '',
    });

    let inputParams = {
        'email': `${displayName}@test.edulinq.org`,
        'cleartext': displayName,
    };
    await Login.login(undefined, undefined, document, inputParams);
    await homeRenderedPromise;
}

function checkCards(expectedLabelNames) {
    const courseCardSpans = document.querySelectorAll('.cards-area .card span');
    let actualLabelNames = courseCardSpans.values().map(function(element) {
        return element.textContent;
    }).toArray();

    expect(actualLabelNames).toStrictEqual(expectedLabelNames);
}

function checkPageBasics(title, dataPage) {
    expect(document.title).toContain(title);

    let pageContent = document.querySelector(`.page-body .content[data-page="${dataPage}"]`);
    expect(pageContent).not.toBeNull();
}

async function navigate(path, params = undefined) {
    let pathComponents = {
        'path': path,
    };

    if (params) {
        pathComponents['params'] = params;
    }

    let renderPromise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, pathComponents);

    Routing.routeComponents(pathComponents);
    await renderPromise;
}

async function submitTemplate() {
    let resultWaitPromise = Event.getEventPromise(Event.EVENT_TYPE_TEMPLATE_RESULT_COMPLETE);
    document.querySelector('.template-button').click();
    await resultWaitPromise;
}

export {
    checkCards,
    checkPageBasics,
    loginUser,
    navigate,
    submitTemplate,
}
