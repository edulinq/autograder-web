import * as Core from '../core.js'

function query(params) {
    return Core.sendRequest({
        endpoint: 'logs/query',
        payload: params,
    });
}

export {
    query,
}
