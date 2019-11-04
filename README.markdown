CompEngine Front End
==================================

## tldr;
This repository contains the code for the CompEngine single page app (SPA). It is written using Backbone.js and Marionette.js, and compiled via R.js. More documentation will come shortly.

##How to use
Simply download it, run npm install and bower install. Then setup the configuration settings inside /server/build/ and then when inside the server folder, run node server.js --bundle build.

##How build
Run "grunt build" to build the application. This app also has an associated Dockerfile which uses Apache as a reverse proxy (needed for the production deployment). Run "docker build" to build the image.
