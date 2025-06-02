import * as Autograder from '../autograder/base.js'

// import * as Log from './log.js'
import * as Render from './render.js'
import * as Routing from './routing.js'
// import * as Util from './util.js'

function init() {
    Routing.addRoute(/^endpoints$/, handlerEndpoints, 'Endpoints', undefined);
}

function handlerEndpoints(path, params, context, container) {
    let targetEndpoint = params[Routing.PARAM_TARGET_ENDPOINT] || undefined;

    if (targetEndpoint) {
        prepareEndpointCaller(path, params, context, container)
    } else {
        prepareEndpointDropdown(path, params, context, container)
    }
}

function prepareEndpointDropdown(path, params, context, container) {
    Routing.loadingStart(container)

    let html = `
        <label for="endpoints">Choose an endpoint:</label>
        <select class="endpoints" id="endpoints">
            <option value="">Select an endpoint...</option>
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
        </label>
        `

            container.innerHTML = html;

            let dropdown = document.querySelector(".endpoints");

            dropdown.addEventListener("change", function(event) {
                let newParams = {
                    [Routing.PARAM_TARGET_ENDPOINT]: event.target.value,
                };

                let path = Routing.formHashPath(Routing.PATH_ENDPOINTS, newParams);
                Routing.redirect(path);
            });
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function prepareEndpointCaller(path, params, context, container) {
    let targetEndpoint = params[Routing.PARAM_TARGET_ENDPOINT]

    Autograder.Metadata.describe()
        .then(function(result) {
            const endpointInfo = result["endpoints"][targetEndpoint];
            if (!endpointInfo) {
                container.innerHTML = Render.autograderError(`Unknown endpoint: '${targetEndpoint}'.`);
                return
            }

            let html = `
            <h3>${targetEndpoint}</h3><div id="input-parameters">
            `

            for (let field of endpointInfo["input"]) {
                html += `
                <label for="${field.name}">${field.name} (expects: ${field.type})</label>
                <input type="text" id=${field.name} name=${field.name}<br><br>
                `
            }

            html += `
                <br/>
                <button id="call-endpoint">Call Endpoint</button>
            </div>
            `

            container.innerHTML = html;

            let button = document.getElementById("call-endpoint")

            button.addEventListener("click", function() {
                callEndpoint(targetEndpoint, endpointInfo["input"], context, container);
            });
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function callEndpoint(endpointName, inputFields, context, container) {
    console.log(endpointName)
    console.log(inputFields)
}

export {
    init,
}
