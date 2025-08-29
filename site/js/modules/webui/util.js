const MSECS_PER_SECS = 1000
const MSECS_PER_MINS = MSECS_PER_SECS * 60
const MSECS_PER_HOURS = MSECS_PER_MINS * 60
const MSECS_PER_DAYS = MSECS_PER_HOURS * 24

function caseInsensitiveStringCompare(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function timestampToPretty(timestamp) {
    return (new Date(timestamp)).toLocaleString();
}

// Find timestamps in a message and replace them with the pretty version.
function messageTimestampsToPretty(message) {
    return message.replace(/<timestamp:\s*(-?\d+)\s*>/g, function(match, timestamp) {
        return timestampToPretty(parseInt(timestamp));
    });
}

export {
    MSECS_PER_SECS,
    MSECS_PER_MINS,
    MSECS_PER_HOURS,
    MSECS_PER_DAYS,

    caseInsensitiveStringCompare,
    messageTimestampsToPretty,
    timestampToPretty,
}
