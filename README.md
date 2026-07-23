# Lynx Grader - Web Interface

A web-based GUI for the [EduLinq Autograder Server](https://github.com/edulinq/autograder-server).

This GUI can either be embedded into the Autograder Server to be served statically
(which can be seen in the [official Autograder Server repo](https://github.com/edulinq/autograder-server/tree/main/internal/api/static)),
or hosted independently and pointed towards an Autograder Server instance.

## Cloning

This repository includes submodules.
To fetch these submodules on clone, add the `--recurse-submodules` flag.
For example:
```sh
git clone --recurse-submodules git@github.com:edulinq/autograder-web.git
```

To fetch the submodules after cloning, you can use:
```sh
git submodule update --init --recursive
```

## Development / Testing

As this project is mostly vanilla HTML/JS/CSS, there are not too many complex environmental features to be wary of.
We use NodeJS for [testing](#unit-tests), but not for anything else.
All pages are designed to be static.

The recommended way to develop is to clone the [Autograder Server](https://github.com/edulinq/autograder-server) repo and work on the version of this repo as a submodule.
Then, you can [start a test server](https://github.com/edulinq/autograder-server?tab=readme-ov-file#running-the-server-for-testing)
that will serve the GUI (by default) on [http://127.0.0.1:8080](http://127.0.0.1:8080).

Otherwise, you can start a local [test server](#test-server) that points to an instance of the Autograder Server.
Of course, you will need to have credentials on the active server to develop most pages.
If you are running your own server for development we recommend using the `--unit-testing` flag,
then you can take advantage of the [existing test data](https://github.com/edulinq/autograder-server/blob/main/docs/development.md#test-data).

You can also run a server in [a Docker container](https://github.com/edulinq/autograder-server/blob/main/docs/docker.md#running-the-server)
if need be.

## Unit Tests

We use [NodeJS](https://nodejs.org/en), [Jest](https://jestjs.io/), and [jsdom](https://github.com/jsdom/jsdom) for unit testing.
To run, first ensure that NodeJS (and npm) is installed.
Then, install the dependencies with:
```sh
npm install
```

Finally, to run the tests use:
```sh
npm test
```

### Test Data

Test data for this project is provided by the [autograder-testdata](https://github.com/edulinq/autograder-testdata) repository.
This repo maintains common test data for any autograder-based project.
The `autograder-testdata` repo is set as a submodule of this repository at [testdata/autograder-testdata](testdata/autograder-testdata).

## Test Server

This repo comes with a simple test server to host the GUI.
By default, the test server uses port 12345, but this can be changed with the `--port` flag.
You will need to tell the test server (via a required argument) where an accessible autograder server is.
```sh
./.scripts/run_test_server.py 'http://127.0.0.1:8080'
```

With the server started, you can head to the web GUI (by default) on [http://127.0.0.1:12345](http://127.0.0.1:12345).
