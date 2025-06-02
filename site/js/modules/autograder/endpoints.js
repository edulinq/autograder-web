import * as Core from './core.js'

function endpoints() {
    return Core.sendRequest({
        endpoint: 'endpoints',
    });
}

export {
    endpoints,
}
