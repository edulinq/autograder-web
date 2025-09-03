import * as Autograder from '../autograder/base.js';

import * as Assignment from './assignment.js';
import * as Event from './event.js';
import * as Icon from './icon.js';
import * as Routing from './routing.js';
import * as Util from './util.js';

const API_OUTPUT_SWITCHER_JSON = 'JSON';
const API_OUTPUT_SWITCHER_TABLE = 'Table';
const API_OUTPUT_SWITCHER_TEXT = 'Text';

const API_OUTPUT_SWITCHER_MODES = {
    [API_OUTPUT_SWITCHER_JSON]: apiOutputJSON,
    [API_OUTPUT_SWITCHER_TABLE]: apiOutputTable,
    [API_OUTPUT_SWITCHER_TEXT]: apiOutputText,
};

// Options to control how to values that come from the API are rendered.
class APIValueRenderOptions {
    constructor({
            keyDisplayTransformer = Util.titleCase,
            valueDisplayTransformer = apiValueToText,
            skipKeys = [],
            keyCompare = Util.caseInsensitiveStringCompare,
            keyOrdering = [],
            keyValueDelim = ': ',
            rowDelim = "\n",
            entityDelim = "\n",
            indent = '    ',
            initialIndentLevel = 0,
            finalTrim = true,
            } = {}) {
        // How to transform keys for display purposes.
        // Keys are transformed after any comparisons, e.g., sorting.
        this.keyDisplayTransformer = keyDisplayTransformer;

        // How to transform values for display purposes.
        this.valueDisplayTransformer = valueDisplayTransformer;

        // When the rendered value is an object, skip rendering these keys.
        // Keys to skip are checked before any transformations are applied.
        this.skipKeys = skipKeys;

        // A function to compare keys.
        // Keys are compared before any transformations.
        this.keyCompare = keyCompare;

        // The ordering the keys should appear.
        // Keys that exist here will always appear before non-extant keys.
        // May be left empty to just let the key comparison handle all sorting.
        this.keyOrdering = keyOrdering;

        // A delimiter to use between keys and values.
        this.keyValueDelim = keyValueDelim;

        // A delimiter to use between rows.
        this.rowDelim = rowDelim;

        // A delimiter to use between entities.
        this.entityDelim = entityDelim;

        // The spacing to use for a single level of indentation.
        this.indent = indent;

        // The initial indentation level to use.
        this.initialIndentLevel = initialIndentLevel;

        // Trim extra whitespace after processing.
        this.finalTrim = finalTrim;
    }

    // Get an indent level, but treat negative levels as zero.
    getIndent(level) {
        return this.indent.repeat(Math.max(0, level));
    }

    // Sort the given keys in-place according to the given ordering and comparison.
    // The keys should not have been transformed prior to this call.
    sortKeys(keys) {
        let options = this;
        let comparison = function(a, b) {
            return Util.orderingCompare(a, b, options.keyOrdering, options.keyCompare);
        };
        keys.sort(comparison);
    }
}

class Card {
    constructor(
        type = 'unknown', text = '', link = '#',
        {
            minServerRole = Autograder.Users.SERVER_ROLE_UNKNOWN,
            minCourseRole = Autograder.Users.COURSE_ROLE_UNKNOWN,
            courseId = undefined,
        } = {}) {
        // An optional card type that is added to the HTML class list.
        this.type = type;

        // The display test of the card.
        this.text = text;

        // Routes to this link when the card is clicked.
        // All routes must start with a '#'.
        this.link = link;

        // The minimum server role a user needs to have to view this card.
        this.minServerRole = minServerRole;

        // The minimum course role a user needs to have to view this card.
        this.minCourseRole = minCourseRole;

        // The course that is used for the course role check.
        this.courseId = courseId;

        this.validate();
    }

    validate() {
        if (!this.link.startsWith('#')) {
            console.error(`A card link must start with a '#': '${this.link}'.`);
        }

        if (!Number.isInteger(this.minServerRole)) {
            console.error('A card must have an integer value for the min server role.');
        }

        if (!Number.isInteger(this.minCourseRole)) {
            console.error('A card must have an integer value for the min course role.');
        }
    }

