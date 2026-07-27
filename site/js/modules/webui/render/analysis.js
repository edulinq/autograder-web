import * as RenderJSON from './json.js';
import * as Table from './table.js';
import * as Util from '../util/index.js';

function formatNumber(value, decimalPlaces = 2) {
    if (value === null || value === undefined) {
        return '-';
    }
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return '-';
    }
    return num.toFixed(decimalPlaces);
}

function formatPercent(value) {
    if (value === null || value === undefined) {
        return '-';
    }
    const formatted = formatNumber(value * 100, 1);
    if (formatted === '-') {
        return '-';
    }
    return formatted + '%';
}

function msToSeconds(ms) {
    if (ms === null || ms === undefined) {
        return '-';
    }
    return formatNumber(ms / 1000) + 's';
}

// Converts an aggregate object to an array of formatted strings for Table.tableFromLists.
function aggregateToRow(aggregate) {
    if (!aggregate) {
        return ['-', '-', '-', '-', '-'];
    }
    return [
        formatNumber(aggregate['count'], 0),
        formatNumber(aggregate['mean']),
        formatNumber(aggregate['median']),
        formatNumber(aggregate['min']),
        formatNumber(aggregate['max']),
    ];
}

// Returns a pending/empty state paragraph.
function pendingState(message = 'Data pending or unavailable.') {
    return `<p class='analysis-pending'>${Util.escapeHTML(message)}</p>`;
}

// Wraps content in a titled analysis section block.
function analysisSection(title, bodyHTML) {
    return `
        <div class='analysis-section'>
            <h3>${Util.escapeHTML(title)}</h3>
            ${bodyHTML}
        </div>
    `;
}

function renderIndividualAnalysis(result) {
    const summary = result['summary'];
    const results = result['results'] ?? {};
    const isComplete = result['complete'];

    let html = '';

    if (!isComplete) {
        html += `<p class='analysis-pending'>Analysis is still running. Showing partial data.</p>`;
    }

    // Summary stats.
    const headers = ['Metric', 'Count', 'Mean', 'Median', 'Min', 'Max'];
    const summaryItems = [
        ['Score', summary['aggregate-score']],
        ['Lines of Code', summary['aggregate-lines-of-code']],
        ['Time Delta', summary['aggregate-submission-time-delta']],
        ['LOC Delta', summary['aggregate-lines-of-code-delta']],
        ['Score Delta', summary['aggregate-score-delta']],
        ['LOC / hr (Velocity)', summary['aggregate-lines-of-code-per-hour']],
        ['Score / hr (Velocity)', summary['aggregate-score-per-hour']],
    ];

    let summaryRows = [];
    for (const item of summaryItems) {
        let row = [Util.escapeHTML(item[0])];
        for (const cell of aggregateToRow(item[1])) {
            row.push(cell);
        }
        summaryRows.push(row);
    }

    let summaryHTML = Table.tableFromLists(headers, summaryRows, ['analysis-summary-table']);

    // Per-file LOC sub-table.
    const locPerFile = summary['aggregate-lines-of-code-per-file'];
    if (locPerFile) {
        const fileNames = Object.keys(locPerFile).sort();
        const fileHeaders = ['File', 'Count', 'Mean', 'Median', 'Min', 'Max'];
        let fileRows = [];
        for (const filename of fileNames) {
            let row = [Util.escapeHTML(filename)];
            for (const cell of aggregateToRow(locPerFile[filename])) {
                row.push(cell);
            }
            fileRows.push(row);
        }

        summaryHTML += `
            <h4 class='analysis-loc-header'>Lines of Code per File</h4>
            ${Table.tableFromLists(fileHeaders, fileRows, ['analysis-loc-per-file-table'])}
        `;
    } else {
        summaryHTML += pendingState('Per-file LOC breakdown not yet available.');
    }

    html += analysisSection('Summary Statistics', summaryHTML);

    // Per-submission table.
    const submissionIDs = Object.keys(results).sort();

    let resultsHTML = '';
    if (submissionIDs.length === 0) {
        resultsHTML = pendingState('No individual results yet.');
    } else {
        const resHeaders = [
            'Submission ID', 'Score', 'LOC', 'Time Delta', 'LOC Delta',
            'Score Delta', 'LOC / hr', 'Score / hr'
        ];

        const rows = submissionIDs.map(function(id) {
            const r = results[id];
            const shortId = Util.escapeHTML(r['short-id'] ?? id);

            return [
                shortId,
                formatNumber(r['score'] ?? null),
                formatNumber(r['lines-of-code'] ?? null, 0),
                msToSeconds(r['submission-time-delta'] ?? null),
                formatNumber(r['lines-of-code-delta'] ?? null, 0),
                formatNumber(r['score-delta'] ?? null),
                formatNumber(r['lines-of-code-per-hour'] ?? null),
                formatNumber(r['score-per-hour'] ?? null),
            ];
        });

        resultsHTML = Table.tableFromLists(resHeaders, rows, ['analysis-results-table']);
    }

    html += analysisSection('Per-Submission Results', resultsHTML);

    html += `
        <details class='analysis-raw-json'>
            <summary>Raw JSON</summary>
            ${RenderJSON.codeBlockJSON(result)}
        </details>
    `;

    return html;
}

