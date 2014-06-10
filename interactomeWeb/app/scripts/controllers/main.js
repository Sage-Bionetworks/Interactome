'use strict';
/**
    This is the main controller of the application. This controller should have logic for the main (always running?) 
    parts of the website.
**/
var app = angular.module('interactomeApp');

app.controller('MainCtrl', function($rootScope, $scope, UserService, AwsService, RecommendationService, MainCache) {
    // cachable holds any data that we need to persist between controllers.
    $scope.cachable = MainCache.get();

    // Default values needed for some functions/directives.
    // Use separate if for getting recs from different controller.
    if ($scope.cachable.papers === undefined) {
        $scope.cachable.papers = [];
        $scope.cachable.recOriginAbstracts = []; // list of abstracts the current recs are seeded from
    }

    // Default values needed for some functions/directives.
    // currentPage is not significant, could be anything except for papers and recOriginAbstracts.
    if ($scope.cachable.currentPage == undefined) {
        $scope.cachable.numPerPage = 10;
        $scope.cachable.currentPage = 1;
        $scope.cachable.selectedAbstracts = [];
        // Hash for like status, true == liked and false == disliked. Not in the hash means neither.
        $scope.cachable.paperLikeStatus = {};
    }

    $scope.modalTitle = null;
    $scope.modalFirstName = null;
    $scope.modalLastName = null;
    $scope.modalText = null;

    $scope.paginationTotalItems = 0;
    $scope.moreThanOnePage = false;
    $scope.maxSize = 10;
    $scope.filteredPapers = [];

    $scope.$on('getRecsFromTopic', function(event, topicspaperslist) {
        $scope.abstractsRecFromTopic(topicspaperslist);
    });


    // Calls RecommendationService for recommendations based off of list of abstracts
    $scope.abstractsRec = function(paperslist) {
        if (paperslist.length > 0) {
            //var abstractsChecked = $scope.selectedAbstracts.join();
            //AwsService.postMessageToSNS('arn:aws:sns:us-west-2:005837367462:abstracts_req', abstractsChecked);
            RecommendationService.getRecs(paperslist).then(function(reclist) {
                var temp = paperslist.slice(0); // copy array for rec heading
                $scope.cachable.selectedAbstracts.length = 0;
                $scope.cachable.papers.length = 0;


                // Having the logic inside of the animate causes a nice fade in for the new abstracts.
                // Since we are using jquery, we must wrap it in an $apply for angular to know about it.
                // We use  jquery here to scroll because smooth scrolling in angular is messy.
                $('body').animate({
                    scrollTop: 0
                }, 2000, function() {
                    $scope.$apply(function() {

                        $scope.cachable.recOriginAbstracts = temp; //updates the text of the abstracttitles directive
                        $scope.gettingAbstractRecs = false;
                        $scope.cachable.papers.push.apply($scope.cachable.papers, reclist);


                        //Pagination
                        $scope.cachable.currentPage = 0;
                        $scope.paginationTotalItems = $scope.cachable.papers.length;
                        $scope.moreThanOnePage = ($scope.cachable.numPerPage < $scope.paginationTotalItems);
                    })
                });

            });

        }
        // Triggers animation, will happen before .then happens (because of async)
        $scope.gettingAbstractRecs = true;
    };

    // request for recommendations from selected abstracts
    $scope.abstractsRecFromSelected = function() {
        $scope.abstractsRec($scope.cachable.selectedAbstracts);
    };

    // request for recommendations from topics
    $scope.abstractsRecFromTopic = function(topicspaperslist) {
        $scope.abstractsRec(topicspaperslist);
    };

    // Controls get-recs cancel button behavior. Let's directives know to become unselected.
    $scope.cancelSelectedAbstracts = function() {
        //$emit travels upwards so since we are using rootscope (directives have isolated scope)
        //it will not bubble to any other scopes.
        $rootScope.$emit('cancelSelectedAbstracts');
        $scope.cachable.selectedAbstracts.length = 0;
    };

    // initial setup of AWS resources (abstracts)
    AwsService.credentials().then(function() {
        // if papers already have something in them, we are using the cache. No need to hit AWS.
        if ($scope.cachable.papers.length == 0) {
            var uName = UserService.currentUsername();
            AwsService.getDynamoPref(uName).then(function(dbItem) {


                for (var i = 0; i < dbItem.Item.Likes.SS.length; i++) {
                    $scope.cachable.paperLikeStatus[dbItem.Item.Likes.SS[i]] = true;
                }
                for (var i = 0; i < dbItem.Item.Dislikes.SS.length; i++) {
                    $scope.cachable.paperLikeStatus[dbItem.Item.Dislikes.SS[i]] = false;
                }

                AwsService.getPapers(100).then(function(paperList) {
                    $scope.cachable.papers.length = 0;
                    $scope.cachable.papers.push.apply($scope.cachable.papers, paperList);
                    $scope.cachable.currentPage = 0;
                    $scope.paginationTotalItems = $scope.cachable.papers.length;
                    $scope.moreThanOnePage = ($scope.cachable.numPerPage < $scope.paginationTotalItems);
                });
            });
        } else {
            //cache was used
            $scope.cachable.currentPage = 0;
            $scope.paginationTotalItems = $scope.cachable.papers.length;
            $scope.moreThanOnePage = ($scope.cachable.numPerPage < $scope.paginationTotalItems);
        }
    });

    //cache on destroy (controllers will get destroyed on route change)
    $scope.$on('$destroy', function() {
        MainCache.set($scope.cachable)
    });
});