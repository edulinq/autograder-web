let _isLightMode = undefined;

function init() {
    initBrightMode();
}

function initBrightMode() {
    setBrightMode(isSystemLightMode());

    let toggle = document.querySelector('.bright-mode-toggle');
    if (toggle) {
        toggle.addEventListener('click', function(event) {
            let lightSelection = document.querySelector('.bright-mode-toggle .light');
            setBrightMode(!lightSelection.classList.contains('active'));
        });
    }

    // Watch for system changes.
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(event) {
            setBrightMode(!event.matches);
        });
    }
}

function setBrightMode(isLight) {
    _isLightMode = isLight;

    // Set UI bright mode selector.
    document.querySelectorAll('.bright-mode-toggle .selector').forEach(function(element) {
        if ((isLight && element.classList.contains('light')) || (!isLight && element.classList.contains('dark'))) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    });

    // Set the page's mode.
    let html = document.querySelector('html');
    if (isLight) {
        html.classList.remove('dark');
        html.classList.add('light');
    } else {
        html.classList.remove('light');
        html.classList.add('dark');
    }

    html.classList.remove('no-brightness-selection');
}

function isSystemLightMode() {
    // Default to light mode.
    if (!window.matchMedia) {
        return true;
    }

    return !window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function isLightMode() {
    return _isLightMode;
}

function isDarkMode() {
    return !isLightMode();
}

export {
    init,

    isDarkMode,
    isLightMode,
}
