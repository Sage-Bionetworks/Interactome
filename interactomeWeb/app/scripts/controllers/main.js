'use strict';
/**
    This is the main controller of the application. This controller should have logic for the main (always running?) 
    parts of the website.
**/
var app = angular.module('interactomeApp');

app.controller('MainCtrl', function($scope, UserService, AwsService, RecommendationService) {
    $scope.papers = [];

    $scope.modalTitle = null;
    $scope.modalFirstName = null;
    $scope.modalLastName = null;
    $scope.modalText = null;

    $scope.paginationTotalItems = 100;
    $scope.numPerPage = 10;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
    $scope.filteredPapers = [];

    // Hash for like status, true == liked and false == disliked. Not in the hash means neither.
    $scope.paperLikeStatus = {};
    $scope.selectedAbstracts = [];

    $scope.$watch('currentPage + numPerPage + papers', function() {
        // Setting currentPage to 0 is a hack to get the recs working on page 1.
        // $watching papers only works for having papers go from null to an array.
        if ($scope.currentPage == 0)
            $scope.currentPage = 1;
        var begin = (($scope.currentPage - 1) * $scope.numPerPage);
        var end = begin + $scope.numPerPage;
        $scope.filteredPapers = $scope.papers.slice(begin, end);
    });

    // Determines what happens after one or more abstract is selected
    $scope.abstractsRec = function() {
        if ($scope.selectedAbstracts.length > 0) {
            //var abstractsChecked = $scope.selectedAbstracts.join();
            //AwsService.postMessageToSNS('arn:aws:sns:us-west-2:005837367462:abstracts_req', abstractsChecked);
            RecommendationService.getRecs($scope.selectedAbstracts).then(function(paperList) {
                $scope.selectedAbstracts.length = 0;
                $scope.papers.length = 0;
                $scope.papers.push.apply($scope.papers, paperList);
                $scope.currentPage = 0;
                $scope.paginationTotalItems = $scope.papers.length;
            });
        }
    };

    // updates abstract information for modal view
    $scope.showAbstract = function(abTitle, abAuthor, abText) {
        $scope.modalTitle = abTitle;
        $scope.modalAuthor = abAuthor;
        $scope.modalText = abText;
        $('#abstractViewModal').modal('show'); // open modal
    }

    // Setup by using AWS credentials
    AwsService.credentials().then(function() {
        var uName = UserService.currentUsername();
        AwsService.getDynamoPref(uName).then(function(dbItem) {

            for(var i = 0; i < dbItem.Item.Likes.SS.length; i++) {
                $scope.paperLikeStatus[dbItem.Item.Likes.SS[i]] = true;
            }
            for(var i = 0; i < dbItem.Item.Dislikes.SS.length; i++) {
                $scope.paperLikeStatus[dbItem.Item.Dislikes.SS[i]] = false;
            }

            AwsService.getPapers(100).then(function(paperList) {
                $scope.papers.length = 0;
                $scope.papers.push.apply($scope.papers, paperList);
            });
        });
        
    });
});

app.controller('SearchCtrl', function($scope, $location, SearchService) {
    var institution = ($location.search()).search;
    $scope.institutions = [];
    // once promise is made, then set the scope 
    SearchService.showResults(institution).then(function(userData) {
        $scope.institutions.push.apply($scope.institutions, userData);
    });

});

/*
    Controls the elements in the header (search bar, sign in).
*/
app.controller('HeaderCtrl', function($scope, $location, UserService, AwsService) {
    
    $scope.userTopics = [];
    $scope.newTopic = null;
    // This function sets the user authentication from googleSignin directive. 
    $scope.signedIn = function(oauth) {
        // Google authentication passed into userService to hold onto and track user.
        UserService.setCurrentOAuthUser(oauth).then(function(user) {
                $scope.user = user;
            });
    };

    $scope.searchSubmit = function() {
        if ($scope.searchByInstitution && $scope.searchByInstitution.length > 0) {
            var url = "/searchView";
            $location.search('search', $scope.searchByInstitution).path(url);
        }
    };

    // Setup AWS resources
    AwsService.credentials().then(function() {
        AwsService.getTopics(UserService.currentUsername()).then(function(topics) {
            $scope.userTopics.length = 0;
            $scope.userTopics.push.apply($scope.userTopics, topics);
        }, function(reason) {
            alert(reason);
        });
    });

    $scope.addTopic = function() {
        var username = UserService.currentUsername();
        var newTopic = {Name: $scope.newTopic};
        var scope = $scope;
        if($scope.newTopic == "" || $scope.newTopic === null) {
            alert("Topic name must not be empty");
        }
        else{
            AwsService.addTopic(username, $scope.newTopic).then(
                function(topicId) {
                    newTopic.Id = topicId;
                    scope.userTopics.push(newTopic);
                    scope.userTopics.sort(function(a,b) {
                        return (a['Name'].localeCompare(b['Name'], 'kn', {numeric: true, caseFirst: "lower", usage: "sort"}) >= 0);
                    });
                    console.log(scope.userTopics);
                }, 
                function(reason) {
                    alert(reason);
                }
            );
        }
        // reset to null
        $scope.newTopic = null;
    };

    $scope.hasTopicName = function(topicname) {
        var returnVal = true;
        var i = 0;
        var curLength = $scope.userTopics.length;
        while(i < curLength) { // find the correct element
            if ($scope.userTopics[i].Name == topicname) {
                break;
            }
            else{
                i++;
            }
        }
        if (i < curLength) {// return true if element found
            returnVal = true;
        }
        else {
            returnVal = false;
        }
        return returnVal;
    };

    $scope.renameTopic = function(topicid, topicname) {
        var i = 0;
        var curLength = $scope.userTopics.length;
        while(i < curLength) { // find the correct element
            if ($scope.userTopics[i].Id == topicid) {
                break;
            }
            else{
                i++;
            }
        }
        if (i < curLength) {// delete element if found
            $scope.userTopics[i].Name = topicname;
        }
    };

    $scope.deleteTopic = function(topicid) {
        var i = 0;
        var curLength = $scope.userTopics.length;
        while(i < curLength) { // find the correct element
            if ($scope.userTopics[i].Id == topicid) {
                break;
            }
            else{
                i++;
            }
        }
        if (i < curLength) {// delete element if found
            $scope.userTopics.splice(i, 1);
        }
    }
});