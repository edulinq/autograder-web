import * as Core from './core.js'

function callEndpoint(targetEndpoint, params) {
    return Core.sendRequest({
        endpoint: targetEndpoint,
        payload: params,
    });
}

function endpoints() {
    return Core.sendRequest({
        endpoint: 'endpoints',
    });
}

export {
    callEndpoint,
    endpoints,
}
