import * as Autograder from '../autograder/base.js';

import * as Icon from './icon.js';
import * as Input from './input.js';
import * as Render from './render.js';
import * as Routing from './routing.js';
import * as Util from './util.js';

// The priority of the field to show first.
// Items later in the list have the highest priority.
const FIELD_PRIORITY = [
    "assignment-id",
    "course-id",
    "user-pass",
    "user-email",
];

const INDENT = "    ";

function init() {
    Routing.addRoute(/^server$/, handlerServer, 'Server Actions', Routing.NAV_SERVER, undefined);
    Routing.addRoute(/^server\/call-api$/, handlerCallAPI, 'Call API', Routing.NAV_SERVER, undefined);
    Routing.addRoute(/^server\/docs$/, handlerDocs, "API Documentation", Routing.NAV_SERVER);
    Routing.addRoute(/^server\/users\/list$/, handlerUsers, "List Users", Routing.NAV_SERVER);
}

function handlerServer(path, params, context, container) {
    Routing.loadingStart(container);

    let args = {
        [Routing.PARAM_TARGET_ENDPOINT]: params[Routing.PARAM_TARGET_ENDPOINT],
    };

    let cards = [
        new Render.Card('server-action', 'API Documentation', Routing.formHashPath(Routing.PATH_SERVER_DOCS)),
        new Render.Card('server-action', 'Call API', Routing.formHashPath(Routing.PATH_SERVER_CALL_API, args)),
        new Render.Card('server-action', 'List Users', Routing.formHashPath(Routing.PATH_SERVER_USERS_LIST, args), {
            minServerRole: Autograder.Users.SERVER_ROLE_ADMIN,
        }),
    ];

    let cardSections = [
        ['Server Actions', cards],
    ];

    container.innerHTML = Render.makeCardSections(context, '', cardSections);
}

