'use strict';
var app = angular.module('interactomeApp', [
    'ngRoute',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'interactomeApp.AwsService',
    'interactomeApp.Userservice',
    'interactomeApp.RecommendationService',
    'ui.bootstrap'
])

// Sets our AWS arn on config through Awsservice
app.config(function(AwsServiceProvider) {
    AwsServiceProvider
        .setArn(
            'arn:aws:iam::005837367462:role/interactomeRole');
});



// Has to do with csrf tokens for CORS
app.config(['$httpProvider',
    function($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }
]);

// Sets up main route to main.html when page is first loaded. 
app.config(
    function($routeProvider) {
        $routeProvider

        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
            .when('/searchView', {
                templateUrl: 'views/searchview.html',
                controller: 'SearchCtrl'


            })

    });

window.onLoadCallback = function() {
    // When the document is ready
    angular.element(document).ready(function() {
        // Bootstrap the oauth2 library, a google thing for keeping track of authentication. 
        gapi.client.load('oauth2', 'v2', function() {
            // Finally, bootstrap our angular app
            angular.bootstrap(document, ['interactomeApp']);
        });
    });
};