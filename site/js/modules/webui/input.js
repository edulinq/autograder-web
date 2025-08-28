const PATTERN_INT = /^int\d*$/;
const PATTERN_TARGET_USER = /^core\.Target((Course)|(Server))User$/;
const PATTERN_TARGET_SELF_OR = /^core\.Target((Course)|(Server))UserSelfOr[a-zA-Z]+$/;

const COURSE_USER_REFERENCE_LIST_FIELD_TYPE = '[]model.CourseUserReference';

const INPUT_TYPE_BOOL = 'bool';
const INPUT_TYPE_CHECKBOX = 'checkbox';
const INPUT_TYPE_EMAIL = 'email';
const INPUT_TYPE_FILE = 'file';
const INPUT_TYPE_INT = 'int';
const INPUT_TYPE_JSON = 'json';
const INPUT_TYPE_NUMBER = 'number';
const INPUT_TYPE_PASSWORD = 'password';
const INPUT_TYPE_SELECT = 'select';
const INPUT_TYPE_STRING = 'string';
const INPUT_TYPE_TEXT = 'text';
const INPUT_TYPE_TEXTAREA = 'textarea';

const TEST_FILES_KEY = '__test-files';

// The set of valid types for a FieldType.
const VALID_PARSED_TYPES = [
    INPUT_TYPE_CHECKBOX,
    INPUT_TYPE_EMAIL,
    INPUT_TYPE_FILE,
    INPUT_TYPE_JSON,
    INPUT_TYPE_NUMBER,
    INPUT_TYPE_PASSWORD,
    INPUT_TYPE_SELECT,
    INPUT_TYPE_TEXT,
    INPUT_TYPE_TEXTAREA,
];

const standardTypes = [
    INPUT_TYPE_BOOL,
    INPUT_TYPE_STRING,
];

const standardTypePatterns = [
    PATTERN_INT,
];

// Returns whether a type is a standard type.
// Non-standard types are defaulted to JSON.
// The standard types that are currently supported can be found in the above constants.
function isStandardType(type) {
    if (standardTypes.includes(type)) {
        return true;
    }

    for (const pattern of standardTypePatterns) {
        if (pattern.test(type)) {
            return true;
        }
    }

    return false;
}

// A general representation of a user input field.
// The FieldType is responsible for generating and validating the HTML of a field.
class FieldType {
    #parsedType;

    constructor(
            context, name, displayName,
            {
                type = INPUT_TYPE_STRING, parsedType = undefined, required = false, placeholder = '',
                defaultValue = '', inputClasses = '', additionalAttributes = '', choices = [],
                labelBefore = true, extractInputFunc = undefined, inputValidationFunc = undefined,
            } = {}) {
        // The name of the field.
        this.name = name;

        // The display name that will be shown to the user.
        this.displayName = displayName;

        // The field type.
        // Non-standard types are parsed to JSON.
        // If a non-standard type cannot be parsed to JSON,
        // a validation error is raised.
        this.type = type;

        // Flags the field requires user input.
        this.required = required;

        // The placeholder text for the input.
        this.placeholder = placeholder;

        // The default value for the field.
        // Fields with a "select" type should provide the name of the value that is selected.
        this.defaultValue = defaultValue;

        // Optional classes that are attached to the input.
        this.inputClasses = inputClasses;

        // Any additional attributes to the input field.
        // If the field is required, the required attribute will be added automatically.
        this.additionalAttributes = additionalAttributes;

        // A list of choices for a dropdown.
        // Only used when the parsedType is INPUT_TYPE_SELECT.
        this.choices = choices;

        // Determines the position of the HTML label with respect to the input.
        this.labelBefore = labelBefore;

        // A custom function for extracting the value from an input.
        // If a default value extraction cannot be inferred, the value is parsed using JSON.
        this.extractInputFunc = extractInputFunc;

        // A custom input validation function.
        // The validity state of the input is checked before calling this custom validation function.
        this.inputValidationFunc = inputValidationFunc;

        this.#parsedType = parsedType;
        if (this.#parsedType == undefined) {
            this.inferFieldInformation(context);
        }

        this.validate();
    }

