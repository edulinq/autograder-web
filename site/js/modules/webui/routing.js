import * as Autograder from '../autograder/base.js'
import * as Context from './context.js'
import * as Log from './log.js'

let routes = [];

const DEFAULT_HANDLER = handlerNotFound

const PARAM_COURSE = 'course';
const PARAM_ASSIGNMENT = 'assignment';
const PARAM_SUBMISSION = 'submission';
const PARAM_TARGET_ENDPOINT = 'endpoint';

const PATH_COURSE = 'course';
const PATH_ASSIGNMENT = `${PATH_COURSE}/assignment`;
const PATH_SUBMIT = `${PATH_ASSIGNMENT}/submit`;
const PATH_PEEK = `${PATH_ASSIGNMENT}/peek`;
const PATH_HISTORY = `${PATH_ASSIGNMENT}/history`;

const PATH_SERVER = 'server';
const PATH_SERVER_CALL_API = `${PATH_SERVER}/call-api`;

// The current hash/location we are routed to.
// Should be prefixed with a hash symbol.
let currentHash = undefined;

// Start listening for routing events and do an initial route.
function init(initialRoute = true) {
    window.addEventListener("hashchange", function() {
        route();
    });

    if (initialRoute) {
        route();
    }
}

// Add a route to the router.
// Handlers should take four parameters: handler(path, pathParams, context, container).
// Where |path| the the canonical path being handle (without any query parameters),
// |pathParams| are any query parameters on the original path,
// |context| is any context resolved by the router while preparing the request,
// and |container| is an element to render into.
// Possible fields for |context| are: user, courseID, course, and assignmentID.
function addRoute(pattern, handler,
        pageName = undefined,
        requirements = {login: true, course: false, assignment: false}) {
    // Fill in any holes in requirements.
    requirements.course = requirements.course || requirements.assignment;
    requirements.login = requirements.login || requirements.course;

    routes.push([pattern, handler, requirements, pageName]);
}

// Route the page content to a path specified in an argument or window.location.hash.
// For routes that require an additional load/request (non-trivial routes),
// the loading page will be activated when the request it made.
function route(rawPath = undefined) {
    if (!rawPath) {
        rawPath = getLocationHash();
    }

    let [path, params] = parsePath(rawPath);

    // Form the canonical path we are on.
    let newHash = formHashPath(path, params);

    // Skip any routing if we are on the current path.
    // This let's us avoid infinite loops when routing internally.
    if (newHash == currentHash) {
        return;
    }

    // Set the hash to the cleaned-up value.
    currentHash = newHash;
    window.location.hash = newHash;

    // Check all known routes.
    for (const [pattern, handler, requirements, pageName] of routes) {
        if (path.match(pattern)) {
            console.debug(`Routing '${path}' to ${handler.name}.`);
            return handlerWrapper(handler, path, params, pageName, requirements);
        }
    }

    // Fallback to the default route.
    console.warn(`Unknown path '${path}'. Falling back to default route.`);
    return handlerWrapper(DEFAULT_HANDLER, path, params, undefined, {});
}

