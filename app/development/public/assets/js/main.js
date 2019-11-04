"use strict";

/**
 * Configure RequireJS.
 */
require.config({
    baseUrl: "./assets/js/",

    paths: {
        /** Following must have their names preserved **/
        "jquery": "libs/managed/jquery/dist/jquery",
        "underscore": "libs/managed/underscore/underscore",
        "underscore.string": "libs/managed/underscore.string/dist/underscore.string",

        /** Standard libraries **/
        "async": "libs/managed/requirejs-plugins/src/async",
        "backbone": "libs/managed/backbone/backbone",
        "marionette": "libs/managed/marionette/lib/backbone.marionette",
        "text": "libs/managed/text/text",
        "bossview": "libs/managed/bossview/Marionette.BossView.AMD",
        "cocktail": "libs/managed/cocktail/Cocktail",
        "moment": "libs/managed/moment/moment",
        "simpleStorage": "libs/managed/simpleStorage/simpleStorage",
        "backbonedeep": "libs/managed/backbone-deep-model/distribution/deep-model",
        "queryparams": "libs/managed/backbone-query-parameters/backbone.queryparams",
        "bootstrap": "libs/managed/bootstrap/dist/js/bootstrap.min",
        "toastr": "libs/managed/toastr/toastr",
        "countUp": "libs/managed/countup.js/countUp",
        "dropZone": "libs/managed/dropzone/dist/dropzone-amd-module",
        "tetherjs": "libs/managed/tether/dist/js/tether.min",
        "backbone.radio": "libs/managed/backbone.radio/build/backbone.radio",
        "typed": "libs/managed/typed.js/dist/typed.min",
        "jqTree": "libs/managed/jqTree/tree.jquery",
        "perfectScrollbar": "libs/managed/perfect-scrollbar/js/perfect-scrollbar.jquery.min",
        "jquery-ui": "libs/unmanaged/jquery-ui/jquery-ui.min",
        "d3": "libs/unmanaged/d3/d3",
        "rickshaw": "libs/managed/rickshaw/rickshaw.min",
        "autoNumeric": "libs/managed/autoNumeric/autoNumeric-min",
        "vis": "libs/managed/vis/dist/vis.min",
        "vis-network": "libs/managed/vis/dist/vis-network.min",
        "vis-graph": "libs/managed/vis/dist/vis-graph.min",
        "BootstrapSlider": "libs/managed/seiyria-bootstrap-slider/dist/bootstrap-slider.min",
        "localForage": "libs/managed/localforage/dist/localforage.min",
        "mixpanel": "libs/managed/mixpanel/mixpanel-jslib-snippet.min",
        "highstock": "libs/managed/highcharts/highstock",
        "bytes": "libs/unmanaged/bytes/index",
        "facebook": "//connect.facebook.net/en_US/sdk",

        /** Start nested sortable and related dependencies. **/
        "jquery-ui/sortable": "libs/unmanaged/jquery-ui/ui/widgets/sortable",
        "jquery-ui/mouse": "libs/unmanaged/jquery-ui/ui/widgets/mouse",
        "data": "libs/unmanaged/jquery-ui/ui/data",
        "ie": "libs/unmanaged/jquery-ui/ui/ie",
        "scroll-parent": "libs/unmanaged/jquery-ui/ui/scroll-parent",
        "version": "libs/unmanaged/jquery-ui/ui/version",
        "widget": "libs/unmanaged/jquery-ui/ui/widget",
        "jqueryNestedSortable": "libs/managed/nestedSortable/jquery.mjs.nestedSortable",
        /** End nested sortable and related dependencies. **/

        "modals": "libs/managed/backbone-modal/backbone.modal",
        "tooltips": "libs/managed/backbone-tooltip/src/backbone-tooltip.amd",

        "app": "app/app",
        "routeRegistration": "app/route-registration",
        "modalRegistration": "app/modal-registration"
    },

    shim: {

        facebook: {
            exports: "FB"
        },

        d3: {
            exports: "d3"
        },

        "rickshaw": {
            exports: "Rickshaw",
            deps: ["d3"]
        },

        autoNumeric: {
            deps: ["jquery"]
        },

        dropZone: {
            deps: ["jquery"]
        },

        countUp: {
            exports: "CountUp"
        },

        "underscore.string": {
            deps: ["underscore"]
        },

        toastr: {
            deps: ["jquery"]
        },

        tetherjs: {
            deps: ["jquery"],
            exports: "Tether"
        },

        bootstrap: {
            deps: ["tetherjs", "jquery"]
        },

        modals: {
            deps: ["marionette"]
        },

        queryparams: {
            "deps": ["backbone"]
        },

        backbone: {
            "deps": ["underscore", "jquery"],
            "exports": "backbone"
        },

        backbonedeep: {
            "deps": ["underscore", "backbone"],
            "exports": "backbone"
        },

        marionette: {
            "deps": ["underscore", "backbone", "jquery", "backbonedeep"],
            "exports": "marionette"
        },

        bossview: {
            "deps": ["marionette"]
        },

        typed: {
            deps: ["jquery"]
        },

        jqueryNestedSortable: {
            deps: ["jquery", "jquery-ui"]
        }

    }

});

/**
 * Tether doesn't expose itself globally, so we will force it to.
 */
require(["tetherjs"], function (Tether) {
    /**
     * We need to attach Tether to the global scope as Bootstrap looks in the global scope for tether
     */
    window.Tether = Tether;
});

/**
 * Setup and start the app.
 */
require(["app", "routeRegistration", "modalRegistration", "mixpanel", "modules/common/controllers/identity-access-management", "modules/common/controllers/compatibility-checker"], function (App, RouteRegistration, ModalRegistration, Mixpanel) {

    if (!GLOBALS.MixpanelToken) {
        throw new Error("Mixpanel token is missing");
    }

    /**
     * Setup the router for the application
     */
    var Router = Backbone.Marionette.AppRouter.extend({
        execute: function (callback, args, name) {
            Backbone.Marionette.AppRouter.prototype.execute.call(this, callback, args, name);
            App.trackEvent("page-hit", {});
        }
    });

    App.router = new Router();
    RouteRegistration.forEach(function (aRouteController) {
        App.router.processAppRoutes(aRouteController, aRouteController.appRoutes);
        if (aRouteController.registerRegexRoutes) {
            aRouteController.registerRegexRoutes();
        }
    });

    App.router.on("route", function () {
        var scrollTop = history.state && history.state.scrollTop || 0;
        $("html,body").scrollTop(scrollTop);
    });

    App.compatibilityChecker = new App.Controllers.CompatibilityChecker.Controller();

    /**
     * When the app initializes, we are going to start Backbones history engine
     */
    App.on("start", function () {

        mixpanel.init(GLOBALS.MixpanelToken);

        Backbone.history.start();
        /** If Backbone cannot find a route, redirect to the 404 page **/
        // if (!Backbone.history.start()) {
        //     /** 404 handler here **/
        //     window.location = "/#!oh-no";
        // }

        App.IdentityAccessManagement.Controller.patchBackbone();

    });

    /** ...and away we go! **/
    App.start();

});