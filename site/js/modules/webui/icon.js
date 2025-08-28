const ICON_NAME_DEFAULT = 'default';
const ICON_NAME_ANALYSIS = 'analysis';
const ICON_NAME_CALL_ENDPOINT = 'call-endpoint';
const ICON_NAME_COURSES = 'courses';
const ICON_NAME_FETCH = 'fetch';
const ICON_NAME_HISTORY = 'history';
const ICON_NAME_HOME = 'home';
const ICON_NAME_LIST = 'list';
const ICON_NAME_LOGIN = 'login';
const ICON_NAME_LOGO = 'logo';
const ICON_NAME_LOGOUT = 'logout';
const ICON_NAME_MAIL = 'mail';
const ICON_NAME_MOON = 'moon';
const ICON_NAME_PEEK = 'peek';
const ICON_NAME_PROXY_REGRADE = 'proxy-regrade';
const ICON_NAME_PROXY_RESUBMIT = 'proxy-resubmit';
const ICON_NAME_PROXY_SUBMIT = 'proxy-submit';
const ICON_NAME_REMOVE = 'remove';
const ICON_NAME_SERVER = 'server';
const ICON_NAME_SUBMIT = 'submit';
const ICON_NAME_SUN = 'sun';

const KNOWN_ICON_NAMES = [
    ICON_NAME_DEFAULT,
    ICON_NAME_ANALYSIS,
    ICON_NAME_CALL_ENDPOINT,
    ICON_NAME_COURSES,
    ICON_NAME_FETCH,
    ICON_NAME_HISTORY,
    ICON_NAME_HOME,
    ICON_NAME_LIST,
    ICON_NAME_LOGIN,
    ICON_NAME_LOGO,
    ICON_NAME_LOGOUT,
    ICON_NAME_MAIL,
    ICON_NAME_MOON,
    ICON_NAME_PEEK,
    ICON_NAME_PROXY_REGRADE,
    ICON_NAME_PROXY_RESUBMIT,
    ICON_NAME_PROXY_SUBMIT,
    ICON_NAME_REMOVE,
    ICON_NAME_SERVER,
    ICON_NAME_SUBMIT,
    ICON_NAME_SUN,
];

function getIconHTML(iconName, additionalClasses = 'secondary-accent-color-bg-low') {
    if (!KNOWN_ICON_NAMES.includes(iconName)) {
        console.warn(`Unknown icon name '${iconName}'. Falling back to the default icon.`);
        iconName = ICON_NAME_DEFAULT;
    }

    if (!additionalClasses) {
        additionalClasses = '';
    }

    const labelName = `${iconName}-label`;

    return `
        <div class='icon ${additionalClasses}'>
            <svg class='light-only' role='img' aria-labelledby='${labelName}'>
                <title id='${labelName}'>${iconName}</title>
                <use href="images/edulinq-icon-sheet.svg#icon-${iconName}-light"></use>
            </svg>
            <svg class='dark-only' role='img' aria-labelledby='${labelName}'>
                <title id='${labelName}'>${iconName}</title>
                <use href="images/edulinq-icon-sheet.svg#icon-${iconName}-dark"></use>
            </svg>
        </div>
    `;
}

export {
    getIconHTML,

    ICON_NAME_DEFAULT,
    ICON_NAME_ANALYSIS,
    ICON_NAME_CALL_ENDPOINT,
    ICON_NAME_COURSES,
    ICON_NAME_FETCH,
    ICON_NAME_HISTORY,
    ICON_NAME_HOME,
    ICON_NAME_LIST,
    ICON_NAME_LOGIN,
    ICON_NAME_LOGO,
    ICON_NAME_LOGOUT,
    ICON_NAME_MAIL,
    ICON_NAME_MOON,
    ICON_NAME_PEEK,
    ICON_NAME_PROXY_REGRADE,
    ICON_NAME_PROXY_RESUBMIT,
    ICON_NAME_PROXY_SUBMIT,
    ICON_NAME_REMOVE,
    ICON_NAME_SERVER,
    ICON_NAME_SUBMIT,
    ICON_NAME_SUN,
};
