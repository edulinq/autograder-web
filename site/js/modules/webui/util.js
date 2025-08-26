import * as Event from './event.js';

const WORD_BREAK_RE = /[\-_]+/

let _testing = false;

function setTesting(value) {
    _testing = value;
}

function caseInsensitiveStringCompare(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
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
    downloadFile,
    isObject,
    setTesting,
    timestampToPretty,
    titleCase,
}
