import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';
import * as Render from '../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_SERVER, handlerServer, 'Server Actions', Core.Routing.NAV_SERVER, undefined);
}

function handlerServer(path, params, context, container) {
    Core.Routing.loadingStart(container);

    let args = {
        [Core.Routing.PARAM_TARGET_ENDPOINT]: params[Core.Routing.PARAM_TARGET_ENDPOINT],
    };

    let cards = [
        new Render.Card('server-action', 'API Documentation', Core.Routing.formHashPath(Core.Routing.PATH_SERVER_DOCS)),
        new Render.Card('server-action', 'Call API', Core.Routing.formHashPath(Core.Routing.PATH_SERVER_CALL_API, args)),
        new Render.Card('server-action', 'View Server Logs', Core.Routing.formHashPath(Core.Routing.PATH_SERVER_LOGS, args)),
        new Render.Card('server-action', 'List Courses', Core.Routing.formHashPath(Core.Routing.PATH_SERVER_COURSES_LIST, args), {
            minServerRole: Autograder.Common.SERVER_ROLE_ADMIN,
        }),
        new Render.Card('server-action', 'List Users', Core.Routing.formHashPath(Core.Routing.PATH_SERVER_USERS_LIST, args), {
            minServerRole: Autograder.Common.SERVER_ROLE_ADMIN,
        }),
    ];

    let cardSections = [
        ['Server Actions', cards],
    ];

    container.innerHTML = Render.makeCardSections(context, '', cardSections);
}

init();
