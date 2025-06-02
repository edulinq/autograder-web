import * as Autograder from '../autograder/base.js'

// import * as Log from './log.js'
import * as Render from './render.js'
import * as Routing from './routing.js'
// import * as Util from './util.js'

function init() {
    Routing.addRoute(/^endpoints$/, handlerEndpoints, 'Endpoints', undefined);
}

function handlerEndpoints(path, params, context, container) {
    Routing.loadingStart(container)

    let html = `
        <label for="endpoints">Choose an endpoint:</label>
        <select name="endpoints" id="endpoints">
    `

    Autograder.Metadata.describe()
        .then(function(result) {
            for (const endpoint in result["endpoints"]) {
                html += `
            <option value="${endpoint}">${endpoint}</option>
                `
            }

            html += `
        </select>
        `

            container.innerHTML = html;
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

export {
    init,
}
