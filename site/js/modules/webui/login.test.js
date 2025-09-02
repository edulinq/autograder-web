import * as TestUtil from './test/util.js';

test("Login Page", async function() {
    const testCases = [
        { displayName: "course-admin" },
        { displayName: "course-grader" },
        { displayName: "course-other" },
        { displayName: "course-owner" },
        { displayName: "course-student" },

        { displayName: "server-admin" },
        { displayName: "server-creator" },
        { displayName: "server-owner" },
        { displayName: "server-user" },
    ];

    for (const testCase of testCases) {
        await testLoginUser(testCase.displayName);
    }
});

async function testLoginUser(displayName) {
    await TestUtil.loginUser(displayName);

    expect(document.title).toContain("Home");

    let currentUserSpan = document.querySelector('.current-user span');
    expect(currentUserSpan.textContent).toContain(displayName);
}
