import * as Assignment from './assignment.js'
import * as Course from './course.js'
import * as Home from './home.js'
import * as Login from './login.js'
import * as Routing from './routing.js'
import * as Server from './server.js'
import * as System from './system.js'
import * as Util from './util.js'

function init(initialRoute = true) {
    // Init base libs.
    System.init();

    // Init handlers.
    Assignment.init();
    Course.init();
    Home.init();
    Login.init();
    Server.init();

    // Init routes last (since it will route).
    Routing.init(initialRoute);
}

export {
    init,
}