// Parse a raw path (which may have come from a hash)
// into a clean path and params (which can be empty).
function parsePath(rawPath) {
    rawPath = basicPathClean(rawPath);

    // Parse the raw path as a url to pull out parameters.
    let url = URL.parse(rawPath, 'http://localhost');

    // Pull out the path (which comes with a leading slash).
    let path = url.pathname.replace(/^\//, '');

    // Pull out the params into a simple object.
    let rawParams = url.searchParams;
    rawParams.sort();

    let params = {};
    for (const [key, value] of rawParams.entries()) {
        params[key] = value;
    }

    return [path, params];
}

// Do any setup for a handler, call the handler, then do any teardown.
function handlerWrapper(handler, path, params, pageName, requirements) {
    // Redirect to a login if required.
    if (requirements.login && !Autograder.hasCredentials()) {
        redirectLogin();
        return;
    }

    // If we need user info and the context does not exist, load the context.
    if (requirements.login && !Context.exists()) {
        Context.load()
            .then(function(result) {
                // Call this function again to complete all checks and call the wrapper.
                return handlerWrapper(handler, path, params, pageName, requirements);
            })
            .catch(function(result) {
                Log.warn('Failed to load context.', result);
                return redirectLogout();
            })
        ;
        return;
    }

    // Check for any requested courses or assignments.
    let context = Context.get()

    // Check course.
    if (requirements.course) {
        let courseID = params[PARAM_COURSE];
        if (!courseID) {
            Log.warn(`No course id specified for path '${path}'.`, null, true);
            return;
        }

        if (!Object.hasOwn(context.user.courses, courseID)) {
            Log.warn(`User ('${context.user.email}') is not enrolled in course ('${courseID}').`, null, true);
            return;
        }

        // Check assignment (requires course).
        if (requirements.assignment) {
            let assignmentID = params[PARAM_ASSIGNMENT];
            if (!assignmentID) {
                Log.warn(`No assignment id specified for path '${path}'.`, null, true);
                return;
            }

            if (!Object.hasOwn(context.courses[courseID].assignments, assignmentID)) {
                Log.warn(`Course ('${courseID}') does not have assignment ('${assignmentID}').`, null, true);
                return;
            }
        }
    }

    // This path now has everything it needs.

    // Set the context user.
    setContextUserDisplay();

    let container = mainConatiner();

    // Set the page inforamtion.
    if (pageName) {
        container.setAttribute('data-page', pageName.toLowerCase());
        setTitle(pageName);
    }

    // Call the handler.
    handler(path, params, context, container);
}

function setTitle(title, titleHTML = undefined) {
    if (titleHTML) {
        document.querySelector('.page .page-title').innerHTML = titleHTML;
    } else {
        document.querySelector('.page .page-title').innerHTML = `<span>${title}</span>`;
    }

    document.title = `${title} :: Autograder`;
}

function setContextUserDisplay() {
    let context = Context.get()

    let currentUserHTML = '';
    let loginAreaHTML = '';

    if (context?.user) {
        currentUserHTML = `
            <span>${context.user.name}</span>
        `;

        loginAreaHTML = `
            <a href='#logout'>Log Out</span>
        `;
    } else {
        currentUserHTML = '';
        loginAreaHTML = `
            <a href='#login'>Log In</span>
        `;
    }

    document.querySelector('.header .user-info .current-user').innerHTML = currentUserHTML;
    document.querySelector('.header .user-info .login-area').innerHTML = loginAreaHTML;
}

function mainConatiner() {
    return document.querySelector('.page-body .content');
}

function handlerNotFound(path, params, context, container) {
    container.innerHTML = `
        <h2>Location Not Found</h2>
        <p>We could not find the location '${path}'.</p>
    `;
}

// Return a standardized location that always has as leading hash.
function getLocationHash() {
    let hash = window.location.hash.trim();

    if (hash.length === 0) {
        return '#';
    }

    return hash;
}

// Form a path (location.hash).
// The returned path will be standardized so it can be compared directly,
// and include a leading hash symbol.
function formHashPath(path, params = {}) {
    path = basicPathClean(path);

    // Create a fake URL for parsing and formatting.
    let url = URL.parse(path, 'http://localhost');

    // Add the params.
    for (const [key, value] of Object.entries(params)) {
        if (!value) {
            continue;
        }

        url.searchParams.append(key, value);
    }

    // Sort the params.
    url.searchParams.sort();

    // Pull out the path (which comes with a leading slash).
    path = url.pathname.replace(/^\//, '');

    // Add on the params
    // (empty if there are none and includes the leading '?' if there are).
    path += url.search;

    return '#' + path;
}

function basicPathClean(path) {
    path = path.trim();

    // Remove leading hashes, slashes, and spaces.
    path = path.replace(/^[\s\/#]+/, '');

    // Remove tailing slashes and spaces.
    path = path.replace(/[\/\s]+$/, '');

    return path;
}

function redirect(path = '') {
    window.location.hash = path;
}

function redirectHome() {
    redirect('');
}

function redirectLogin() {
    redirect('login');
}

function redirectLogout() {
    redirect('logout');
}

function loadingStart(container = undefined, modal = true) {
    container = container ?? mainConatiner();

    let loadingClass = 'loading';
    if (modal) {
        loadingClass += ' loading-modal';
    }

    container.innerHTML = `
        <div class='loading-container'>
            <div class='${loadingClass}'>
                <img src='images/loading-basic-edq.png' />
            </div>
        </div>
    `;
}

function loadingStop(container = undefined) {
    container = container ?? mainConatiner();

    container.innerHTML = '';
}

export {
    addRoute,
    formHashPath,
    init,
    loadingStart,
    loadingStop,
    redirect,
    redirectHome,
    redirectLogin,
    redirectLogout,
    setTitle,

    PARAM_COURSE,
    PARAM_ASSIGNMENT,
    PARAM_SUBMISSION,
    PARAM_TARGET_ENDPOINT,

    PATH_COURSE,
    PATH_ASSIGNMENT,
    PATH_SUBMIT,
    PATH_PEEK,
    PATH_HISTORY,
    PATH_SERVER,
    PATH_SERVER_CALL_API,
}
