import * as Assignments from './assignments.js';
import * as Core from './core.js';
import * as Course from './course.js';
import * as Server from './server.js';
import * as Submissions from './submissions.js';
import * as Users from './users.js';

// API functions to interact with an autograder server.

let hasCredentials = Core.hasCredentials;
let setCredentials = Core.setCredentials;
let clearCredentials = Core.clearCredentials;

export {
    Assignments,
    Course,
    Server,
    Submissions,
    Users,

    hasCredentials,
    setCredentials,
    clearCredentials,
};
