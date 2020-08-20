# CompEngine Front End

This repository contains the code for the [CompEngine](https://www.comp-engine.org/) single-page app (SPA).
It is written using `Backbone.js` and `Marionette.js`, and compiled via `R.js`. Bower is used for front end dependencies and the application is served over HTTP by Express (Node). NPM is used to manage Node dependencies.

## How to use
Simply download it, run `npm install` and `bower install`.
Then setup the configuration settings inside `/server/build/` and then when inside the server folder, run `node server.js --bundle build`. The configuration options inside the JSON file are as follows:

``apiEndpoint`` - Fully qualified URL of the API, no trailing slash

``Version`` - Optional version number

``appUrl`` - Fully qualified URL of the front end, no trailing slash

``recaptcha`` - Google recapcha token

``MixpanelToken`` - Mixpanel API token

## How to build
Run `grunt build` to build the application.
This app also has an associated Dockerfile which uses Apache as a reverse proxy (needed for the production deployment). Run `docker build` to build the image.

## License
Copyright 2020 Ben D. Fulcher

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
