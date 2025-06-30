import * as Core from './core.js';

function email(params) {
    return Core.sendRequest({
        endpoint: 'courses/admin/email',
        payload: params,
    });
}

export {
    email,
};
