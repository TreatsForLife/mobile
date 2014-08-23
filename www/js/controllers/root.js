'use strict';

angular.module('clientApp')
    .controller('RootCtrl', ['$scope', '$rootScope', '$timeout', '$location', '$sce', 'Donations', 'Users', function ($scope, $rootScope, $timeout, $location, $sce, Donations, Users) {

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
                    //make sure that user_id cookie is saved
                    if (!localStorage.user_id && $rootScope.user && $rootScope.user._id) {
                        localStorage.user_id = $rootScope.user._id;
                        console.log('Saving user_id cookie', $rootScope.user._id, localStorage.user_id);
                    }
                    //make sure that user_pet_id cookie is saved
                    if (!localStorage.user_pet_id && $rootScope.user && $rootScope.user.pet && $rootScope.user.pet._id) {
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

        //make sure that the user is fetched
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

        $rootScope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }

        function onOnline(){
            $rootScope.online = true;
        }
        function onOffline(){
            $rootScope.online = false;
        }

        $scope.history = [];
        $scope.lastUrl = '';
        $rootScope.canGoBack = function(){
            return ($scope.history.length > 0)
        }
        function onBackKeyDown() {
            // Handle the back button
            $rootScope.goBack();

            //dirty trick to disable back button (nothing else seems to work)
            throw "ignore"
        }

        $rootScope.goBack = function () {
            if (!$scope.canGoBack()) {
                if ($scope.pushMenuOpen){
                    if (navigator.app) {
                        navigator.app.exitApp();
                    }
                    else if (navigator.device) {
                        navigator.device.exitApp();
                    }
                }else{
                    $rootScope.openPushMenu();
                }
                return;
            }else{
                $timeout.cancel($scope.cancelBack);
                $timeout(function () {
                    var l = $scope.history.length;
                    var path = $scope.history[l-1];
                    $scope.history = [];
                    $scope.lastUrl = '';
                    $scope.goingBack = true;
                    $location.path(path);
                }, 0);
                $scope.cancelBack = $timeout(function () {
                    $scope.goingBack = false;
                }, 2000);
            }
        }
        $rootScope.addUrlToHistory = function(url){
            $rootScope.addDummyToHistory();
            $scope.lastUrl = url;
        }
        $rootScope.addDummyToHistory = function(){
            var l = $scope.history.length;
            if ($scope.lastUrl && ($scope.history[l-1] != $scope.lastUrl)){
                $scope.history.push($scope.lastUrl);
            }
        }

        $scope.playVideo = function (src) {
            $timeout(function () {
                $scope.$broadcast('setVideoSrc', ($sce.trustAsResourceUrl(src)));
            }, 0);
        }

        $scope.pushMenuOpen = false;
        $rootScope.openPushMenu = function () {
            if ($scope.pushMenuOpen) return;
            $('body').addClass('pushed');
            $('#menuRight').addClass('cbp-spmenu-open');
            $scope.pushMenuOpen = true;
            $location.search({'push':'1'});
        };
        $rootScope.closePushMenu = function () {
            if (!$scope.pushMenuOpen) return;
            $('body').removeClass('pushed');
            $('#menuRight').removeClass('cbp-spmenu-open');
            $scope.pushMenuOpen = false;
            $location.search({'push':null});
        };

        $rootScope.$on('$routeUpdate', function(){
            if (!$location.search()['dialog']){
                $rootScope.closeDialog();
            }
            if (!$location.search()['push']){
                $rootScope.closePushMenu();
            }
        });

        $rootScope.showDialog = function(dialog){
            $timeout(function () {
                $scope.$broadcast('showTipDialog', dialog);
                $scope.$emit('showTipDialog', dialog);
            }, 0);
        }

        $rootScope.closeDialog = function(dialog){
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

        function cordovaReady(){
            document.addEventListener("backbutton", onBackKeyDown, false);
            document.addEventListener("online", onOnline, false);
            document.addEventListener("offline", onOffline, false);
        }
    }]);
