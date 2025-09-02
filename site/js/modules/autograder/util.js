import sjcl from './vendor/sjcl.min.js';
import JSZipExport from './vendor/jszip.min.js';

function getTimestampNow() {
    return Date.now();
}

function sha256(text) {
    return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(text));
}

// Convert a base64 string to a Blob,
// block until the result is ready.
function b64DecodeBlock(b64Text) {
    // Convert the base64 string to a byte string.
    const byteString = atob(b64Text);

    // Convert the bytes from characters to ints.
    const bytes = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
    }

    // Construct a blob.
    return new Blob([new Uint8Array(bytes)]);
}

// Convert a base64 string to a Blob,
// return a promise the resolves to the result.
function b64Decode(b64Text) {
    return new Promise(function(resolve, reject) {
        try {
            resolve(b64DecodeBlock(b64Text));
        } catch (error) {
            reject(error);
        }
    });
}

// Take in a blob representing gzipped data,
// and return a promise that will resolve to a Blob of the uncompressed gzipped data.
function gunzip(gzipBlob) {
    const decompression = new DecompressionStream('gzip');
    const decompressedStream = gzipBlob.stream().pipeThrough(decompression);
    return (new Response(decompressedStream)).blob();
}

// Return a promise to convert a file sent over on the autograder API to a JS File object.
// The autograder sends files as base64 encodings of gzip file contents.
// If successful, the promise will resolve to an uncompressed File object.
function autograderFileToJSFile(b64Text, name = undefined) {
    return b64Decode(b64Text).then(gunzip).then(function(blob) {
        return new File([blob], name);
    });
}

// Return a promise that resolves a standard autograder grading result (model.GradingResult)
// to a JS file object that represents a zip file containing the full result.
// If no filename is provided, the grading result's ID is used.
function autograderGradingResultToJSFile(gradingResult, filename = undefined) {
    const jszip = JSZipExport();

    let archive = jszip();
    let root = archive.folder(gradingResult.info.id);

    if (!filename) {
        filename = `${gradingResult.info.id}.zip`;
    }

    return new Promise(async function(resolve, reject) {
        // Add the base/standard files.
        root.file('info.json', JSON.stringify(gradingResult.info, undefined, 4));
        root.file('stdout.txt', gradingResult.stdout);
        root.file('stderr.txt', gradingResult.stderr);

        // Add directories.
        const dirs = [
            ['input-files-gzip', 'input'],
            ['output-files-gzip', 'output'],
        ];

        for (const [key, dirname] of dirs) {
            let dir = root.folder(dirname);

            for (const [filename, base64Text] of Object.entries(gradingResult[key])) {
                let file = await autograderFileToJSFile(base64Text, filename);
                dir.file(filename, file);
            }
        }

        archive.generateAsync({type: 'blob', compression: 'DEFLATE'}).then(function(blob) {
            let file = new File([blob], filename, {type: 'application/zip'});
            file['__testing_blob_size'] = blob.size;
            resolve(file);
        });
    });
}

export {
    autograderFileToJSFile,
    autograderGradingResultToJSFile,
    b64Decode,
    getTimestampNow,
    gunzip,
    sha256,
}
