import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';
import * as Render from '../render/index.js';

const LOG_LEVELS = [
    'TRACE',
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'FATAL',
];

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_SERVER_LOGS, handlerLogs, 'View Server Logs', Core.Routing.NAV_SERVER);
}

function handlerLogs(path, params, context, container) {
    Render.setTabTitle('View Server Logs');

    let levelChoices = LOG_LEVELS.map(function(level) {
        return new Render.SelectOption(level);
    });

    let inputFields = [
        new Render.FieldType(context, 'level', 'Minimum Level', {
            type: Render.INPUT_TYPE_SELECT,
            choices: levelChoices,
            defaultValue: 'INFO',
        }),
        new Render.FieldType(context, 'target-email', 'User Email', {
            type: Render.INPUT_TYPE_EMAIL,
        }),
        new Render.FieldType(context, 'target-course', 'Course ID'),
        new Render.FieldType(context, 'target-assignment', 'Assignment ID'),
        new Render.FieldType(context, 'after', 'After (timestamp)'),
        new Render.FieldType(context, 'past', 'Past Timespan', {
            placeholder: "Timespan, e.g., '24h'",
        }),
    ];

    Render.makePage(
        params, context, container, queryLogs,
        {
            header: 'View Server Logs',
            description: 'Query server logs by level and optional filters.',
            inputs: inputFields,
            buttonName: 'Query',
            iconName: Render.ICON_NAME_LIST,
        },
    );
}

function queryLogs(params, context, container, inputParams) {
    return Autograder.Logs.query(inputParams)
        .then(function(result) {
            if (result.results.length === 0) {
                return '<p>No logs matched your query.</p>';
            }

            Render.apiOutputSwitcher(result.results, container, {
                renderOptions: new Render.APIValueRenderOptions({
                    keyOrdering: ['timestamp', 'level', 'message', 'attributes'],
                    initialIndentLevel: -1,
                }),
                modes: [
                    Render.API_OUTPUT_SWITCHER_TEXT,
                    Render.API_OUTPUT_SWITCHER_TABLE,
                    Render.API_OUTPUT_SWITCHER_JSON,
                ],
            });

            return undefined;
        })
        .catch(function(message) {
            console.error(message);
            return Render.autograderError(message);
        })
    ;
}

init();
