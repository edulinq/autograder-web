import * as Core from './core.js'

const COURSE_ROLE_UNKNOWN = 0;
const COURSE_ROLE_OTHER = 10;
const COURSE_ROLE_STUDENT = 20;
const COURSE_ROLE_GRADER = 30;
const COURSE_ROLE_ADMIN = 40;
const COURSE_ROLE_OWNER = 50;

const MAP_COURSE_ROLE_TO_VALUE = {
    "unknown": COURSE_ROLE_UNKNOWN,
    "other": COURSE_ROLE_OTHER,
    "student": COURSE_ROLE_STUDENT,
    "grader": COURSE_ROLE_GRADER,
    "admin": COURSE_ROLE_ADMIN,
    "owner": COURSE_ROLE_OWNER,
}

const SERVER_ROLE_UNKNOWN = 0;
const SERVER_ROLE_USER = 10;
const SERVER_ROLE_COURSECREATOR = 20;
const SERVER_ROLE_ADMIN = 30;
const SERVER_ROLE_OWNER = 40;
const SERVER_ROLE_ROOT = 50;

const MAP_SERVER_ROLE_TO_VALUE = {
    "unknown": SERVER_ROLE_UNKNOWN,
    "user": SERVER_ROLE_USER,
    "creator": SERVER_ROLE_COURSECREATOR,
    "admin": SERVER_ROLE_ADMIN,
    "owner": SERVER_ROLE_OWNER,
    "root": SERVER_ROLE_ROOT,
}

function getCourseRoleValue(role) {
    let value = MAP_COURSE_ROLE_TO_VALUE[role];
    if (!value) {
        return 0;
    }

    return value;
}

function getServerRoleValue(role) {
    let value = MAP_SERVER_ROLE_TO_VALUE[role];
    if (!value) {
        return 0;
    }

    return value;
}

function createToken(email, cleartext) {
    return Core.sendRequest({
        endpoint: 'users/tokens/create',
        overrideEmail: email,
        overrideCleartext: cleartext,
    });
}

function get() {
    return Core.sendRequest({
        endpoint: 'users/get',
    });
}

function listServerUsers() {
    return Core.sendRequest({
        endpoint: 'users/list',
    });
}

export {
    createToken,
    getCourseRoleValue,
    getServerRoleValue,
    get,
    listServerUsers,

    COURSE_ROLE_UNKNOWN,
    COURSE_ROLE_OTHER,
    COURSE_ROLE_STUDENT,
    COURSE_ROLE_GRADER,
    COURSE_ROLE_ADMIN,
    COURSE_ROLE_OWNER,
    SERVER_ROLE_UNKNOWN,
    SERVER_ROLE_USER,
    SERVER_ROLE_COURSECREATOR,
    SERVER_ROLE_ADMIN,
    SERVER_ROLE_OWNER,
    SERVER_ROLE_ROOT,
}
