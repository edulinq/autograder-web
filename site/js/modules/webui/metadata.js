import * as Autograder from '../autograder/base.js'

// import * as Log from './log.js'
import * as Render from './render.js'
import * as Routing from './routing.js'
// import * as Util from './util.js'

function init() {
    Routing.addRoute(/^metadata\/describe$/, handlerDescribe, 'Describe', undefined);
}

function handlerDescribe(path, params, context, container) {
    Routing.loadingStart(container)

    Autograder.Metadata.describe()
        .then(function(result) {
            let describeJSON = JSON.stringify(result, null, 4);

            let html = `
                <pre id="describe-json">${describeJSON}</pre>
            `;

            container.innerHTML = html;
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
    /*
    container.innerHTML = `
        <div class='describe'>
            <div class='describe-controls page-controls'>
                <button>Describe</button>
            </div>
            <div>
            <div class='describe-results'>
            </div>
        </div>
    `

    let button = container.querySelector('.describe-controls button');
    let results = container.querySelector('.describe-results');

    button.addEventListener('click', function(event) {
        let path = Routing.formHashPath(Routing.PATH_DESCRIBE, params);
        Routing.redirect(path);
    });

    doDescribe(context, container);
    */
}

/*
function doDescribe(context, container) {
    Routing.loadingStart(container)

    Autograder.Metadata.describe()
        .then(function(result) {
            let describeJSON = JSON.stringify(result, null, 4);

            let html = `
                <pre id="describe-json">${describeJSON}</pre>
            `;

            container.innerHTML = html;
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}
*/

export {
    init,
}
