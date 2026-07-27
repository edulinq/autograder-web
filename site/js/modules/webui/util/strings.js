const WORD_BREAK_RE = /[\-_]+/
const JSON_INDENT = 4;

function caseInsensitiveStringCompare(a, b) {
    return a.localeCompare(b, undefined, {sensitivity: 'base'});
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

// Generate a "pretty" JSON string representation meant for user display.
function displayJSON(value) {
    return JSON.stringify(value, null, JSON_INDENT);
}

// Escape a string for safe insertion into HTML.
function escapeHTML(str) {
    if (str === null || str === undefined) {
        return '';
    }
    return new Option(String(str)).innerHTML;
}

function stringCompare(a, b) {
    return a.localeCompare(b);
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

export {
    caseInsensitiveStringCompare,
    cleanText,
    displayJSON,
    escapeHTML,
    stringCompare,
    titleCase,
}
