import * as Event from './event.js';

const WORD_BREAK_RE = /[\-_]+/
const JSON_INDENT = 4;

let _testing = false;

function setTesting(value) {
    _testing = value;
}

// Generate a "pretty" JSON string representation meant for user display.
function displayJSON(value) {
    return JSON.stringify(value, null, JSON_INDENT);
}

function stringCompare(a, b) {
    return a.localeCompare(b);
}

function caseInsensitiveStringCompare(a, b) {
    return a.localeCompare(b, undefined, {sensitivity: 'base'});
}

// Compare two values based on where they appear in a given list.
// In one item does not appear in the list, than it will appear latter.
// If neither appear in the list, then fallback to the given comparison function.
function orderingCompare(a, b, ordering = [], fallback = stringCompare) {
    let aIndex = ordering.indexOf(a);
    let bIndex = ordering.indexOf(b);

    if ((aIndex === -1) && (bIndex === -1)) {
        return fallback(a, b);
    }

    if (bIndex === -1) {
        return -1;
    }

    if (aIndex === -1) {
        return 1;
    }

    if (aIndex === bIndex) {
        return 0;
    }

    if (aIndex < bIndex) {
        return -1;
    }

    return 1;
}

function timestampToPretty(timestamp) {
    return (new Date(timestamp)).toLocaleString();
}

// Trigger an in-memory file to be downloaded by the user.
function downloadFile(file) {
    let eventDetails = {
        'filename': file.name,
        'testing': _testing,
    };

    if (_testing) {
        Event.dispatchEvent(Event.EVENT_TYPE_DOWNLOAD_FILE_COMPLETE, eventDetails);
        return false;
    }

    const link = document.createElement('a');
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    link.click();

    // Clean up by revoking the object URL.
    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 10);

    Event.dispatchEvent(Event.EVENT_TYPE_DOWNLOAD_FILE_COMPLETE, eventDetails);
    return true;
}

// Perform basic cleaning operations on a string destined for display.
// WORD_BREAK_RE will be used to determine word breaks and converted to space.
function cleanText(text) {
    if (!text) {
        return '';
    }

    // Replace word breaks.
    text = text.replace(WORD_BREAK_RE, ' ');

    // Replace any contiguous whitespace with a single space.
    text = text.replace(/\s+/, ' ');

    // Trim.
    text = text.trim();

    return text;
}

// Title case a string (with optional cleaning).
// Words are tokenized based on whitespace (not regex word boundaries),
// and rejoined with a single space.
function titleCase(text, clean = true) {
    if (!text) {
        return '';
    }

    if (clean) {
        text = cleanText(text);
    }

    return text.toLowerCase().split(/\s+/).map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
}

// Check if a value is a JS object (and not an Array).
function isObject(value) {
    return (((typeof value) === "object") && !Array.isArray(value) && (value !== null));
}

export {
    caseInsensitiveStringCompare,
    cleanText,
    displayJSON,
    downloadFile,
    isObject,
    orderingCompare,
    setTesting,
    timestampToPretty,
    titleCase,
}