function handlerCallAPI(path, params, context, container) {
    Routing.loadingStart(container);

    Autograder.Server.describe()
        .then(function(result) {
            const endpoints = result["endpoints"];
            const selectedEndpoint = params[Routing.PARAM_TARGET_ENDPOINT] ?? undefined;

            render(endpoints, selectedEndpoint, params, context, container);
        })
        .catch(function(message) {
            console.error(message);
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function render(endpoints, selectedEndpoint, params, context, container) {
    let description = undefined;
    if (selectedEndpoint in endpoints) {
        description = endpoints[selectedEndpoint].description;
    } else {
        selectedEndpoint = undefined;
    }

    let selectorHTML = renderSelector(context, endpoints, selectedEndpoint);
    let inputFields = getInputFields(endpoints, selectedEndpoint, context);

    let onSubmitFunc = undefined;
    if (selectedEndpoint) {
        onSubmitFunc = callEndpoint;
    }

    Render.makePage(
            params, context, container, onSubmitFunc,
            {
                className: 'call-endpoint',
                controlAreaHTML: selectorHTML,
                header: selectedEndpoint,
                description: description,
                inputs: inputFields,
                buttonName: 'Call Endpoint',
                iconName: Icon.ICON_NAME_CALL_ENDPOINT,
            },
        )
    ;

    container.querySelector(".template-control-area select").addEventListener("change", function(event) {
        let newParams = {
            [Routing.PARAM_TARGET_ENDPOINT]: event.target.value,
        };

        let path = Routing.formHashPath(Routing.PATH_SERVER_CALL_API, newParams);
        Routing.redirect(path);
    });
}

function renderSelector(context, endpoints, selectedEndpoint) {
    let optionsList = [];
    for (const endpoint of Object.keys(endpoints)) {
        optionsList.push(new Input.SelectOption(endpoint));
    }

    let selector = new Input.FieldType(context, "endpoint-dropdown", "Select an endpoint...", {
        type: Input.INPUT_TYPE_SELECT,
        choices: optionsList,
        defaultValue: selectedEndpoint,
    });

    return `
        <fieldset>
            ${selector.toHTML()}
        </fieldset>
    `;
}

function getInputFields(endpoints, selectedEndpoint, context) {
    if (!selectedEndpoint) {
        return [];
    }

    let sortedInputs = endpoints[selectedEndpoint]["input"];
    sortedInputs.sort(function(a, b) {
        let aPriority = FIELD_PRIORITY.indexOf(a.name);
        let bPriority = FIELD_PRIORITY.indexOf(b.name);

        return bPriority - aPriority;
    });

    let inputFields = [];
    for (const field of sortedInputs) {
        inputFields.push(new Input.FieldType(context, field.name, field.name, {
            type: field.type,
            required: field.required,
        }));
    }

    return inputFields;
}

function callEndpoint(params, context, container, inputParams) {
    const targetEndpoint = params[Routing.PARAM_TARGET_ENDPOINT] ?? undefined;
    if (!targetEndpoint) {
        return Promise.resolve("Unable to find target endpoint.");
    }

    let overrideEmail = undefined;
    if (inputParams["user-email"]) {
        overrideEmail = inputParams["user-email"];

        // Remove the unnecessary email field.
        delete inputParams["user-email"];
    }

    let overrideCleartext = undefined;
    if (inputParams["user-pass"]) {
        overrideCleartext = inputParams["user-pass"];

        // Remove the unnecessary password field.
        delete inputParams["user-pass"];
    }

    return Autograder.Server.callEndpoint({
            targetEndpoint: targetEndpoint,
            params: inputParams,
            overrideEmail: overrideEmail,
            overrideCleartext: overrideCleartext,
            clearContextUser: false,
        })
        .then(function(result) {
            return Render.codeBlockJSON(result);
        })
        .catch(function(message) {
            console.error(message)
            return Render.autograderError(message);
        })
    ;
}

function handlerDocs(path, params, context, container) {
    Render.setTabTitle('API Documentation');

    Autograder.Server.describe()
        .then(function(result) {
            container.innerHTML = displayDocumentation(result);

            setupFilters(container);
        })
        .catch(function (message) {
            console.error(message);
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function displayDocumentation(data) {
    return `
        <div class="api-docs">
            <div class="endpoints">
                <h1>Endpoints</h1>
                <input type="text" placeholder="Filter Endpoints">
                <div class="scrollable">
                    ${displayEndpoints(data.endpoints)}
                </div>
            </div>
            <div class="api-types">
                <h1>Types</h1>
                <input type="text" placeholder="Filter Types">
                <div class="scrollable">
                    ${displayTypes(data.types)}
                </div>
            </div>
        </div>
    `;
}

function setupFilters(container) {
    container.querySelector(".endpoints input").addEventListener("input", function(event) {
        container.querySelectorAll(".api-docs .endpoints .endpoint").forEach(function(endpointDiv) {
            let endpoint = endpointDiv.getAttribute("data-endpoint");
            if (endpoint.toLowerCase().includes(event.target.value.toLowerCase())) {
                endpointDiv.classList.remove("hidden");
            } else {
                endpointDiv.classList.add("hidden");
            }
        });
    });

    container.querySelector(".api-types input").addEventListener("input", function(event) {
        container.querySelectorAll(".api-docs .api-types .api-type").forEach(function(typeDiv) {
            let type = typeDiv.getAttribute("data-api-type");
            if (type.toLowerCase().includes(event.target.value.toLowerCase())) {
                typeDiv.classList.remove("hidden");
            } else {
                typeDiv.classList.add("hidden");
            }
        });
    });
}

function displayEndpoints(endpointData) {
    let endpoints = [];

    Object.entries(endpointData).forEach(function([endpoint, data]) {
        let args = {
            [Routing.PARAM_TARGET_ENDPOINT]: endpoint,
        };

        let inputTypes = Render.tableFromDictionaries(
            [["name", "Name"], ["type", "Type"]],
            data.input,
        );

        let outputTypes = Render.tableFromDictionaries(
            [["name", "Name"], ["type", "Type"]],
            data.output,
        );

        endpoints.push(`
            <div class="endpoint" data-endpoint="${endpoint}">
                <a href="${Routing.formHashPath(Routing.PATH_SERVER_CALL_API, args)}">
                    <h3>${endpoint}</h3>
                </a>
                <p>${data.description}</p>
                <div class="endpoint-details">
                    <div>
                        <h4>Input</h4>
                        ${inputTypes}
                    </div>
                    <div>
                        <h4>Output</h4>
                        ${outputTypes}
                    </div>
                </div>
            </div>
        `);
    });

    return endpoints.join("\n");
}

function displayTypes(typeData) {
    let types = [];

    Object.entries(typeData).forEach(function([type, data]) {
        let fieldData = "";
        if (data.fields) {
            let fieldTypes = Render.tableFromDictionaries(
                [["name", "Name"], ["type", "Type"]],
                data.fields,
            );

            fieldData = `
                <div class="api-type-details">
                    <div>
                        <h4>Fields</h4>
                        ${fieldTypes}
                    </div>
                </div>
            `;
        }

        types.push(`
            <div class="api-type" data-api-type="${type}">
                <h3>${type}</h3>
                <p>${data.description ?? ""}</p>
                <h4>Category</h4>
                <p>${data.category}</p>
                ${fieldData}
            </div>
        `);
    });

    return types.join("\n");
}

function handlerUsers(path, params, context, container) {
    Render.setTabTitle('List Users');

    let inputFields = [
        new Input.FieldType(context, 'users', 'Target Users', {
            type: '[]model.ServerUserReference',
        }),
    ];

    Render.makePage(
         params, context, container, listServerUsers,
            {
                header: 'List Users',
                description: 'List the users on the server (defaults to all users).',
                inputs: inputFields,
                buttonName: 'List Users',
            },
        )
    ;
}

function listServerUsers(params, context, container, inputParams) {
    return Autograder.Server.users(inputParams.users)
        .then(function(result) {
            if (result.users.length === 0) {
                return '<p>Unable to find target users.</p>';
            }

            Render.apiOutputSwitcher(result.users, container, {
                renderOptions: new Render.APIValueRenderOptions({
                    keyOrdering: ['id', 'email', 'name', 'role', 'type', 'courses'],
                    initialIndentLevel: -1,
                }),
                modes: [
                    Render.API_OUTPUT_SWITCHER_TEXT,
                    Render.API_OUTPUT_SWITCHER_TABLE,
                    Render.API_OUTPUT_SWITCHER_JSON,
                ],
            });

            return undefined;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

export {
    init,
};
