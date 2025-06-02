import * as Assignments from './assignments.js'
import * as Core from './core.js'
import * as Endpoints from './endpoints.js'
import * as Metadata from './metadata.js'
import * as Submissions from './submissions.js'
import * as Users from './users.js'

// API functions to interact with an autograder server.

let hasCredentials = Core.hasCredentials;
let setCredentials = Core.setCredentials;
let clearCredentials = Core.clearCredentials;

export {
    Assignments,
    Endpoints,
    Metadata,
    Submissions,
    Users,

    hasCredentials,
    setCredentials,
    clearCredentials,
}
