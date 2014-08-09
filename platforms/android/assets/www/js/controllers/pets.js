'use strict';

angular.module('clientApp')
    .controller('PetsCtrl', ['$scope', '$rootScope', '$timeout', '$routeParams', '$location', 'Pets', function ($scope, $rootScope, $timeout, $routeParams, $location, Pets) {

        console.log('PetsCtrl');

        $rootScope.bodyClass = 'pets';
        $scope.picHeight = $('.container').width() * 0.6;

        var filter = $scope.filter = $routeParams['filter'];

        if (filter == 'adopted') {
            $rootScope.navbarTitle = 'כלבים מאומצים';
            $scope.pets = Pets.adopted();
            $rootScope.bodyClass += ' adopted';
        } else if (filter == 'lonely') {
            $rootScope.navbarTitle = 'כלבים בודדים';
            $scope.pets = Pets.lonely();
            $rootScope.bodyClass += ' lonely';
        } else {
            if ($scope.user) {
                $location.path('/' + ($scope.user.pet ? 'pet' : 'pets/lonely'));
            } else {
                $scope.$on('userIsFetched', function () {
                    $location.path('/' + ($scope.user.pet ? 'pet' : 'pets/lonely'));
                });
            }
        }

        $scope.$on('userIsFetched', function () {
            $timeout(function () {
                if (filter == 'lonely' && !$scope.user.pet && !$scope.petsDialogShown) {
                    $scope.petsDialogShown = true;
                    $scope.showDialog('pets');
                }
            });
        });

        window.debug = $scope;
    }]);
