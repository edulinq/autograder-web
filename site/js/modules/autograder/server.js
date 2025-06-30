import * as Core from './core.js'

let apiDescription = undefined;

function callEndpoint({
        targetEndpoint, params,
        overrideEmail = undefined, overrideCleartext = undefined,
        clearContextUser = true,
        }) {
    return Core.sendRequest({
        endpoint: targetEndpoint,
        payload: params,
        overrideEmail: overrideEmail,
        overrideCleartext: overrideCleartext,
        clearContextUser: clearContextUser,
    });
}

function describe() {
    if (apiDescription) {
        return Promise.resolve(apiDescription);
    }

    let promise = Core.sendRequest({
        endpoint: 'metadata/describe',
    });

    return promise
        .then(function(result) {
            apiDescription = result;
            return result;
        })
    ;
}

export {
    callEndpoint,
    describe,
}
