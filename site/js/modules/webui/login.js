import * as Autograder from '../autograder/base.js'

import * as Context from './context.js'
import * as Input from './input.js'
import * as Render from './render.js'
import * as Routing from './routing.js'

function init() {
    Routing.addRoute(/^login$/, handlerLogin, 'Login', {login: false});
    Routing.addRoute(/^logout$/, handlerLogout, 'Logout');
}

function handlerLogin(path, params, context, container) {
    let inputFields = [
        new Input.FieldType(context, 'email', 'Email', {
            type: Input.INPUT_TYPE_EMAIL,
            required: true,
            placeholder: 'email',
        }),
        new Input.FieldType(context, 'cleartext', 'Password', {
            type: Input.INPUT_TYPE_PASSWORD,
            required: true,
            placeholder: 'password / token',
        }),
    ];

    Render.makePage(
            params, context, container, login,
            {
                inputs: inputFields,
                buttonName: 'Login',
            },
        )
    ;
}

function login(params, context, container, inputParams) {
    if (Autograder.hasCredentials()) {
        return Promise.resolve(`
            <p>Already logged in.</p>
            <p>Logout first to login again.</p>
        `);
    }

    return Autograder.Users.createToken(inputParams.email, inputParams.cleartext)
        .then(function(token) {
            Autograder.setCredentials(inputParams.email, token['token-id'], token['token-cleartext']);
            Routing.redirectHome();
            return `<p>Successfully logged in.</p>`;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerLogout(path, params, context, container) {
    Context.clear();
    Autograder.clearCredentials();
    Routing.redirectLogin();
}

export {
    init,
}
