'use strict';

angular.module('clientApp')
    .controller('RootCtrl', ['$scope', '$rootScope', '$timeout', '$interval', '$location', '$sce', '$http', 'Donations', 'Users', function ($scope, $rootScope, $timeout, $interval, $location, $sce, $http, Donations, Users) {

        console.log('APP VERSION: 1.0');

        $scope.isWeb = $(window).width() > 700;

        console.log('Getting data from cookies', localStorage);
        $rootScope.fb_id = localStorage.fb_id;
        $rootScope.user_id = localStorage.user_id;
        $rootScope.user_pet_id = localStorage.user_pet_id;

        $rootScope.getUser = function () {
            Users.query({id: $rootScope.user_id}, function (user) {
                if (user._id) {
                    console.log('Found user in DB', user);
                    $rootScope.user = user;
                    $scope.$broadcast('userIsFetched');
                    //make sure that user_id cookie is correct
                    if ($rootScope.user && $rootScope.user._id) {
                        localStorage.user_id = $rootScope.user._id;
                        console.log('Saving user_id cookie', $rootScope.user._id, localStorage.user_id);
                    }
                    //make sure that user_pet_id cookie is correct
                    if ($rootScope.user && $rootScope.user.pet && $rootScope.user.pet._id) {
                        localStorage.user_pet_id = $rootScope.user.pet._id;
                        console.log('Saving user_pet_id cookie', $rootScope.user.pet._id, localStorage.user_pet_id);
                    }
                } else {
                    console.log('No user in DB - redirecting to welcome screen', localStorage);
                    localStorage.setItem("returnUrl", $location.path())
                    $location.path('/welcome');
                }
            }, function(){
                console.log('DB failure - redirecting to welcome screen', localStorage);
                $location.path('/welcome');
            });
        }

        $scope.logoAnimationComplete = false;
        $scope.animateLogo = function () {
            var animationDuration = 1700;
            var numOfFrames = 48;
            var frame = numOfFrames;
            var dim = 266;
            var animationBgPosition = 0;
            $('.not-online-logo-animation').css('background-size', ($scope.logoWidth * numOfFrames) + 'px auto');
            var animationInterval = $interval(function () {
                if (frame == 0) {
                    $interval.cancel(animationInterval);
                    $timeout(function(){
                        $scope.logoAnimationComplete = true;
                        $rootScope.notOnlineAnimationCompleted = true;
                    },500);
                    return;
                }
                $('.not-online-logo-animation').css('background-position-x', -1 * animationBgPosition);
                frame--;
                animationBgPosition += dim;
            }, (animationDuration / numOfFrames))
        }
        $timeout(function(){
            $scope.animateLogo();
        }, 0);
        function onOnline(){
            if ($rootScope.online == false){
                $rootScope.online = true;
                if (!$rootScope.user && $rootScope.user_id) {
                    console.log('No user but user_id cookie is found - fetching from DB');
                    $timeout(function () {
                        $rootScope.getUser();
                    })
                } else if (!$rootScope.user_id) {
                    console.log('No user_id cookies found - redirecting to welcome screen', localStorage);
                    localStorage.setItem("returnUrl", $location.path())
                    $location.path('/welcome');
                }
            }
        }

        $rootScope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }

        $rootScope.reloadApp = function(){
            top.location.reload();
        }

        function onOffline(){
            $rootScope.online = false;
        }

        $scope.history = [];
        $scope.lastUrl = '';
        $rootScope.currentPage = '';
        $rootScope.currentPet = '';

        $rootScope.getBackPage = function(){
            var path = '';
            switch ($rootScope.currentPage){
                case 'shop':
                    path = 'pet/' + $scope.currentPet;
                    break;
                case 'adopted':
                    path = 'pets/adopted';
                    break;
                case 'lonely':
                    path = 'pets/lonely';
                    break;
                default:
                    return false;
                    break;
            }
            return path;
        }

        var backKeyDown = false;
        function onBackKeyDown() {
            // Handle the back button
            $rootScope.goBack();
            backKeyDown = true;

            //dirty trick to disable back button (nothing else seems to work)
            throw "ignore"
        }

        $scope.shouldCloseApp = false;
        $rootScope.goBack = function () {
            if ($scope.cartIsUp || $scope.pushMenuOpen || $scope.dialogShown){
                $scope.cartIsUp = false;
                $rootScope.closePushMenu();
                $rootScope.closeDialog();
            }else{
                var goto = $rootScope.getBackPage();

                if (!goto) {
                    if($scope.shouldCloseApp && backKeyDown){
                        $scope.shouldCloseApp = false;
                        if (navigator.app) {
                            navigator.app.exitApp();
                        }
                        else if (navigator.device) {
                            navigator.device.exitApp();
                        }
                    }else{
                        $rootScope.openPushMenu();
                        if (backKeyDown) $scope.shouldCloseApp = true;
                    }
                }else{
                    $scope.shouldCloseApp = false;
                    $timeout.cancel($scope.cancelBack);
                    $timeout(function () {
                        $scope.goingBack = true;
                        $timeout(function () {
                            $location.path(goto);
                        }, 0);
                    }, 0);
                    $scope.cancelBack = $timeout(function () {
                        $scope.goingBack = false;
                    }, 5000);
                }
            }
            backKeyDown = false;
        }
/*
        $scope.playVideo = function (src) {
            $timeout(function () {
                $scope.$broadcast('playVideoSrc', src);
            }, 0);
        }
        $scope.setVideo = function (src) {
            $timeout(function () {
                $scope.$broadcast('setVideoSrc', src);
            }, 0);
        }
*/



        $scope.pushMenuOpen = false;
        $rootScope.openPushMenu = function () {
            if ($scope.pushMenuOpen) return;
            $('body').addClass('pushed');
            $('#menuRight').addClass('cbp-spmenu-open');
            $scope.pushMenuOpen = true;
        };
        $rootScope.closePushMenu = function () {
            if (!$scope.pushMenuOpen) return;
            $('body').removeClass('pushed');
            $('#menuRight').removeClass('cbp-spmenu-open');
            $scope.pushMenuOpen = false;
        };

        $rootScope.$on('$routeUpdate', function(){
            if (!$location.search()['dialog']){
                $rootScope.closeDialog();
            }
        });

        $rootScope.showDialog = function(dialog){
            $scope.dialogShown = true;
            $timeout(function () {
                $scope.$broadcast('showTipDialog', dialog);
                $scope.$emit('showTipDialog', dialog);
            }, 0);
        }

        $rootScope.closeDialog = function(dialog){
            $scope.dialogShown = false;
            $timeout(function () {
                $scope.$broadcast('closeTipDialog', dialog);
                $scope.$emit('closeTipDialog', dialog);
            }, 0);
        }


        $timeout(function () {
            $scope.canAnimate = true;
            $rootScope.windowHeight = $(window).height();
            $rootScope.windowWidth = $(window).width();
            $rootScope.containerWidth = $('.container').width();
            $rootScope.picHeight = $('.container').width() * 0.6;
            document.addEventListener("deviceready", cordovaReady, false);
        }, 5);

        $timeout(function () {
            window.scrollTo(0, 1);
        }, 1000);

        $scope.$on("$stateChangeStart", function (scope, next, current) {
            $scope.cartIsUp = false;
            $rootScope.closePushMenu();
            $rootScope.closeDialog();
        });

        //check internet connection (start online, ping api server - if success stay online. in any case after 3 seconds, go offline
        checkNetworkStatus();
        onOffline();
        var offlineInterval = $interval(function(){
            checkNetworkStatus();
        }, 5000);
        function checkNetworkStatus(){
            $http.get(Consts.api_root + 'ping').success(function(){
                $interval.cancel(offlineInterval);
                onOnline();
            }).error(function(){
                onOffline();
            });
        }

        function cordovaReady(){
            document.addEventListener("backbutton", onBackKeyDown, false);
            document.addEventListener("online", onOnline, false);
            document.addEventListener("offline", onOffline, false);
        }
    }]);
