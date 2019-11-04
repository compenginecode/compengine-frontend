var express = require("express");
var http = require("http");
var https = require("https");
var bodyParser = require("body-parser");
var helmet = require("helmet");
var cliArgs = require("command-line-args");
var fs = require("fs");
var server = module.exports = express();
var cli = cliArgs([{ name: "bundle", type: String}]);
var bundleName = cli.parse().bundle || "production";
var serverOptionsFile = __dirname + "/" + bundleName + "/" + "server-settings.json";
var serverOptions;
var options = null;

if (process.env.FRONTEND_DIR != null) {
    serverOptions = { port: 1919, documentRoot: process.env.FRONTEND_DIR };
} else {
    serverOptions = JSON.parse(fs.readFileSync(serverOptionsFile, "utf8"));
}

if ("undefined" !== typeof serverOptions.key && "undefined" !== typeof serverOptions.cert) {
    options = {
        key: fs.readFileSync(serverOptions.key),
        cert: fs.readFileSync(serverOptions.cert)
    };
}

server.get("/settings", function(req, res) {
    if (process.env.APIEndpoint != null && process.env.Version != null && process.env.MixpanelToken != null) {
        res.send("var GLOBALS = {\
            APIEndpoint: '" + process.env.APIEndpoint + "',\
            Version: '" + process.env.Version + "',\
            MixpanelToken: '" + process.env.MixpanelToken + "',\
            recaptcha: '" + process.env.recaptcha + "',\
            FB_APP_ID: '" + process.env.FB_APP_ID + "',\
            GA_TRACKING_ID: '" + process.env.GA_TRACKING_ID + "'\
        };");
    } else {
        res.sendfile(__dirname + "/" + bundleName + "/" + "frontend-settings.js");
    }
});

http.globalAgent.maxSockets = Infinity;
https.globalAgent.maxSockets = Infinity;

server.use(helmet());
server.use(express.compress());
server.get('*', function(req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.ip;
    if (process.env.MAINTENANCE_MODE === 'true' && ip.indexOf(process.env.MAINTENANCE_BYPASS_IP_ONE) === -1
        && ip.indexOf(process.env.MAINTENANCE_BYPASS_IP_TWO) === -1) {

        res.redirect(307, process.env.MAINTENANCE_URL)
    } else {
        return next();
    }
});
server.use(express.static(serverOptions.documentRoot));
server.use(express.urlencoded());
server.use(express.json());
server.use(server.router);

if (null === options){
    http.createServer(server).listen(serverOptions.port);
}else{
    console.log("Starting in TLS/SSL mode.");
    https.createServer(options, server).listen(serverOptions.port);
}
console.log("Server started on port " + serverOptions.port + " from directory " + serverOptions.documentRoot);
