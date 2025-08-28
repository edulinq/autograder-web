function caseInsensitiveStringCompare(a, b) {
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function timestampToPretty(timestamp) {
    return (new Date(timestamp)).toLocaleString();
}

// Find timestamps in a message and replace them with the pretty version.
function messageTimestampsToPretty(message) {
    return message.replace(/<timestamp:(\d+)>/g, function(match, timestamp) {
        return timestampToPretty(parseInt(timestamp))
    });
}

export {
    caseInsensitiveStringCompare,
    messageTimestampsToPretty,
    timestampToPretty,
}
