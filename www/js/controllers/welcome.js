'use strict';

angular.module('clientApp')
    .controller('WelcomeCtrl', ['$scope', '$rootScope', '$timeout', '$interval', '$location', 'Users', function ($scope, $rootScope, $timeout, $interval, $location, Users) {
        $rootScope.bodyClass = 'welcome';

        $scope.placeLogo = function (iterations) {
            if (typeof iterations == 'undefined') iterations = 5;
            $timeout(function () {
                if ($('.welcome-app-explained').length > 0) {
                    $rootScope.windowHeight = $(window).height();
                    $rootScope.windowWidth = $(window).width();

                    $scope.logoSpace = parseInt($rootScope.windowHeight - $('.bottom-wrapper').height());
                    $scope.logoHeight = parseInt((($scope.logoSpace - 80) > 370) ? 370 : ($scope.logoSpace - 80));

                    $scope.logoWidth = parseInt($scope.logoHeight / 370 * 266) + 'px';
                    $scope.logoMargin = parseInt(($scope.logoSpace - $scope.logoHeight) / 2) + 'px auto';

                    $scope.logoSpace += 'px';
                    $scope.logoHeight += 'px';
                }
                if (iterations > 0) {
                    $timeout(function () {
                        $scope.placeLogo(iterations - 1);
                    }, 1000);
                }
            });
        }

        $scope.logoAnimationComplete = false;
        $scope.animateLogo = function () {
            var animationDuration = 1700;
            var numOfFrames = 48;
            var frame = numOfFrames;
            var dim = $scope.logoWidth
            var animationBgPosition = 0;
            var animationInterval = $interval(function () {
                if (frame == 0) {
                    $interval.cancel(animationInterval);
                    $timeout(function(){
                        $scope.logoAnimationComplete = true;
                    });
                    return;
                }
                $('.welcome-logo-animation').css('background-position-x', -1 * animationBgPosition);
                frame--;
                animationBgPosition += dim;
            }, (animationDuration / numOfFrames))
        }
        $timeout(function(){
            $scope.animateLogo();
        }, 500);

        $scope.fbLogin = function () {
//            localStorage.setItem('fb', true);
//            console.log(localStorage);
//            $location.path('/');
            facebookConnectPlugin.login(['email'], function (response) {
                console.log('FB login responded', response);
                if (response.authResponse) {
//                    console.log('Welcome!  Fetching your information.... ');
//                    $cookies['fb_at'] = response.authResponse.accessToken;
                    var fb_id = response.authResponse.userID;
                    localStorage.setItem('fb_id', fb_id);
                    console.log('saved fb_id cookie', localStorage['fb_id'], response.authResponse.userID);
                    facebookConnectPlugin.api('/me', ['email'], function (response) {
                        console.log('fetched /me data from facebook - creating user', response);
                        Users.create({fb_id: fb_id, name: response.name, email: response.email, image: 'https://graph.facebook.com/' + response.username + '/picture'}, function (user) {
                            console.log('user created', user);
                            storeUserAndRedirect(user);
                        });
                    });
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            });
        }

        $timeout(function () {
            facebookConnectPlugin.getLoginStatus(function (response) {
                console.log('Response arrived from facebook', response);
                if (response.status === 'connected') {
                    console.log('the user is logged in and has authenticated your app', response.authResponse);
                    var fb_id = response.authResponse.userID;
                    localStorage.setItem('fb_id', fb_id);
                    var user = $rootScope.user;
                    if (user) {
                        console.log('User found in scope', $rootScope.user);
                        storeUserAndRedirect(user)
                    } else {
                        console.log('User not found in scope - fetching from db - by fb_id', response.authResponse.userID);
                        Users.all({fb_id: response.authResponse.userID}, function (users) {
                            console.log('Users found in db', users);
                            user = users[0];
                            if (user){
                                console.log('User found in db', user);
                                storeUserAndRedirect(user);
                            }else{
                                facebookConnectPlugin.api('/me', ['email'], function (response) {
                                    console.log('fetched /me data from facebook - creating user', response);
                                    Users.create({fb_id: fb_id, name: response.name, email: response.email, image: 'https://graph.facebook.com/' + response.username + '/picture'}, function (user) {
                                        console.log('user created', user);
                                        storeUserAndRedirect(user);
                                    });
                                });
                            }
                        });
                    }
                } else if (response.status === 'not_authorized') {
                    console.log('the user is logged in to Facebook, but has not authenticated your app');
                } else {
                    console.log('the user isnt logged in to Facebook');
                }
            });

        }, 500);

        function storeUserAndRedirect(user) {
            console.log('storeUserAndRedirect called', user);
            if (typeof user == 'undefined' || !user || !user._id) return;
            localStorage.setItem('user_id', user._id);
            console.log('saved user_id cookie', localStorage['user_id'], user._id);
            $rootScope.user = user;
            console.log('saved user to scope', $rootScope.user, user);
            if (user.pet) {
                localStorage.setItem('user_pet_id', (user.pet ? user.pet._id : ''));
                console.log('saved user_pet_id cookie', localStorage['user_pet_id'], user.pet._id);
            }
            var returnUrl = localStorage.returnUrl;
            console.log('got return url from local storage', returnUrl);
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
