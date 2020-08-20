# CompEngine Front End

This repository contains the code for the [CompEngine](https://www.comp-engine.org/) single-page app (SPA).
It is written using `Backbone.js` and `Marionette.js`, and compiled via `R.js`. Bower is used for front end dependencies and the application is served over HTTP by Express (Node). NPM is used to manage Node dependencies.

## How to use
Simply download it, run `npm install` and `bower install`.
Then setup the configuration settings inside `/server/build/` and then when inside the server folder, run `node server.js --bundle build`. The configuration options inside the JSON file are as follows:


## How to build
Run `grunt build` to build the application.
This app also has an associated Dockerfile which uses Apache as a reverse proxy (needed for the production deployment). Run `docker build` to build the image.

``apiEndpoint`` - Fully qualified URL of the API, no trailing slash

``Version`` - Optional version number

``appUrl`` - Fully qualified URL of the front end, no trailing slash

``recaptcha`` - Google recapcha token

``MixpanelToken`` - Mixpanel API token
