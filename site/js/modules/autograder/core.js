import * as Util from './util.js'

const BASE_URL = '/api'

const API_VESION = 'v03';
const CREDENTIALS_KEY = 'AUTOGRADER.CREDENTIALS';

const REQUEST_USER_EMAIL_KEY = 'user-email';
const REQUEST_USER_PASS_KEY = 'user-pass';

function hasCredentials() {
    return Boolean(localStorage.getItem(CREDENTIALS_KEY));
}

function getCredentials() {
    let credentials = localStorage.getItem(CREDENTIALS_KEY);
    if (credentials) {
        return JSON.parse(credentials);
    }

    return undefined;
}

function setCredentials(email, id, cleartext) {
    let credentials = {
        'email': email,
        'token-id': id,
        'token': Util.sha256(cleartext),
    };

    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

function clearCredentials(sendDelete = true) {
    let credentials = getCredentials();
    localStorage.removeItem(CREDENTIALS_KEY);

    if (!credentials) {
        return Promise.resolve({'found': false});
    }

    if (!sendDelete) {
        return Promise.resolve({'found': true});
    }

    return deleteToken(credentials);
}

// Delete the context token.
function deleteToken(credentials) {
    let args = {
        [REQUEST_USER_EMAIL_KEY]: credentials['email'],
        'token-id': credentials['token-id'],
        [REQUEST_USER_PASS_KEY]: credentials['token'],
    };

    return sendRequest({
        endpoint: 'users/tokens/delete',
        payload: args,
    });
}

async function resolveAPIResponse(response, clearContextUser = true) {
    let body = await response.json();

    if (!body.success) {
        if (response.status == 401) {
            if (clearContextUser) {
                // Clear any credentials in the cache when the context user has an auth error.
                clearCredentials(false);
            }

            // Shorten the message for auth error.
            return Promise.reject(body.message);
        }

        return Promise.reject(`Autograder API call failed: '${body.message}'.`);
    }

    return Promise.resolve(body.content);
}

async function resolveAPIError(response) {
    console.error("Failed to send API request to autograder.");
    console.error(response);

    if (!response.text) {
        return Promise.reject(response);
    }

    let body = await response.text();
    console.error(body);

    return Promise.reject(body);
}

function sendRequest({
        endpoint = undefined,
        payload = {}, files = [],
        overrideEmail = undefined, overrideCleartext = undefined,
        clearContextUser = true,
        }) {
    if (!endpoint) {
        throw new Error("Endpoint not specified.")
    }

    let credentials = getCredentials();
    if (credentials) {
        payload[REQUEST_USER_EMAIL_KEY] = credentials.email;
        payload[REQUEST_USER_PASS_KEY] = credentials.token;
    }

    if (overrideEmail) {
        payload[REQUEST_USER_EMAIL_KEY] = overrideEmail;
    }

    if (overrideCleartext) {
        payload[REQUEST_USER_PASS_KEY] = Util.sha256(overrideCleartext);
    }

    let url = `${BASE_URL}/${API_VESION}/${endpoint}`;

    let body = new FormData();
    body.set('content', JSON.stringify(payload));

    for (const file of files) {
        body.append(file.name, file);
    }

    let response = fetch(url, {
        'method': 'POST',
        'body': body,
    });

    return response.then(function(result) {
        return resolveAPIResponse(result, clearContextUser);
    }, resolveAPIError);
}

export {
    hasCredentials,
    setCredentials,
    clearCredentials,

    sendRequest,
}
