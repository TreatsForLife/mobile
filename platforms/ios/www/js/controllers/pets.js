'use strict';

angular.module('clientApp')
    .controller('PetsCtrl', ['$scope', '$rootScope', '$timeout', '$stateParams', '$location', 'Pets', function ($scope, $rootScope, $timeout, $stateParams, $location, Pets) {

        console.log('PetsCtrl');

        $rootScope.bodyClass = 'pets';
        $scope.picHeight = $('.container').width() * 0.6;

        var filter = $scope.filter = $stateParams['filter'];

        if (filter == 'adopted') {
            $rootScope.navbarTitle = 'כלבים מאומצים';
            $scope.pets = Pets.adopted();
            $rootScope.bodyBg = 'adopted';
            $rootScope.currentPage = ('/pets/adopted');
        } else if (filter == 'lonely') {
            $rootScope.navbarTitle = 'כלבים בודדים';
            $scope.pets = Pets.lonely();
            $rootScope.bodyBg = 'lonely';
            $rootScope.currentPage = ('/pets/lonely');
        } else {
            if ($scope.user) {
                $location.path('/' + ($scope.user.pet ? 'pet/'+$scope.user.pet : 'pets/lonely'));
            } else {
                $scope.$on('userIsFetched', function () {
                    $location.path('/' + ($scope.user.pet ? 'pet/'+$scope.user.pet : 'pets/lonely'));
                });
            }
        }

        $scope.$on('userIsFetched', function () {
            $timeout(function () {
                if (filter == 'lonely' && !$scope.user.pet && !$scope.petsDialogShown) {
                    $scope.petsDialogShown = true;
                    $scope.showDialogIfNeeded('pets');
                }
            });
        });

        window.debug = $scope;
    }]);
