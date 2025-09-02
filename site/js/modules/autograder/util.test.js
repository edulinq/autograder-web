import * as Util from './util.js';

describe("Util.sha256() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Empty
        ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],

        // Basic
        ['a', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'],
        ['A', '559aead08264d5795d3909718cdd05abd49572e84fe55590eef31a88a08fdffd'],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Util.sha256(input)).toBe(expected);
    });
});

describe("Util.b64Decode() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Empty
        ['', ''],

        // Basic
        ['YQ==', 'a'],
    ];

    test.each(testCases)("'%s'", async function(input, expected) {
        let actualBlob = await Util.b64Decode(input);
        let actualText = await actualBlob.text();
        expect(actualText).toBe(expected);
    });
});

test("Util.autograderGradingResultToJSFile() base", async function() {
    const expectedBytes = 2207;
    const epsilonBytes = 5;

    // Key an API test case that has a grading result.
    const key = "{\"arguments\":{\"assignment-id\":\"hw0\",\"course-id\":\"COURSE101\",\"target-email\":\"course-student@test.edulinq.org\",\"user-email\":\"course-admin@test.edulinq.org\",\"user-pass\":\"c22755f48fa0ef601e8d57a3ba169eeda80e9b2d4eaecc2c2ca2ffc887722f7c\"},\"endpoint\":\"courses/assignments/submissions/fetch/user/attempt\",\"files\":[]}";

    let data = testData[key];
    expect(data).toBeDefined();

    let gradingResult = data['output']['grading-result'];
    expect(gradingResult).toBeDefined();

    // Ensure that the file is approximately the size we expect.
    // There may be slight variations depending on the OS and randomization.
    let file = await Util.autograderGradingResultToJSFile(gradingResult, 'test.zip');
    expect(file.__testing_blob_size).toBeGreaterThanOrEqual(expectedBytes - epsilonBytes);
    expect(file.__testing_blob_size).toBeLessThanOrEqual(expectedBytes + epsilonBytes);
});