    validate() {
        if ((this.name == undefined) || (this.name == '')) {
            console.error(`Input field cannot have an empty name: '${JSON.stringify(this)}'.`);
        }

        if ((this.displayName == undefined) || (this.displayName == '')) {
            console.error(`Input field cannot have an empty display name: '${JSON.stringify(this)}'.`);
        }

        if ((this.#parsedType == undefined) || (this.#parsedType == '')) {
            console.error(`Input field cannot have an empty parsed type: '${JSON.stringify(this)}'.`);
        }

        if (!this.isValidType()) {
            console.error(`Input field contains an invalid parsed type: '${JSON.stringify(this.#parsedType)}'.`);
        }
    }

    isValidType() {
        if (VALID_PARSED_TYPES.includes(this.#parsedType)) {
            return true;
        }

        return false;
    }

    // Using the context and the type,
    // infer the input type and field information.
    // This function must be called exactly once when the FieldType is created.
    inferFieldInformation(context) {
        if (this.type === INPUT_TYPE_STRING) {
            this.#parsedType = INPUT_TYPE_TEXT;
        } else if (this.type === INPUT_TYPE_EMAIL) {
            this.#parsedType = INPUT_TYPE_EMAIL;
        } else if (this.type === INPUT_TYPE_PASSWORD) {
            this.#parsedType = INPUT_TYPE_PASSWORD;
        } else if (this.type === INPUT_TYPE_TEXTAREA) {
            this.#parsedType = INPUT_TYPE_TEXTAREA;
        } else if (this.type === INPUT_TYPE_FILE) {
            this.#parsedType = INPUT_TYPE_FILE;
        } else if (PATTERN_TARGET_SELF_OR.test(this.type)) {
            this.#parsedType = INPUT_TYPE_EMAIL;
            this.placeholder = context.user.email;
        } else if (PATTERN_TARGET_USER.test(this.type)) {
            this.#parsedType = INPUT_TYPE_EMAIL;
        } else if (PATTERN_INT.test(this.type)) {
            this.#parsedType = INPUT_TYPE_NUMBER;
            this.inputClasses += ` pattern="\d*"`;
        } else if (this.type === INPUT_TYPE_BOOL) {
            this.#parsedType = INPUT_TYPE_CHECKBOX;
            this.inputClasses += " checkbox-field";

            let value = "true";
            if (this.defaultValue != "") {
                value = this.defaultValue;
            }

            this.additionalAttributes += ` value="${value}"`;
            this.labelBefore = false;
        } else if (this.type === INPUT_TYPE_SELECT) {
            this.#parsedType = INPUT_TYPE_SELECT;
        } else {
            this.#parsedType = INPUT_TYPE_JSON;
            this.displayName += ` (expects: ${this.type})`;
        }

        // Due to the context credentials, remind the user the email and pass fields are optional.
        if (this.name === "user-email") {
            this.#parsedType = INPUT_TYPE_EMAIL;
            this.placeholder = context.user.email;
        } else if (this.name === "user-pass") {
            this.#parsedType = INPUT_TYPE_PASSWORD;
            this.placeholder = "<current token>";
        } else if (this.required) {
            this.additionalAttributes += ' required';
            this.displayName += ` <span class="required-color">*</span>`;
        }
    }

    toHTML() {
        let listOfFieldHTML = [
            `<label for="${this.name}">${this.displayName}</label>`,
        ];

        let fieldInformation = `id="${this.name}" name="${this.name}" class="tertiary-color" ${this.additionalAttributes}`;

        if (this.#parsedType === INPUT_TYPE_SELECT) {
            let choices = this.choices;

            // Add a help message as the first choice of the select.
            choices.unshift(new SelectOption("", "-- Choose an Option --"));

            listOfFieldHTML.push(
                `
                    <select ${fieldInformation}>
                        ${getSelectChoicesHTML(choices, this.defaultValue)}
                    </select>
                `,
            );
        } else if (this.#parsedType === INPUT_TYPE_TEXTAREA) {
            listOfFieldHTML.push(
                `<textarea ${fieldInformation} placeholder="${this.placeholder}" value="${this.defaultValue}"></textarea>`,
            );
        } else {
            let htmlType = this.#parsedType;
            if (htmlType === INPUT_TYPE_JSON) {
                htmlType = INPUT_TYPE_TEXT;
            }

            listOfFieldHTML.push(
                `<input type="${htmlType}" ${fieldInformation} placeholder="${this.placeholder}" value="${this.defaultValue}"/>`,
            );
        }

        if (!this.labelBefore) {
            listOfFieldHTML.reverse();
        }

        listOfFieldHTML.push(`<div class="error-message error-color"><p><span></span></p></div>`);

        return `
            <div class="input-field ${this.inputClasses}" data-name="${this.name}">
                ${listOfFieldHTML.join("\n")}
            </div>
        `;
    }

    getFieldInstance(container) {
        let input = container.querySelector(`fieldset .input-field *[name="${this.name}"]`);
        input.classList.add("touched");

        return new FieldInstance(container, input, this.#parsedType, this.extractInputFunc, this.inputValidationFunc);
    }
}

// The FieldInstance class is responsible for validating and getting the user input from a FieldType.
// Each FieldType is created once, but it creates a new FieldInstance whenever the user input is needed.
class FieldInstance {
    #parsedType;

    constructor(container, input, parsedType, extractInputFunc = undefined, inputValidationFunc = undefined) {
        this.container = container;

        // The input from the Input.FieldType's element.
        this.input = input;

        if (this.input == undefined) {
            throw new Error("<p>Cannot instantiate a field with an undefined input.</p>");
        }

        // See FieldType for field descriptions.
        this.#parsedType = parsedType;
        this.extractInputFunc = extractInputFunc;
        this.inputValidationFunc = inputValidationFunc;

        const errorField = this.container.querySelector(`.input-field[data-name="${this.input.name}"] .error-message`);

        try {
            this.validate();
        } catch (error) {
            if (errorField) {
                errorField.querySelector("span").textContent = error.message;
                errorField.classList.add("show");
            }

            throw new Error(`<p>${this.getFieldName()}: ${error.message}</p>`);
        }

        // Clear the error message if validation is successful.
        if (errorField) {
            errorField.querySelector("span").textContent = '';
            errorField.classList.remove("show");
        }
    }

    // Validate the value of the input.
    // Throws an error on invalid input values.
    validate() {
        // Skip all other validation if type is file and test files are present.
        if ((this.input.type === INPUT_TYPE_FILE) &&
                (this.input[TEST_FILES_KEY]?.length > 0)) {
            return;
        }

        if (!this.input.validity.valid) {
            throw new Error(`${this.input.validationMessage}`);
        }

        if (!this.input.checkValidity()) {
            throw new Error(`${this.input.validationMessage}`);
        }

        if (this.inputValidationFunc != undefined) {
            this.inputValidationFunc(this.input);
            return;
        }

        // Skip further validation if a custom extraction function is provided.
        if (this.extractInputFunc != undefined) {
            return;
        }

        if (this.input.value === "") {
            return;
        }

        if (this.#parsedType === INPUT_TYPE_JSON) {
            // Throws an error on failure.
            JSON.parse(`${this.input.value}`);
        }
    }

    getFieldName() {
        return this.input.name;
    }

    // Get the value from the result.
    // Throws an error on validation errors.
    getFieldValue() {
        if (this.extractInputFunc) {
            return this.extractInputFunc(this.input);
        }

        if (this.input == undefined) {
            return undefined;
        }

        let value = undefined;
        if (this.input.type === INPUT_TYPE_CHECKBOX) {
            value = this.input.checked;
        } else if (this.input.type === INPUT_TYPE_FILE) {
            value = [];
            for (const file of this.input.files) {
                value.push(file);
            }

            // Extract test files attached to input if any.
            if (this.input[TEST_FILES_KEY]) {
                for (const file of this.input[TEST_FILES_KEY]) {
                    value.push(file);
                }
            }
        } else if ((this.#parsedType === INPUT_TYPE_JSON) || (this.#parsedType === INPUT_TYPE_NUMBER)) {
            value = this.valueFromJSON();
        } else {
            value = this.input.value;
        }

        return value;
    }

    valueFromJSON() {
        if ((!this.input) || (!this.input.value) || (this.input.value === "")) {
            return "";
        }

        // The input has already been validated,
        // so parse will not throw an error.
        return JSON.parse(`${this.input.value}`);
    }
}

class SelectOption {
    constructor(value, displayName = value) {
        this.value = value;
        this.displayName = displayName;
    }

    toHTML(defaultValue) {
        let isSelected = '';
        if (this.value === defaultValue) {
            isSelected = ' selected';
        }

        return `<option value="${this.value}"${isSelected}>${this.displayName}</option>`;
    }
}

// Returns the HTML for the list of select choices.
function getSelectChoicesHTML(choices, defaultValue) {
    let choicesHTMLList = choices.map((choice) => (choice.toHTML(defaultValue)));

    return choicesHTMLList.join("\n");
}

export {
    INPUT_TYPE_BOOL,
    INPUT_TYPE_CHECKBOX,
    INPUT_TYPE_EMAIL,
    INPUT_TYPE_FILE,
    INPUT_TYPE_INT,
    INPUT_TYPE_JSON,
    INPUT_TYPE_NUMBER,
    INPUT_TYPE_PASSWORD,
    INPUT_TYPE_SELECT,
    INPUT_TYPE_STRING,
    INPUT_TYPE_TEXT,
    INPUT_TYPE_TEXTAREA,

    FieldInstance,
    FieldType,
    SelectOption,

    COURSE_USER_REFERENCE_LIST_FIELD_TYPE,

    TEST_FILES_KEY,
};
