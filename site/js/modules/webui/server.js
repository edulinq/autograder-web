import * as Autograder from '../autograder/base.js'

import * as Render from './render.js'
import * as Routing from './routing.js'

// The priority of the field to show first.
// Items later in the list have the highest priority.
const FIELD_PRIORITY = [
    "assignment-id",
    "course-id",
    "user-pass",
    "user-email",
];

function init() {
    Routing.addRoute(/^server$/, handlerServer, 'Server Actions', undefined);
    Routing.addRoute(/^server\/call-api$/, handlerCallAPI, 'Call API', undefined);
}

function handlerServer(path, params, context, container) {
    Routing.loadingStart(container);

    let args = {
        [Routing.PARAM_TARGET_ENDPOINT]: params[Routing.PARAM_TARGET_ENDPOINT],
    };

    let cards = [
        Render.makeCardObject('server-action', 'Call API', Routing.formHashPath(Routing.PATH_SERVER_CALL_API, args)),
    ];

    container.innerHTML = `
        ${Render.cards(cards)}
    `;
}

function handlerCallAPI(path, params, context, container) {
    Routing.loadingStart(container);

    Autograder.Server.describe()
        .then(function(result) {
            const endpoints = result["endpoints"];
            const selectedEndpoint = params[Routing.PARAM_TARGET_ENDPOINT] ?? undefined;

            render(endpoints, selectedEndpoint, context, container);
        })
        .catch(function(message) {
            console.error(message);
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function render(endpoints, selectedEndpoint, context, container) {
    let selector = renderSelector(endpoints, selectedEndpoint);
    let endpointArea = renderEndpointArea(endpoints, selectedEndpoint, context);

    container.innerHTML = `
        <div class="endpoint-page">
            <div class="endpoint-content">
                <div class="endpoint-controls">${selector}</div>
                <div class="endpoint-input">${endpointArea}</div>
                <div class="results-area"></div>
            </div>
        </div>
    `;

    container.querySelector(".endpoint-controls select").addEventListener("change", function(event) {
        let newParams = {
            [Routing.PARAM_TARGET_ENDPOINT]: event.target.value,
        };

        let path = Routing.formHashPath(Routing.PATH_SERVER_CALL_API, newParams);
        Routing.redirect(path);
    });

    let button = container.querySelector(".endpoint-input button");
    button?.addEventListener("click", function(event) {
        callEndpoint(selectedEndpoint, endpoints[selectedEndpoint]["input"], context, container);
    });

    let fieldset = container.querySelector(".endpoint-input fieldset");
    fieldset?.addEventListener("keydown", function(event) {
        if (event.key != "Enter") {
            return
        }

        callEndpoint(selectedEndpoint, endpoints[selectedEndpoint]["input"], context, container);
    });
}

function renderSelector(endpoints, selectedEndpoint) {
    let optionsList = [];

    for (const endpoint of Object.keys(endpoints)) {
        let isSelected = "";
        if (endpoint === selectedEndpoint) {
            isSelected = "selected";
        }

        optionsList.push(`<option value="${endpoint}" ${isSelected}>${endpoint}</option>`);
    }

    return `
        <select id="endpoint-dropdown">
            <option value="">Select an endpoint...</option>
            ${optionsList.join("\n")}
        </select>
    `;
}

function renderEndpointArea(endpoints, selectedEndpoint, context) {
    if (!(selectedEndpoint in endpoints)) {
        return '';
    }

    let sortedInputs = endpoints[selectedEndpoint]["input"];
    sortedInputs.sort(function(a, b) {
        let aPriority = FIELD_PRIORITY.indexOf(a.name);
        let bPriority = FIELD_PRIORITY.indexOf(b.name);

        return bPriority - aPriority;
    });

    let inputFields = [];
    for (const field of sortedInputs) {
        let inputType = "text";
        let placeholder = "";

        if (field.name === "user-email") {
            placeholder = context.user.email;
            inputType = "email";
        } else if (field.name === "user-pass") {
            placeholder = "<current token>";
            inputType = "password";
        } else if (field.type.includes("SelfOr")) {
            placeholder = context.user.email;
            inputType = "email";
        }

        inputFields.push(`
            <div class="input-field">
                <label for="${field.name}">${field.name} (expects: ${field.type})</label>
                <input class="tertiary-color drop-shadow" type="${inputType}" id="${field.name}" name="${field.name}" placeholder="${placeholder}">
            </div>
        `);
    }

    return `
        <div class="endpoint-title secondary-color drop-shadow">
            <h2>
                ${selectedEndpoint}
            </h2>
        </div>

        <div class="user-input-fields secondary-color drop-shadow">
            <fieldset>
                ${inputFields.join("\n")}
            </fieldset>
        </div>

        <button class="call-endpoint">
            Call Endpoint
        </button>
    `;
}

function callEndpoint(targetEndpoint, inputFields, context, container) {
    Routing.loadingStart(container.querySelector(".results-area"), false);

    let overrideEmail = undefined;
    let overrideCleartext = undefined;

    let params = {};

    for (let field of inputFields) {
        let input = container.querySelector(`.endpoint-input fieldset [name="${field.name}"]`);
        if (!input || input.value === "") {
            continue;
        }

        if (field.name === "user-email") {
            overrideEmail = input.value;
            continue;
        }

        if (field.name === "user-pass") {
            overrideCleartext = input.value;
            continue;
        }

        if (field.type === "string") {
            params[field.name] = input.value;
        } else {
            // Users can input complex types into text boxes.
            // Attempt to parse the input string into JSON.
            // Fallback to the raw input in case the input is not meant to be JSON.
            try {
                params[field.name] = JSON.parse(`${input.value}`);
            } catch (error) {
                console.error(error);
                params[field.name] = input.value;
            }
        }
    }

    let resultsArea = container.querySelector(".results-area");

    Autograder.Server.callEndpoint({
            targetEndpoint: targetEndpoint,
            params: params,
            overrideEmail: overrideEmail,
            overrideCleartext: overrideCleartext,
            clearContextUser: false,
        }).then(function(result) {
            resultsArea.innerHTML = `
                <pre><code class="result code code-block secondary-color drop-shadow" data-lang="json">${JSON.stringify(result, null, 4)}</code></pre>
            `;
        })
        .catch(function(message) {
            console.error(message)
            let errorHTML = Render.autograderError(message);
            resultsArea.innerHTML = `
                <div class="result secondary-color drop-shadow">
                    ${errorHTML}
                </div>
            `;
        })
    ;
}

export {
    init,
}
