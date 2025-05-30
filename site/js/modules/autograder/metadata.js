import * as Core from './core.js'

function describe() {
    return Core.sendRequest({
        endpoint: 'metadata/describe',
    });
}

export {
    describe,
}
