import * as Util from './util.js';

describe("Util.caseInsensitiveStringCompare() base", function() {
    // [[a, b, expected], ...]
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

    test.each(testCases)("'%s' vs '%s'", function(a, b, expected) {
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

describe("Util.cleanText() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Empty
        ['', ''],

        // Whitespace
        [' ', ''],
        [' \t\n\r ', ''],
        [' a', 'a'],
        ['a\n', 'a'],
        [' a\t', 'a'],

        // Word Breaks
        ['a-b', 'a b'],
        ['a_b', 'a b'],
        ['a _b', 'a b'],
        ['a_ b', 'a b'],
        ['a _ b', 'a b'],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Util.cleanText(input)).toBe(expected);
    });
});

describe("Util.titleCase() base", function() {
    // [[input, clean?, expected], ...]
    const testCases = [
        // Empty
        ['', true, ''],

        // Single Word
        ['a', true, 'A'],
        ['A', true, 'A'],
        ['ab', true, 'Ab'],
        ['AB', true, 'Ab'],

        // Multiple Words
        ['a b', true, 'A B'],
        ['A B', true, 'A B'],
        ['ab ab', true, 'Ab Ab'],
        ['AB AB', true, 'Ab Ab'],

        // Word Breaks
        ['a-b', true, 'A B'],
        ['a_b', true, 'A B'],
        ['a \t b', true, 'A B'],

        // Non-Word Breaks
        ["a'b", true, "A'b"],

        // No Clean
        ['a-b', false, 'A-b'],
    ];

    test.each(testCases)("'%s', %s", function(input, clean, expected) {
        expect(Util.titleCase(input, clean)).toBe(expected);
    });
});

describe("Util.isObject() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Non-Objetcs
        [undefined, false],
        [null, false],
        ['', false],
        ['a', false],
        [1, false],

        // Arrays
        [[], false],
        [[0], false],

        // Objects
        [{}, true],
        [{a: 1}, true],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Util.isObject(input)).toBe(expected);
    });
});

describe("Util.orderingCompare() base", function() {
    // [[a, b, ordering, fallback, expected], ...]
    const testCases = [
        // All In Ordering
        ['a', 'a', ['A', 'a'], Util.stringCompare, 0],
        ['a', 'A', ['A', 'a'], Util.stringCompare, 1],
        ['A', 'a', ['A', 'a'], Util.stringCompare, -1],

        // One In Ordering
        ['a', 'A', ['a'], Util.stringCompare, -1],
        ['A', 'a', ['a'], Util.stringCompare, 1],

        // No Ordering, Case Sensitive
        ['a', 'a', [], Util.stringCompare, 0],
        ['a', 'A', [], Util.stringCompare, -1],
        ['A', 'a', [], Util.stringCompare, 1],

        // No Ordering, Case Insensitive
        ['a', 'a', [], Util.caseInsensitiveStringCompare, 0],
        ['a', 'A', [], Util.caseInsensitiveStringCompare, 0],
        ['A', 'a', [], Util.caseInsensitiveStringCompare, 0],
    ];

    test.each(testCases)("'%s' vs '%s' -- %s", function(a, b, ordering, fallback, expected) {
        expect(Util.orderingCompare(a, b, ordering, fallback)).toBe(expected);
    });
});
