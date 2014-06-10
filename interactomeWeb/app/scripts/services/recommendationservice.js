'use strict';
/*
 Sends abstractList to Django server. Future rec computations done out of intermediary Django layer. Results then returned back to web app. 
*/
angular.module('interactomeApp.RecommendationService', [])

.factory('RecommendationService', function RecommendationService($q, $http) {
    var service = {

        // getRecs:
        //   @abstractList: should be a list of the dynamo Id's
        //   Returns: a promise which will resolve to an array of hashes that have paper data from dynamo.
        getRecs: function(papers) {
            var defered = $q.defer();
            var abstractList = [];
            for (var i = 0; i < papers.length; i++) {
                abstractList[i] = papers[i].Id;
            }

            $http({
                method: 'POST',
                url: 'http://ec2-54-201-190-162.us-west-2.compute.amazonaws.com:8000/recs/',
                data: {
                    'list': abstractList,
                    'numAbstracts': papers.length
                }
            }).success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                // checks if fault is on Django end 
                if (data.length != 0)
                    defered.resolve(data);
                else
                    defered.reject("Internal Error");



            }).error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                deferred.reject("Connection failed");

            });

            return defered.promise;


        },

    };
    return service;
});