    toHTML() {
        return `
            <div class='card card-${this.type} tertiary-color drop-shadow'>
                <a href='${this.link}' alt='${this.text}'>
                    <span>${this.text}</span>
                </a>
            </div>
        `;
    }

    // Signals the card should be hidden based on the context user's roles.
    isHidden(context) {
        const userServerRole = Autograder.Users.getServerRoleValue(context?.user?.role);

        // Never hide cards from server admins or above.
        if (userServerRole >= Autograder.Users.SERVER_ROLE_ADMIN) {
            return false;
        }

        if (this.minServerRole > userServerRole) {
            return true;
        }

        const course = context?.user?.courses[this.courseId];
        const userCourseRole = Autograder.Users.getCourseRoleValue(course?.role);

        if (this.minCourseRole > userCourseRole) {
            return true;
        }

        return false;
    }
}

// Render some cards to html.
// This function takes ownership of the list of cards.
function cards(context, cards) {
    cards.sort(function(a, b) {
        return Util.caseInsensitiveStringCompare(a.text, b.text);
    });

    let html = [];
    for (const card of cards) {
        if (card.isHidden(context)) {
            continue;
        }

        html.push(card.toHTML());
    }

    if (html.length === 0) {
        return undefined;
    }

    return `
        <div class='cards-area'>
            ${html.join("\n")}
        </div>
    `;
}

// Render a list of card sections to html.
// A card section is [section name, a list of cards].
function makeCardSections(context, sectionsName, sections, iconName = Icon.ICON_NAME_DEFAULT) {
    let cardSections = [];
    for (const section of sections) {
        cardSections.push(makeCardSection(context, section[0], section[1]));
    }

    let headerClasses = 'secondary-color drop-shadow';
    if (sectionsName === '') {
        headerClasses += ' hidden';
    }

    return `
        <div class='card-header ${headerClasses}'>
            ${Icon.getIconHTML(iconName)}
            <div class='card-title'>
                <h1>${sectionsName}</h1>
            </div>
        </div>
        <div class='card-sections'>
            ${cardSections.join("\n")}
        </div>
    `;
}

// Render a section name and some cards to html.
function makeCardSection(context, sectionName, sectionCards) {
    const cardHTML = cards(context, sectionCards);
    if (!cardHTML) {
        return '';
    }

    return `
        <div class='card-section secondary-color drop-shadow'>
            <h2>${sectionName}</h2>
            ${cardHTML}
        </div>
    `;
}

