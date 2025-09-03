import * as Icon from './icon.js'
import * as Render from './render.js'
import * as Routing from './routing.js'

function init() {
    Routing.addRoute(/^$/, handlerHome, 'Home', Routing.NAV_HOME);
}

function handlerHome(path, params, context, container) {
    container.innerHTML = `
        <div class='home-page'>
            <div class='home-content link-color'>
                <div class='home-title secondary-color drop-shadow'>
                    ${Icon.getIconHTML(Icon.ICON_NAME_LOGO)}
                    <h1>
                        Welcome to the LynxGrader!
                    </h1>
                </div>

                <div class='secondary-color drop-shadow'>
                    <p>
                        You are currently using the <a href='https://github.com/edulinq/autograder-web'>web frontend</a>
                        for the LynxGrader running on <a href='${document.location.href}'><strong>${document.location.hostname}</strong></a>.
                    </p>

                    <p>
                        This frontend has a subset of the full functionality,
                        which you access with command-line clients such as the <a href='https://github.com/edulinq/autograder-py'>Python CLI</a>.
                    </p>
                </div>

                <div class='secondary-color drop-shadow'>
                    <span>Other EduLinq Resources:</span>
                    <ul>
                        <li><a href='https://github.com/edulinq/autograder-server'>LynxGrader Server</a></li>
                        <li><a href='https://github.com/edulinq/autograder-web'>Web Frontend</a></li>
                        <li><a href='https://github.com/edulinq/autograder-py'>Python Interface</a></li>
                        <li><a href='https://discord.gg/xRxdbWqtWS'>Community Discord</a></li>
                    </ul>
                </div>
            </div>
        </home>
    `;
}

export {
    init,
}
