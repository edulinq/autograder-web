import fs from 'node:fs';
import path from 'node:path';
import stream from 'node:stream/web';

import * as Core from '../core.js';
import * as Util from '../util.js';

global.testData = {};

const DEFAULT_ID_EMAIL = 'server-admin@test.edulinq.org';
const DEFAULT_ID_CLEARTEXT = 'server-admin';

// Replace JSDOM objects with Node versions (Jest makes these replacements).
global.DecompressionStream = stream.DecompressionStream;

// Mock fetch to use our test data.
global.fetch = function(url, options = {}) {
    let endpoint = url.replace(/^\/api\/v\d+\//, '');
    let content = JSON.parse(options.body.get('content'));

    // Create arguments by lexicographically traversing the content.
    let args = {};
    for (const key of Object.keys(content).sort()) {
        args[key] = content[key];

        // Capitalize Course ID to match test data format.
        if (key === 'course-id') {
            args[key] = args[key].toUpperCase();
        }
    }

    // Extract files from response body object,
    // keys (other than reponse content) are file names.
    let files = [];
    for (const key of options?.body.keys()) {
        if (key === "content") {
            continue;
        }

        // Format file name to match test data format.
        files.push(`__DATA_DIR__(${key})`);
    }

    let keyData = {
        'arguments': args,
        'endpoint': endpoint,
        'files': files,
    };
    let key = JSON.stringify(keyData);

    let responseContent = testData[key];
    if (!responseContent) {
        console.error(keyData);
        throw new Error(`Unknown API key: '${key}'.`);
    }

    let responseData = {
        'id': '00000000-0000-0000-0000-000000000000',
        'locator': '',
        'server-version': '0.0.0',
        'start-timestamp': Util.getTimestampNow(),
        'end-timestamp': Util.getTimestampNow(),
        'status': 200,
        'success': true,
        'message': responseContent.message ?? '',
        'content': responseContent.output,
    };

    return Promise.resolve({
        json: function() {
            return Promise.resolve(responseData);
        },
        text: function() {
            return Promise.resolve(responseData.message);
        },
    });
}

// Load the site's HTML into the DOM.
function loadHTML() {
    const html = fs.readFileSync(path.join('site', 'index.html'), 'utf8');
    document.documentElement.innerHTML = html;
}

// Load the test data from ./api_test_data.json.
function loadAPITestData() {
    const text = fs.readFileSync(path.join('site', 'js', 'modules', 'autograder', 'test', 'api_test_data.json'), 'utf8');
    testData = JSON.parse(text);

    for (const [key, value] of Object.entries(testData)) {
        let keyData = JSON.parse(key);
        if (keyData.endpoint === 'users/tokens/create') {
            let userEmail = keyData['arguments']['user-email'];
            let displayName = userEmail.split('@')[0];

            cleanTokensCreateTestData(key, displayName, value);
            createTokensDeleteTestData(userEmail, displayName, value.output['token-cleartext']);
            createTokensDeleteTestData(userEmail, displayName);
        }
    }
}

// Update the users/tokens/create testdata to return a token that matches the test user's name.
// This token is hashed and used as part of the lookup key for subsequent API calls.
// The test data expects the user's pass to match their name (not a token).
function cleanTokensCreateTestData(key, displayName, value) {
    value.output['token-cleartext'] = displayName;
    testData[key] = value;
}

// Generate test data for users/tokens/delete for the user and cleartext combination.
function createTokensDeleteTestData(userEmail, cleartext, tokenId = '<TOKEN_ID>') {
    let endpoint = 'users/tokens/delete';
    let args = {
        'token-id': tokenId,
        'user-email': userEmail,
        'user-pass': Util.sha256(cleartext),
    };

    let keyData = {
        'arguments': args,
        'endpoint': endpoint,
        'files': [],
    };
    let key = JSON.stringify(keyData);

    testData[key] = {
        'endpoint': endpoint,
        'module_name': 'autograder.api.users.tokens.delete',
        'arguments': {
            'token-id': tokenId,
        },
        'output': {
            'found': true,
        },
    };
}

// Load the default testing identity.
function loadAPITestIdentity() {
    Core.setCredentials(DEFAULT_ID_EMAIL, '<TOKEN_ID>', DEFAULT_ID_CLEARTEXT);
}

beforeAll(function() {
    loadAPITestData();
    loadAPITestIdentity();
    loadHTML();
});
