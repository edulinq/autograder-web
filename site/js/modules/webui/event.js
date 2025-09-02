// A package to listen for custom events.
// An event listener listens for custom events with the same name as the listener to be dispatched.
// All custom events may provide additional details which will be stored in event.detail.
// To listen for a specific event within an event type, provide additional event details.
// Every key-value pair in the provided details must be matched in the event.detail information.
// To check for object equality, each value is compared via JSON.stringify().
// If the value cannot be stringified, basic equality (===) will be used for the comparison.
// Top-level keys will be sorted when stringified.

// Keyed on the listener ID with a reference to the event name and callback function.
const eventListeners = new Map();
const eventElement = document.createElement(`div`);

const EVENT_TYPE_DOWNLOAD_FILE_COMPLETE = 'autograder-download-file-end';
const EVENT_TYPE_ROUTING_COMPLETE = 'autograder-routing-end';
const EVENT_TYPE_TEMPLATE_RESULT_COMPLETE = 'autograder-template-result-end';

const DEFAULT_TIMEOUT_MS = 3000;

// Create an event with the given name and optional details.
function createEvent(eventName, details = {}) {
    return new CustomEvent(eventName, {
        detail: details,
    });
}

// Add an event listener with optional filtering.
// Details are used to match the event.detail data.
// All details must match the corresponding key in the event.detail to trigger the onEventFunc.
// See the file level comment for more information on detail matching semantics.
// Returns a cleanup function that removes the event listener.
function addEventListener(eventName, onEventFunc, details = undefined) {
    const onEventFuncWithFilter = function(event) {
        if (matchesFilter(event.detail, details)) {
            onEventFunc(event);
        }
    };

    eventElement.addEventListener(eventName, onEventFuncWithFilter);

    const listenerId = Symbol('listener');
    eventListeners.set(listenerId, {
        eventName,
        callback: onEventFuncWithFilter,
    });

    const cleanup = function() {
        eventElement.removeEventListener(eventName, onEventFuncWithFilter);
        eventListeners.delete(listenerId);
    };

    return cleanup;
}

// Dispatch an event with the given name and optional details.
function dispatchEvent(eventName, details = {}) {
    const customEvent = createEvent(eventName, details);
    eventElement.dispatchEvent(customEvent);
}

function matchesFilter(eventDetails, details) {
    if ((!details) || (Object.keys(details).length === 0)) {
        return true;
    }

    return Object.entries(details).every(function([key, value]) {
        try {
            let eventJSON = JSON.stringify(eventDetails[key], Object.keys(eventDetails[key]).sort());
            let valueJSON = JSON.stringify(value, Object.keys(value).sort());
            return (eventJSON === valueJSON);
        } catch(error) {
            // If the values cannot be stringified, default to basic equality.
            return eventDetails[key] === value;
        }
    });
}

// Cleanup all listeners from the event listeners map.
function removeAllListeners() {
    for (const listener of Object.values(eventListeners)) {
        eventElement.removeEventListener(listener.eventName, listener.onEventFuncWithFilter);
    }

    eventListeners.clear();
}

// Returns a promise that resolves when the target event occurs.
// The promise resolves when an event with a matching name and details is dispatched.
// If the timeout is specified, the promise rejects if the event is not found within the timeout.
function getEventPromise(eventName, details = undefined, timeout = DEFAULT_TIMEOUT_MS) {
    return new Promise(function(resolve, reject) {
        let timeoutId = undefined;

        const cleanup = addEventListener(eventName, function(event) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            resolve(event);
        }, details);

        if (timeout) {
            timeoutId = setTimeout(function() {
                cleanup();
                reject(new Error(`Timeout: Event '${eventName}' timed out after ${timeout}ms.`));
            }, timeout);
        }
    });
}

export {
    dispatchEvent,
    getEventPromise,
    removeAllListeners,

    EVENT_TYPE_DOWNLOAD_FILE_COMPLETE,
    EVENT_TYPE_ROUTING_COMPLETE,
    EVENT_TYPE_TEMPLATE_RESULT_COMPLETE,
};