// Render a page that follows a standard template.
// The template includes a control area, header, description, input area, submission button, and a results area.
// The onSubmitFunc must do the following:
//   - Accept four parameters (params, context, container, inputParams).
//   - Return a promise that resolves to the content to display in the results area.
// The page inputs expects a list of Input.Fields, see ./input.js for more information.
// The postResultsFunc (if provided) is called after the results are rendered,
// it will be called with (params, context, container, inputParams, resultHTML).
function makePage(
        params, context, container, onSubmitFunc,
        {
            className = '',
            controlAreaHTML = '',
            header = '',
            description = '',
            inputs = [],
            buttonName = 'Submit',
            // Click the submit button as soon as the page is created.
            submitOnCreation = false,
            iconName = Icon.ICON_NAME_DEFAULT,
            postResultsFunc = undefined,
        }) {
    if ((controlAreaHTML) && (controlAreaHTML != '')) {
        controlAreaHTML = `
            <div class="template-control-area secondary-color link-color drop-shadow">
                ${controlAreaHTML}
            </div>
        `;
    }

    let headerHTML = '';
    if ((header) && (header != '')) {
        headerHTML = `
            <div class="template-header">
                <h2>${header}</h2>
            </div>
        `;
    }

    let descriptionHTML = '';
    if ((description) && (description != '')) {
        descriptionHTML = `
            <div class="template-description secondary-color-low link-color-low">
                <p>
                    ${description}
                </p>
            </div>
        `;
    }

    let infoHTML = '';
    if ((headerHTML != '') || (descriptionHTML != '')) {
        infoHTML = `
            <div class='page-information secondary-color drop-shadow'>
                ${Icon.getIconHTML(iconName)}
                <div class='page-text'>
                    ${headerHTML}
                    ${descriptionHTML}
                </div>
            </div>
        `;
    }

    let inputFieldsHTML = '';
    if ((inputs) && (inputs.length > 0)) {
        let inputHTML = '';
        for (const input of inputs) {
            inputHTML += input.toHTML();
        }

        inputFieldsHTML = `
            <div class="user-input-fields secondary-color drop-shadow">
                <fieldset>
                    ${inputHTML}
                </fieldset>
            </div>
        `;
    }

    let buttonHTML = '';
    if (onSubmitFunc) {
        buttonHTML = `<button class="template-button secondary-accent-color">${buttonName}</button>`;
    }

    let inputSectionHTML = `
        <div class="input-area">
            ${inputFieldsHTML}
            ${buttonHTML}
        </div>
    `;

    container.innerHTML = `
        <div class="template-page ${className}">
            <div class="template-content">
                ${controlAreaHTML}
                ${infoHTML}
                ${inputSectionHTML}
                <div class="results-area"></div>
            </div>
        </div>
    `;

    let button = container.querySelector(".input-area .template-button");
    button?.addEventListener("click", function(event) {
        submitInputs(params, context, container, inputs, onSubmitFunc, postResultsFunc);
    });

    container.querySelector(".user-input-fields fieldset")?.addEventListener("keydown", function(event) {
        if ((event.key != "Enter") || (event.target.tagName === "TEXTAREA")) {
            return;
        }

        submitInputs(params, context, container, inputs, onSubmitFunc, postResultsFunc);
    });

    container.querySelectorAll(".user-input-fields fieldset input")?.forEach(function(input) {
        input.addEventListener("blur", function(event) {
            input.classList.add("touched");

            let currentPageInput = undefined;
            for (const pageInput of inputs) {
                if (pageInput.name === input.name) {
                    currentPageInput = pageInput;
                    break;
                }
            }

            // Validate the input after the field loses focus.
            if (currentPageInput) {
                try {
                    currentPageInput.getFieldInstance(container);
                } catch (error) {
                    console.error(error);
                    return;
                }
            }
        });
    });

    if (submitOnCreation) {
        button?.click();
    }
}

function submitInputs(params, context, container, inputs, onSubmitFunc, postResultsFunc) {
    // If the button is blocked, the server is processing the previous request.
    let button = container.querySelector(".input-area .template-button");
    if (button?.disabled) {
        return;
    }

    let resultsArea = container.querySelector(".results-area");
    resultsArea.innerHTML = `<div class="result secondary-color drop-shadow"></div>`;
    let resultsElement = resultsArea.firstChild;

    Routing.loadingStart(resultsElement, false);

    let inputParams = {};
    let errorMessages = [];

    for (const input of inputs) {
        let result = undefined;
        try {
            result = input.getFieldInstance(container);
        } catch (error) {
            errorMessages.push(error.message);
            continue;
        }

        let value = result.getFieldValue();
        if ((value) && (value != "")) {
            inputParams[result.getFieldName()] = value;
        }
    }

    if (errorMessages.length > 0) {
        resultsArea.innerHTML = `
            <div class="result secondary-color drop-shadow">
                <p>The request was not submitted to the autograder due to the following errors:</p>
                ${errorMessages.join("\n")}
            </div>
        `;
        return;
    }

    if (button) {
        button.disabled = true;
    }

    onSubmitFunc(params, context, resultsElement, inputParams)
        .then(function(result) {
            if (result != undefined) {
                resultsElement.innerHTML = result;
            }

            if (postResultsFunc) {
                postResultsFunc(params, context, container, inputParams, result);
            }
        })
        .catch(function(message) {
            console.error(message);

            if (message != undefined) {
                resultsElement.innerHTML = message;
            }
        })
        .finally(function() {
            if (button) {
                button.disabled = false;
            }

            Event.dispatchEvent(Event.EVENT_TYPE_TEMPLATE_RESULT_COMPLETE);
        })
    ;
}

