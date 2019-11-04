({
    almond: true,
    appDir: "./app/.build-cache/app/development/public",
    baseUrl: "./assets/js/",
    dir: "./app/distribute",
    mainConfigFile: "./app/.build-cache/app/development/public/assets/js/main.js",
    removeCombined: true,
    fileExclusionRegExp: /^\./,
    wrapShim: true,
    preserveLicenseComments: false,
    modules: [
        {
            name: "main"
        }
    ],
    optimize: "uglify",
    inlineText: true,
    uglify: {
        except: ["$super"], //Don't modify the "$super" text, needed to make Rickshaw pass optimization.
        compress: {
            drop_console: true
        }
    },
    waitSeconds: 20
})