function renderPairwiseAnalysis(result) {
    const summary = result['summary'];
    const results = result['results'] ?? {};
    const isComplete = result['complete'];

    let html = '';

    if (!isComplete) {
        html += `<p class='analysis-pending'>Analysis is still running. Showing partial data.</p>`;
    }

    // Similarity summary.
    const totalMean = summary['aggregate-total-mean-similarity'];
    let summaryHTML = `
        <div class='pairwise-overall-summary'>
            <strong>Overall Mean Similarity:</strong>
            ${formatPercent(totalMean?.['mean'] ?? null)}
        </div>
    `;

    const meanSims = summary['aggregate-mean-similarities'];
    if (meanSims) {
        const fileNames = Object.keys(meanSims).sort();
        const headers = ['File', 'Count', 'Mean', 'Median', 'Min', 'Max'];

        let fileRows = [];
        for (const filename of fileNames) {
            let row = [Util.escapeHTML(filename)];
            for (const cell of aggregateToRow(meanSims[filename])) {
                row.push(cell);
            }
            fileRows.push(row);
        }

        summaryHTML += Table.tableFromLists(headers, fileRows, ['pairwise-summary']);
    } else {
        summaryHTML += pendingState('Per-file similarity summary not yet available.');
    }

    html += analysisSection('Similarity Summary', summaryHTML);

    // Per-pair flattened table.
    const pairKeys = Object.keys(results).sort();
    let pairsHTML = '';

    if (pairKeys.length === 0) {
        pairsHTML = pendingState('No pairwise results yet.');
    } else {
        const resHeaders = ['Pair (short IDs)', 'File', 'Tool', 'Similarity'];
        let rows = [];

        for (const pairKey of pairKeys) {
            const pair = results[pairKey];
            const sims = pair['similarities'] ?? {};
            const fileNames = Object.keys(sims).sort();

            // Shorten pair key for display -- keep only short IDs.
            const parts = pairKey.split('||');
            const shortDisplay = parts.map(function(p) {
                const segs = p.split('::');
                return segs[segs.length - 1] ?? p;
            }).join(' || ');

            const shortSpan = Util.escapeHTML(shortDisplay);

            let pairHasRows = false;
            for (const filename of fileNames) {
                const toolEntries = sims[filename] ?? [];

                for (const entry of toolEntries) {
                    rows.push([
                        shortSpan,
                        Util.escapeHTML(filename),
                        Util.escapeHTML(entry['tool'] ?? '-'),
                        formatPercent(entry['score'] ?? null),
                    ]);
                    pairHasRows = true;
                }
            }

            // Fallback: no files at all, or files exist but all tool entry arrays were empty.
            if (!pairHasRows) {
                rows.push([
                    shortSpan,
                    pendingState('No tool results available.'),
                    '-',
                    '-',
                ]);
            }
        }

        pairsHTML = Table.tableFromLists(resHeaders, rows, ['pairwise-pairs-table']);
    }

    html += analysisSection('Per-Pair Comparisons', pairsHTML);

    html += `
        <details class='analysis-raw-json'>
            <summary>Raw JSON</summary>
            ${RenderJSON.codeBlockJSON(result)}
        </details>
    `;

    return html;
}

export {
    renderIndividualAnalysis,
    renderPairwiseAnalysis,
};
