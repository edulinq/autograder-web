import * as Autograder from '/js/modules/autograder/base.js'
import * as Util from './util.js'

let contextUser = undefined;

function getContextUser() {
    return contextUser;
}

function setContextUser(user) {
    contextUser = user;
}

function clearContextUser() {
    contextUser = undefined;
}

// Get the (sorted) list of courses for the context user,
// undefined if there is no context user.
function getContextCourses() {
    if (!contextUser) {
        return undefined;
    }

    let sortedCourses = Object.values(contextUser.courses).sort(function(a, b) {
        return Util.caseInsensitiveStringCompare(a.name, b.name);
    });

    return sortedCourses;
}

function loading() {
    // TODO
    console.log("Loading");
}

// Add the base navigation items (e.g., home and login/logout)
// to the given name items and return the modified list.
function _getBaseNav(items = []) {
    if (Autograder.hasCredentials()) {
        items.unshift(['Home', '']);
        items.push(['Account', '#account']);
        items.push(['Logout', '#logout']);
    } else {
        items.push(['Login', '#login']);
    }

    return items;
}

// Add the navigation items (e.g. courses) for the context user
// to the given name items and return the modified list.
function _getContextUserNav(items = []) {
    if (!contextUser) {
        return items;
    }

    for (const courseInfo of getContextCourses()) {
        items.push([courseInfo.name, `#course?id=${courseInfo.id}`])
    }

    return items;
}

// The passed in items should be: [[name, link], ...].
// If not deselected, most nav items will be handled automatically.
function setNav(items = [], includeContextUser = true, includeBase = true) {
    if (includeContextUser) {
        items = _getContextUserNav(items);
    }

    if (includeBase) {
        items = _getBaseNav(items);
    }

    let navHTML = [`<ul class='nav'>`];

    for (const [name, link] of items) {
        let classes = [];

        // Check to see if this nav item is the active one.
        if (link === window.location.hash) {
            classes.push('active');
        }

        navHTML.push(`<li><a class='${classes.join(' ')}' href='${link}'>${name}</a></li>`);
    }

    navHTML.push('<ul>');

    document.querySelector('.nav').innerHTML = navHTML.join('');
}

function redirect(path = '') {
    window.location.hash = path;
}

export {
    clearContextUser,
    getContextCourses,
    getContextUser,
    setContextUser,
    redirect,

    loading,
    setNav,
}
