import * as Jest from '@jest/globals';
import * as Util from './util.js';

beforeAll(function() {
    // Save the original locale method.
    const realToLocaleString = Date.prototype.toLocaleString;

    // Force all Date locale formatting to be in UTC.
    Jest.jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(function(locale, options = {}) {
        return realToLocaleString.call(this, locale, {
            ...options,
            timeZone: 'UTC',
        });
    });
});

afterAll(function() {
    Jest.jest.restoreAllMocks();
});

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
        [0, '1/1/1970, 12:00:00 AM'],

        // After Unix Epoch
        [Util.MSECS_PER_SECS, '1/1/1970, 12:00:01 AM'],
        [Util.MSECS_PER_MINS, '1/1/1970, 12:01:00 AM'],
        [Util.MSECS_PER_HOURS, '1/1/1970, 1:00:00 AM'],
        [Util.MSECS_PER_DAYS, '1/2/1970, 12:00:00 AM'],

        // Before Unix Epoch
        [-1 * Util.MSECS_PER_SECS, '12/31/1969, 11:59:59 PM'],
        [-1 * Util.MSECS_PER_MINS, '12/31/1969, 11:59:00 PM'],
        [-1 * Util.MSECS_PER_HOURS, '12/31/1969, 11:00:00 PM'],
        [-1 * Util.MSECS_PER_DAYS, '12/31/1969, 12:00:00 AM'],
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
        [`The Unix Epoch occured at '<timestamp:0>'.`, `The Unix Epoch occured at '1/1/1970, 12:00:00 AM'.`],

        // Multiple Timestamps
        [
            `That was after '<timestamp:${-1 * Util.MSECS_PER_DAYS}>' but before '<timestamp:${Util.MSECS_PER_DAYS}>'.`,
            `That was after '12/31/1969, 12:00:00 AM' but before '1/2/1970, 12:00:00 AM'.`,
        ],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Util.messageTimestampsToPretty(input)).toBe(expected);
    });
});