function setTabTitle(tabTitle) {
    document.title = `${tabTitle} :: Autograder`;
}

function submissionHistory(course, assignment, history) {
    let rowsHTML = [];
    for (const record of history.toReversed()) {
        let submissionTime = Util.timestampToPretty(record['grading_start_time']);

        let params = {
            [Routing.PARAM_COURSE]: course.id,
            [Routing.PARAM_ASSIGNMENT]: assignment.id,
            [Routing.PARAM_SUBMISSION]: record['short-id'],
        };
        let peekLink = Routing.formHashPath(Routing.PATH_PEEK, params);

        rowsHTML.push(`
            <tr>
                <td><a href='${peekLink}'>${record['short-id']}</a></td>
                <td>${record['score']}</td>
                <td>${record['max_points']}</td>
                <td>${submissionTime}</td>
                <td>${record['message']}</td>
            </tr>
        `);
    }

    let html = `
        <div class='submission-history-area'>
            <h2>${assignment.name}: History</h2>
            <div class='submission-history'>
                <h3>History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Short ID</th>
                            <th>Score</th>
                            <th>Max Points</th>
                            <th>Submission Time</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML.join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return html;
}

function submission(course, assignment, submission) {
    let submissionTime = Util.timestampToPretty(submission['grading_start_time']);

    let messageHTML = '';
    if (submission.message) {
        messageHTML = makePairedTableRow('Message', submission['message'], 'message');
    }

    let courseLink = Routing.formHashPath(Routing.PATH_COURSE,
            {[Routing.PARAM_COURSE]: course.id});
    let assignmentLink = Routing.formHashPath(Routing.PATH_ASSIGNMENT,
            {[Routing.PARAM_COURSE]: course.id, [Routing.PARAM_ASSIGNMENT]: assignment.id});

    let html = `
        <div class='submission'>
            <h2>${assignment.name}: Submission ${submission['short-id']}</h2>
            <div class='submission-metadata'>
                <h3>Summary</h3>
                <table>
                    <tbody>
                        ${makePairedTableRow('Short Submission ID', submission['short-id'], 'short-id')}
                        ${makePairedTableRow('Full Submission ID', submission['id'], 'id')}
                        ${makePairedTableRow('User', submission['user'], 'user')}
                        ${makePairedTableRow('Course ID', `<a href='${courseLink}'>${submission['course-id']}</a>`, 'course-id')}
                        ${makePairedTableRow('Assignment ID', `<a href='${assignmentLink}'>${submission['assignment-id']}</a>`, 'assignment-id')}
                        ${makePairedTableRow('Submission Time', submissionTime, 'submission-time')}
                        ${makePairedTableRow('Max Points', submission['max_points'], 'max-points')}
                        ${makePairedTableRow('Score', submission['score'], 'score')}
                        ${messageHTML}
                    </tbody>
                </table>
            </div>
            <div class='submission-questions-area'>
                <h3>Questions</h3>
                ${submissionQuestions(submission.questions)}
            </div>
        </div>
    `;

    return html;
}

function submissionQuestions(questions) {
    let questionsHTML = [
        `<div class='submission-questions'>`,
    ];

    for (const [i, question] of questions.entries()) {
        let messageHTML = '';
        if (question.message) {
            messageHTML = makePairedTableRow('Message', question['message'], 'message');
        }

        questionsHTML.push(`
            <div class='submission-question'>
                <h4 data-index='${i}' data-name='${question['name']}'>
                    ${question['name']}
                </h4>
                <table data-index='${i}' data-name='${question['name']}'>
                    <tbody>
                        ${makePairedTableRow('Name', question['name'], 'name')}
                        ${makePairedTableRow('Max Points', question['max_points'], 'max-points')}
                        ${makePairedTableRow('Score', question['score'], 'score')}
                        ${messageHTML}
                    </tbody>
                </table>
            </div>
        `);
    }

    questions.push('</div>');

    return questionsHTML.join('');
}

function makePairedTableRow(label, value, name = undefined) {
    let nameHTML = '';
    if (name) {
        nameHTML = `data-name='${name}'`;
    }

    return `
        <tr ${nameHTML}>
            <th class='label'>${label}</th>
            <td class='value'><span>${value}</span></td>
        </tr>
    `;
}

function autograderError(message) {
    let result = '<p>The request to the autograder did not complete successfully.</p>';

    if (message) {
        result += `
            <span>Message from the autograder:<span>
            <p>${message}</p>
        `;
    }

    return result;
}

// Convert a value (of any type) into a text representation.
// These values are generally understood to have come from the autograder API,
// and may have specific semantics.
// The text/output representation is generally meant for human consumption and to be the "pretty" alternative,
// while still be general.
function apiValueToText(value, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    if (value === undefined) {
        return '< null >';
    }

    if (value === null) {
        return '< null >';
    }

    switch (typeof(value)) {
        case 'object':
            // Object or Array
            if (Array.isArray(value)) {
                if (value.length == 0) {
                    return '';
                }

                let content = apiArrayToText(value, indentLevel + 1, renderOptions);
                return renderOptions.rowDelim + content;
            } else {
                if (Object.keys(value).length == 0) {
                    return '';
                }

                let content = apiObjectToText(value, indentLevel + 1, renderOptions);
                return renderOptions.rowDelim + content;
            }
        case 'string':
            return value;
        default:
            return JSON.stringify(value);
    }
}

// Convert a value (of any type) into a flat text representation usually used for a table.
function apiValueToTableValue(value, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    if (value === undefined) {
        return '';
    }

    if (value === null) {
        return '';
    }

    switch (typeof(value)) {
        case 'string':
            return value;
        default:
            return JSON.stringify(value);
    }
}

// Convert a JS object (from the API) into a text representation.
// See apiValueToText().
function apiObjectToText(object, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    let keys = Object.keys(object);
    renderOptions.sortKeys(keys);

    let rows = [];
    for (const key of keys) {
        if (renderOptions.skipKeys.includes(key)) {
            continue;
        }

        let displayKey = key;
        if (renderOptions.keyDisplayTransformer) {
            displayKey = renderOptions.keyDisplayTransformer(key);
        }

        let displayValue = object[key];
        if (renderOptions.valueDisplayTransformer) {
            displayValue = renderOptions.valueDisplayTransformer(object[key], indentLevel, renderOptions);
        }

        let row = [
            renderOptions.getIndent(indentLevel),
            displayKey,
            renderOptions.keyValueDelim,
            displayValue,
        ];
        rows.push(row.join(''));
    }

    return rows.join(renderOptions.rowDelim);
}

// Convert a JS array (from the API) into a text representation.
// See apiValueToText().
function apiArrayToText(items, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    let rows = [];
    for (const item of items) {
        let displayValue = item;
        if (renderOptions.valueDisplayTransformer) {
            displayValue = renderOptions.valueDisplayTransformer(item, indentLevel, renderOptions);
        }

        let row = [
            renderOptions.getIndent(indentLevel),
            displayValue,
        ];
        rows.push(row.join(''));
    }

    return rows.join(renderOptions.entityDelim);
}

// Convert a JS array (from the API) into a table representation.
// See apiValueToText().
// The array must be populated with objects (the keys of which will become the columns).
function apiArrayToTable(items, renderOptions = new APIValueRenderOptions()) {
    if (items.length <= 0) {
        return '<p>No Records</p>';
    }

    // Collect keys from all the list items.
    let keys = new Set();
    for (const item of items) {
        keys = keys.union(new Set(Object.keys(item)));
    }

    // Sort the keys.
    keys = Array.from(keys);
    renderOptions.sortKeys(keys);

    // Transform keys.
    let displayKeys = keys;
    if (renderOptions.keyDisplayTransformer) {
        displayKeys = keys.map(renderOptions.keyDisplayTransformer);
    }

    // Transform values.
    let rows = [];
    for (const item of items) {
        let row = [];
        for (const key of keys) {
            row.push(apiValueToTableValue(item[key]));
        }

        rows.push(row);
    }

    return tableFromLists(displayKeys, rows);
}

// Create a table using an array of arrays.
// Each header is a string.
// Each row is an array of strings.
// A list of HTML classes may be added to aid styling.
function tableFromLists(headers, rows, classes = []) {
    let tableHead = headers.map((label) => (`<th>${label}</th>`));
    let tableBody = rows.map(function(row) {
            return `<tr>${row.map((value) => (`<td>${value}</td>`)).join('')}</tr>`;
        })
    ;

    return `
        <table class='standard-table ${classes.join(' ')}'>
            <thead>
                <tr>
                    ${tableHead.join('')}
                </tr>
            </thead>
            <tbody>
                ${tableBody.join('')}
            </tbody>
        </table>
    `;
}

// Create a table using array of dictionaries.
// Each row is represented as a dictionary.
// Each header is represented as an array,
// ex. ["key", "displayValue"],
// where keys match the keys in the row dictionaries.
// A list of HTML classes may be added to aid styling.
function tableFromDictionaries(headers, rows, classes = []) {
    let keys = headers.map((label) => (label[0]));
    let tableHead = headers.map((label) => (label[1]));

    let tableBody = rows.map(function(row) {
        let items = [];
        keys.forEach(function(key) {
            items.push(row[key] ?? '');
        });

        return items;
    });

    return tableFromLists(tableHead, tableBody, classes);
}

function codeBlockJSON(json) {
    return `<pre><code class="code code-block" data-lang="json">${Util.displayJSON(json)}</code></pre>`;
}

// Render an area that can switch between rendering an object in different output "modes".
function apiOutputSwitcher(value, container, {
        modes = [API_OUTPUT_SWITCHER_TEXT, API_OUTPUT_SWITCHER_JSON],
        renderOptions = new APIValueRenderOptions()
        } = {}) {
    if (modes.length == 0) {
        throw new Error("No output modes provided.");
    }

    let html = `
        <div class='output-switcher'>
            <div class='controls'>
            </div>
            <hr />
            <div class='output'>
            </div>
        <div>
    `;

    container.innerHTML = html;

    let controlArea = container.querySelector('.controls');
    let outputArea = container.querySelector('.output');

    let prerendered = false;
    for (const mode of modes) {
        let outputFunc = API_OUTPUT_SWITCHER_MODES[mode];
        if (!outputFunc) {
            throw new Error(`Unknown output mode: '${mode}'.`);
        }

        let button = document.createElement('button');
        button.classList.add(mode.toLowerCase());
        button.setAttribute('data-mode', mode);
        button.innerHTML = `Show as ${mode}`;
        button.onclick = function(event) {
            outputFunc(value, outputArea, renderOptions);
        };

        controlArea.appendChild(button);

        // Render the first mode listed.
        if (!prerendered) {
            outputFunc(value, outputArea, renderOptions);
            prerendered = true;
        }
    }
}

// Render an API output as JSON.
function apiOutputJSON(value, container, renderOptions) {
    container.innerHTML = codeBlockJSON(value);
}

// Render an API output as (pretty) text.
function apiOutputText(value, container, renderOptions) {
    let text = apiArrayToText(value, renderOptions.initialIndentLevel, renderOptions);
    if (renderOptions.finalTrim) {
        text = text.trim();
    }

    container.innerHTML = `<pre>${text}</pre>`;
}

// Render an API output as a table.
function apiOutputTable(value, container, renderOptions) {
    container.innerHTML = apiArrayToTable(value, renderOptions);
}

export {
    API_OUTPUT_SWITCHER_JSON,
    API_OUTPUT_SWITCHER_TABLE,
    API_OUTPUT_SWITCHER_TEXT,

    APIValueRenderOptions,
    Card,

    apiOutputSwitcher,
    autograderError,
    cards,
    codeBlockJSON,
    makeCardSection,
    makeCardSections,
    makePage,
    setTabTitle,
    submission,
    submissionHistory,
    tableFromDictionaries,
    tableFromLists,
};
