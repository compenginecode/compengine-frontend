module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        requirejs: {},

        /**
         * Build the javascript files
         */
        shell: {
            options: {
                stderr: false
            },
            target: {
                command: "r.js -o build.js > build-log.txt"
            }
        },

        /**
         *  Cache busts all local (included) JS and CSS inside the index.html file.
         */
        cacheBust: {
            options: {
                encoding: "utf8",
                algorithm: "md5",
                length: 16,
                deleteOriginals: true
            },
            assets: {
                files: [{
                    src: ["./app/distribute/index.html", "./app/distribute/colour-test.html"]
                }]
            }
        },

        /**
         *  Copies the development files into a temporary build location.
         */
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ["app/development/public/**/*"],
                        dest: "app/.build-cache/"}
                ]
            }
        },

        /**
         *  Runs the directive pre-processor over the HTML file.
         */
        preprocess : {
            inline : {
                src : [
                    "app/.build-cache/development/public/**/*.html",
                    "app/.build-cache/development/public/assets/js/modules/**/*.js"
                ],
                options: {
                    inline : true,
                    context : {
                        /** We turn OFF debug mode **/
                        DEBUG: false
                    }
                }
            }
        },

        /**
         *  Compiles all SASS into CSS
         */
        sass: {
            options: {
                style: "nested",
                precision: 5,
                compass: true,
                sourcemap: "inline"
            },
            all: {
                files: {
                    "app/development/public/assets/css/app.min.css": "app/development/sass/app.scss"
                }
            }
        },

        /**
         * PostCSS, We're going to grab the compiled SASS and run over it with Autoprefixer & cssnano.
         */
        postcss: {
            options: {
                map: true,

                processors: [
                    require("autoprefixer")({
                        browsers: "last 2 versions"
                    }),
                    require("cssnano")({
                        autoprefixer: true,
                        discardComments: {
                            removeAll: true
                        },
                        discardDuplicates: true,
                        discardEmpty: true,
                        discardUnused: true,
                        filterOptimiser: true,
                        mergeLonghand: true,
                        minifyGradients: true,
                        minifyParams: true,
                        svgo: true
                    })
                ]
            },
            dist: {
                src: "app/development/public/assets/css/app.min.css"
            }
        },

        /**
         *  Forces a reload when a SCSS, JS or HTML file changes.
         */
        watch: {
            options: {
                livereload: true
            },
            sass: {
                files: [
                    "app/development/sass/**/*.scss"
                ],
                tasks: "sass"
            },
            js: {
                files: [
                    "app/development/public/assets/js/**/*.js"
                ]
            },
            html: {
                files: [
                    "app/development/public/assets/js/**/*.html",
                    "app/development/public/index.html"
                ]
            }
        },

        /**
         * JS Hint
         */
        jshint: {
            files: [
                "Gruntfile.js",
                "app/development/public/assets/js/tests/**/*.js",
                "app/development/public/assets/js/app/**/*.js",
                "app/development/public/assets/js/modules/**/**/*.js"
            ],
            options: {
                globals: {
                    jQuery: true,
                    console: false,
                    module: true,
                    document: true,
                    define: false,
                    window: false,
                    _: false
                },
                ignores: ["strict"]
            }
        },

        /**
         * Connect Server
         */
        connect: {
            test: {
                port: 8000
            }
        },

        /**
         * Jasmine Unit Tests
         */
        jasmine: {
            unitTest: {
                src: "app/development/public/assets/js/main",
                options: {
                    specs: "app/development/public/assets/js/test/specs/*spec.js",
                    host: "http://127.0.0.1:8000/",
                    template: require("grunt-template-jasmine-requirejs"),
                    templateOptions: {
                        requireConfigFile: "./app/development/public/assets/js/test/config/jasmine.config.js"
                    }
                }
            }
        },

        /**
         * Karma Unit Tests
         *
         * This is essentially the same as the jasmine unit test, but it will test in other browsers.
         */
        karma: {
            unit: {
                configFile: "./app/development/public/assets/js/test/config/karma.conf.js"
            }
        },

        /**
         * Build the documentation
         *
         * @since 1.1
         */
        jsdoc: {
            dist: {
                src: [
                    "app/development/public/assets/js/main.js",
                    "app/development/public/assets/js/app/*.js",
                    "app/development/public/assets/js/modules/common/controllers/*.js",
                    "app/development/public/assets/js/modules/common/controllers/controller-definition.jsdoc",
                    "app/development/public/assets/js/modules/common/views/*/*.js",
                    "app/development/public/assets/js/modules/modals/*/*.js",
                    "app/development/public/assets/js/modules/prompts/*/*.js",
                    "app/development/public/assets/js/modules/prompts/prompt-definition.jsdoc",
                    "app/development/public/assets/js/modules/modals/*/controllers/*.js",
                    "app/development/public/assets/js/modules/pages/*/views/*.js",
                    "app/development/public/assets/js/modules/pages/page-definition.jsdoc"
                ],
                options: {
                    destination: "docs"
                }
            }
        }
    });

    /**
     * Load Dependencies
     *
     * Unit tests are loaded first, then all others after.
     */
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-contrib-connect");

    grunt.loadNpmTasks("grunt-cache-bust");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-preprocess");
    grunt.loadNpmTasks("grunt-requirejs");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-closure-compiler");
    grunt.loadNpmTasks("grunt-postcss");
    grunt.loadNpmTasks("grunt-jsdoc");


    /** Register Tasks **/
    grunt.registerTask("style", ["sass", "postcss"]);
    grunt.registerTask("build", ["sass", "postcss", "copy", "preprocess", "shell"]);
    grunt.registerTask("test", ["connect", "karma"]);
    grunt.registerTask("docs", ["jsdoc"]);
    grunt.registerTask("default", ["test", "docs", "build"]);
};
