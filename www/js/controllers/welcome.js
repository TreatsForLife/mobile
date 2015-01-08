'use strict';

angular.module('clientApp')
    .controller('WelcomeCtrl', ['$scope', '$rootScope','$http', '$timeout', '$interval', '$location', 'Users', function ($scope, $rootScope, $http , $timeout, $interval, $location, Users) {

        console.log('WelcomeCtrl');

        $rootScope.bodyClass = 'welcome';
        $rootScope.bodyBg = 'welcome';

        var username = '';

        $scope.placeLogo = function (iterations) {
            if (typeof iterations == 'undefined') iterations = 5;
            $timeout(function () {
                if ($('.welcome-app-explained').length > 0) {
                    $rootScope.windowHeight = $(window).height();
                    $rootScope.windowWidth = $(window).width();

                    $scope.logoSpace = parseInt($rootScope.windowHeight - $('.bottom-wrapper').height()) - 20;
                    $scope.logoHeight = parseInt((($scope.logoSpace - 80) > 370) ? 370 : ($scope.logoSpace - 80));

                    $scope.logoWidth = parseInt($scope.logoHeight / 370 * 266);
                    $scope.logoHeight = 370 * $scope.logoWidth / 266 ;
                    $scope.logoMargin = parseInt(($scope.logoSpace - $scope.logoHeight) / 2);

                    $scope.logoSpacePX = $scope.logoSpace + 'px';
                    $scope.logoHeightPX = $scope.logoHeight + 'px';
                    $scope.logoMarginPX = $scope.logoMargin +  'px auto';
                    $scope.logoWidthPX = $scope.logoWidth + 'px';
                }
                if (iterations > 0) {
                    $timeout(function () {
                        $scope.placeLogo(iterations - 1);
                    }, 1000);
                }
            });
        }

        $scope.register = function () {
            //if (!$scope.online) return;
            $http.post(Consts.api_root + 'register', {
                username: $scope.loginData.username,
                email: $scope.loginData.email,
                password: $scope.loginData.password
            }).success(function (user) {
                console.log('Register responded', user);

                username =  $scope.loginData.username;
                //fb_at = response.authResponse.accessToken;
                localStorage.setItem('username',  $scope.loginData.username);
                console.log('saved username', localStorage['username'],  $scope.loginData.username);
                storeUserAndRedirect(user);
            }).error(function (err) {
                console.log('User registration failed. ' + err);
                $scope.loginData.loginError =true;
                $scope.loginData.Error = err.message;
            });
        }

        $scope.fbLogin = function () {
            //if (!$scope.online) return;
            $http.post(Consts.api_root + 'login', {
                username: $scope.loginData.username,
                password: $scope.loginData.password
            }).success(function (user) {
                console.log('FB login responded', user);

                username =  $scope.loginData.username;
                //fb_at = response.authResponse.accessToken;
                localStorage.setItem('username',  $scope.loginData.username);
                console.log('saved username', localStorage['username'],  $scope.loginData.username);
                storeUserAndRedirect(user);
            }).error(function (err) {
                console.log('User cancelled login or did not fully authorize.');
                $scope.loginData.loginError =true;
                $scope.loginData.Error = err;
            });
        }

        function storeUserAndRedirect(user) {
            console.log('storeUserAndRedirect called', user);
            if (typeof user == 'undefined' || !user || !user._id) return;
            localStorage.setItem('user_id', user._id);
            $rootScope.user_id = localStorage.user_id;
            console.log('saved user_id', localStorage['user_id'], user._id);
            $rootScope.user = user;
            console.log('saved user to root scope', $rootScope.user, user);
            if (user.pet) {
                localStorage.setItem('user_pet_id', user.pet._id);
                $rootScope.user_pet_id = localStorage.user_pet_id;
                console.log('saved user_pet_id', localStorage['user_pet_id'], user.pet._id);
            }
            var returnUrl = localStorage.returnUrl;
            if (returnUrl) console.log('got return url from local storage', returnUrl);
            $timeout(function () {
                if (returnUrl && returnUrl != '/welcome') {
                    localStorage.setItem("returnUrl", '');
                    console.log('Redirecting to return url', returnUrl);
                    $location.path(returnUrl);
                } else {
                    console.log('Redirecting to /');
                    $location.path('/');
                }
            }, 500);
        }

        window.debug = $scope;
    }]);
