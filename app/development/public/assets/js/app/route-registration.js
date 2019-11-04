define(function(require) {

    /**
     *  This script registers all the routes with the main Marionette router.
     *
     *  Each page controls its own routes (see a page's "controllers" folder). This scripts is where
     *  the developer must explicitly register each of these page routers with the main router.
     *
     * @type {*}
     * @memberOf App
     * @name RouteRegistration
     * @protected
     */
    var App = require("app");

    /**
     *  By requiring the main file controlling each page, we are getting Marionette to register
     *  the namespaces or module contained within them. If we don't require them first, we cannot
     *  access them through the App.Functional... system.
     */
    var LandingPageModule = require("modules/pages/landing-page/controllers/route-controller");
    var ErrorPageModule = require("modules/pages/error-page/controllers/route-controller");
    var ResultsPageModule = require("modules/pages/visualize-page/controllers/route-controller");
    var ContributionInfoPageModule = require("modules/pages/contribution-info-page/controllers/route-controller");
    var AdminDiagnosticsModule = require("modules/pages/admin-diagnostics-page/controllers/route-controller");
    var AdminLoginModule = require("modules/pages/admin-login-page/controllers/route-controller");
    var AboutPageModule = require("modules/pages/about/controllers/route-controller");
    var TheResearchPageModule = require("modules/pages/the-research-page/controllers/route-controller");
    var ThePublicAPIPageModule = require("modules/pages/the-public-api-page/controllers/route-controller");
    var DemoGraphModule = require("modules/pages/demo-graph/controllers/route-controller");
    var AdminBulkContributionRequestModule = require("modules/pages/admin-bulk-contributions-requests-page/controllers/route-controller");
    var AdminBulkUploadedFilesModule = require("modules/pages/admin-bulk-uploaded-files-page/controllers/route-controller");
    var BulkContributionsModule = require("modules/pages/bulk-contributions-page/controllers/route-controller");
    var SearchPageModule = require("modules/pages/search-page/controllers/route-controller");
    var BrowsePageModule = require("modules/pages/browse/browse-page/controllers/route-controller");
    var BrowseCategoryPageModule = require("modules/pages/browse/browse-category-page/controllers/route-controller");
    var BrowseSourcePageModule = require("modules/pages/browse/browse-source-page/controllers/route-controller");
    var BrowseTagPageModule = require("modules/pages/browse/browse-tag-page/controllers/route-controller");
    var ContactPageModule = require("modules/pages/contact-page/controllers/route-controller");
    var AdminDuplicateTimeseriesPageModule = require("modules/pages/admin-duplicate-timeseries-page/controllers/route-controller");
    var AdminSearchTimeseriesPageModule = require("modules/pages/admin-search-timeseries-page/controllers/route-controller");
    var AdminSourcesPageModule = require("modules/pages/admin-sources-page/controllers/route-controller");
    var AdminTagsPageModule = require("modules/pages/admin-tags-page/controllers/route-controller");
    var AdminCategoriesPageModule = require("modules/pages/admin-categories-page/controllers/route-controller");
    var SuccessPageModule = require("modules/pages/success-page/controllers/route-controller");
    var AdminContributorsPageModule = require("modules/pages/admin-contributors-page/controllers/route-controller");
    var AdminModerationPageModule = require("modules/pages/admin-moderation-page/controllers/route-controller");
    var AdminDashboardPageModule = require("modules/pages/admin-dashboard-page/controllers/route-controller");

    /** Add routes here and add to routeToInclude array **/
    var MLandingPage = App.module("LandingPage");
    var MErrorPage = App.module("ErrorPage");
    var MResultsPage = App.module("VisualizePage");
    var MContributionInfoPage = App.module("ContributionInfoPage");
    var MAdminDiagnosticsPage = App.module("AdminDiagnosticsPage");
    var MAdminLoginPage = App.module("AdminLoginPage");
    var MAboutPage = App.module("AboutPage");
    var MTheResearchPage = App.module("TheResearchPage");
    var MThePublicAPIPage = App.module("ThePublicAPIPage");
    var MDemoGraph = App.module("DemoGraph");
    var MAdminBulkContributionRequests = App.module("AdminBulkContributionRequests");
    var MAdminBulkUploadedFiles = App.module("AdminBulkUploadedFiles");
    var MBulkContributions = App.module("BulkContributions");
    var MSearchPage = App.module("SearchPage");
    var MBrowsePage = App.module("BrowsePage");
    var MBrowseCategoryPage = App.module("Browse.BrowseCategoryPage");
    var MBrowseSourcePage = App.module("Browse.BrowseSourcePage");
    var MBrowseTagPage = App.module("Browse.BrowseTagPage");
    var MContactPage = App.module("ContactPage");
    var MAdminDuplicateTimeseriesPage = App.module("AdminDuplicateTimeseriesPage");
    var MAdminSearchTimeseriesPage = App.module("AdminSearchTimeseriesPage");
    var MAdminSourcesPage = App.module("AdminSourcesPage");
    var MAdminTagsPage = App.module("AdminTagsPage");
    var MAdminCategoriesPage = App.module("AdminCategoriesPage");
    var MSuccessPage = App.module("SuccessPage");
    var MAdminContributorsPage = App.module("AdminContributorsPage");
    var MAdminModerationPage = App.module("AdminModerationPage");
    var MAdminDashboardPageModule = App.module("AdminDashboardPageModule");

    /** We return an array of all the route controllers we are later going to combine into one **/
    return [
        new MLandingPage.RouteController(),
        new MErrorPage.RouteController(),
        new MResultsPage.RouteController(),
        new MContributionInfoPage.RouteController(),
        new MAdminDiagnosticsPage.RouteController(),
        new MAdminLoginPage.RouteController(),
        new MAboutPage.RouteController(),
        new MTheResearchPage.RouteController(),
        new MDemoGraph.RouteController(),
        new MAdminBulkContributionRequests.RouteController(),
        new MAdminBulkUploadedFiles.RouteController(),
        new MBulkContributions.RouteController(),
        new MBulkContributions.RouteController(),
        new MSearchPage.RouteController(),
        new MBrowsePage.RouteController(),
        new MBrowseCategoryPage.RouteController(),
        new MBrowseSourcePage.RouteController(),
        new MBrowseTagPage.RouteController(),
        new MContactPage.RouteController(),
        new MAdminDuplicateTimeseriesPage.RouteController(),
        new MAdminSearchTimeseriesPage.RouteController(),
        new MAdminSourcesPage.RouteController(),
        new MAdminTagsPage.RouteController(),
        new MAdminCategoriesPage.RouteController(),
        new MSuccessPage.RouteController(),
        new MAdminContributorsPage.RouteController(),
        new MAdminModerationPage.RouteController(),
        new MAdminDashboardPageModule.RouteController(),
        new MThePublicAPIPage.RouteController()
    ];
});