import * as Util from './util.js'

test("caseInsensitiveStringCompare base", function() {
    const testCases = [
        ["A", "A", 0],
        ["a", "a", 0],
        ["A", "a", 0],
        ["a", "A", 0],

        ["A", "B", -1],
        ["a", "b", -1],
        ["A", "b", -1],
        ["a", "B", -1],

        ["B", "A", 1],
        ["b", "a", 1],
        ["B", "a", 1],
        ["b", "A", 1],
    ];

    testCases.forEach(function([a, b, expected]) {
        expect(Util.caseInsensitiveStringCompare(a, b)).toBe(expected);
    });
});

describe("Util.timestampToPretty() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Unix Epoch
        [0, '12/31/1969, 4:00:00 PM'],

        // After Unix Epoch
        [Util.MSECS_PER_SECS, '12/31/1969, 4:00:01 PM'],
        [Util.MSECS_PER_MINS, '12/31/1969, 4:01:00 PM'],
        [Util.MSECS_PER_HOURS, '12/31/1969, 5:00:00 PM'],
        [Util.MSECS_PER_DAYS, '1/1/1970, 4:00:00 PM'],

        // Before Unix Epoch
        [-1 * Util.MSECS_PER_SECS, '12/31/1969, 3:59:59 PM'],
        [-1 * Util.MSECS_PER_MINS, '12/31/1969, 3:59:00 PM'],
        [-1 * Util.MSECS_PER_HOURS, '12/31/1969, 3:00:00 PM'],
        [-1 * Util.MSECS_PER_DAYS, '12/30/1969, 4:00:00 PM'],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Util.timestampToPretty(input)).toBe(expected);
    });
});

describe("Util.messageTimestampsToPretty() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // No Timestamps
        ['Do you know when the Unix Epoch occured?', 'Do you know when the Unix Epoch occured?'],

        // One Timestamp
        [`The Unix Epoch occured at '<timestamp:0>'.`, `The Unix Epoch occured at '12/31/1969, 4:00:00 PM'.`],

        // Multiple Timestamps
        [
            `That was after '<timestamp:${-1 * Util.MSECS_PER_DAYS}>' but before '<timestamp:${Util.MSECS_PER_DAYS}>'.`,
            `That was after '12/30/1969, 4:00:00 PM' but before '1/1/1970, 4:00:00 PM'.`,
        ],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Util.messageTimestampsToPretty(input)).toBe(expected);
    });
});
