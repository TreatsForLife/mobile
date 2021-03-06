'use strict';

angular.module('clientApp')
    .controller('RootCtrl', ['$scope', '$rootScope', '$state', '$timeout', '$interval', '$location', '$sce', '$http', 'Donations', 'Users', function ($scope, $rootScope, $state, $timeout, $interval, $location, $sce, $http, Donations, Users) {

        console.log('APP VERSION: 1.0');

        //Global scope vars
        $rootScope.isWeb = $(window).width() > 700;
        $rootScope.isIphone = (navigator.userAgent.indexOf('iPhone')>0);


        //get localstorage data
        console.log('Getting data from cookies', localStorage);
        $rootScope.fb_id = localStorage.fb_id;
        $rootScope.user_id = localStorage.user_id;
        $rootScope.user_pet_id = localStorage.user_pet_id;


        //General utils functions
        $rootScope.trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        }
        $rootScope.reloadApp = function(){
            top.location.reload();
        }
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
                    localStorage.clear();
                    localStorage.setItem("returnUrl", $location.path())
                    $location.path('/welcome');
                }
            }, function(){
                console.log('DB failure - redirecting to welcome screen', localStorage);
                $location.path('/welcome');
            });
        }
        $rootScope.showDialog = function(dialog){
            $scope.dialogShown = true;
            $timeout(function () {
                $scope.$broadcast('showTipDialog', dialog);
                $scope.$emit('showTipDialog', dialog);
            }, 0);
        }
        $rootScope.showDialogIfNeeded = function(dialog){
            if (typeof(localStorage[dialog + '-dialog-shown']) == 'undefined') {
                localStorage[dialog + '-dialog-shown'] = 'shown';
                $rootScope.showDialog(dialog);
            }

        }
        $rootScope.closeDialog = function(dialog){
            $scope.dialogShown = false;
            $timeout(function () {
                $scope.$broadcast('closeTipDialog', dialog);
                $scope.$emit('closeTipDialog', dialog);
            }, 0);
        }
        $rootScope.fbShare = function (link, picture, name, caption, action, callback) {
            //$scope.showDialog('share-disabled');
            //return true;
            facebookConnectPlugin.showDialog({
                method: 'feed',
                app_id: Consts.fb_app_id,
                display: ($scope.isWeb ? 'popup' : 'touch'),
                link: link,
                picture: picture,
                name: name,
                caption: caption,
                description: ' ',
                actions: [
                    {name: action, link: link}
                ]
            }, function (response) {
                if (angular.isFunction(callback)) callback(response);
            });
        }
        $rootScope.runAnimation = function (selector, duration, frames, dim, callback) {
            $(selector).css('background-size', (dim * frames) + 'px auto');
            var frame = frames;
            var animationBgPosition = 0;
            var animationInterval = $interval(function () {
                if (frame == 0 && (angular.isFunction(callback))) {
                    $interval.cancel(animationInterval);
                    $timeout(function() {
                        callback();
                    });
                    $timeout(function() {
                        $(selector).css('background-position-x', 0);
                    }, 1000);
                    return;
                }
                $(selector).css('background-position-x', -1 * animationBgPosition);
                frame--;
                animationBgPosition += dim;
            }, (duration / frames))
        }
        $rootScope.goto = function(link){
            if (link.indexOf('http')==0){
                window.open(link, '_system');
            }else if (link.indexOf('#')==0){
                location.href = link;
            }else{
                if ($location.path() == link) {
                    $state.reload();
                }else{
                    $location.path(link);
                }
            }
        }
                             


        //history management
        $scope.history = [];
        $scope.lastUrl = '';
        $rootScope.currentPage = '';
        $rootScope.currentPet = '';
        var backKeyDown = false;
        function onBackKeyDown() {
            // Handle the back button
            backKeyDown = true;
            var preventDefault = $rootScope.goBack();
            backKeyDown = false;

            if (preventDefault){
                //dirty trick to disable back button (nothing else seems to work)
                throw "ignore"
            }

        }
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
        $scope.shouldCloseApp = false;
        $rootScope.goBack = function () {
            if ($scope.cartIsUp || $scope.pushMenuOpen || $scope.dialogShown){
                $scope.cartIsUp = false;
                $rootScope.closePushMenu();
                $rootScope.closeDialog();
                return true;
            }else{
                var goto = $rootScope.getBackPage();

                if (!goto) {
                    if(backKeyDown){
/*
                        if (navigator.app) {
                            navigator.app.exitApp();
                        }
                        else if (navigator.device) {
                            navigator.device.exitApp();
                        }
*/
                        return false;
                    }else{
                        $rootScope.openPushMenu();
                        if (backKeyDown) $scope.shouldCloseApp = true;
                        return true;
                    }
                }else{
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
                    return true;
                }
            }
        }


        //dialogs and push menu
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
        $scope.$on("$stateChangeStart", function (scope, next, current) {
            console.log('Start changing route from: ' + current + ' to: ' + next);
            $scope.cartIsUp = false;
            $rootScope.closePushMenu();
            $rootScope.closeDialog();
        });
        $scope.$on("$stateChangeSuccess", function (scope, next, current) {
            console.log('Changed route from: ' + current + ' to: ' + next);
        });


        //loading screen
        $scope.logoAnimationComplete = false;
        $scope.animateSplashScreen = function () {
            $rootScope.runAnimation('.not-online-logo-animation', 1700, 48, 266, function(){
                $timeout(function(){
                    $scope.logoAnimationComplete = true;
                    $rootScope.notOnlineAnimationCompleted = true;
                }, 1000);
            });
        }
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
        function onOffline(){
            $rootScope.online = false;
        }
        function checkNetworkStatus(){
            $http.get(Consts.api_root + 'ping').success(function(){
                $interval.cancel(offlineInterval);
                onOnline();
            }).error(function(){
                onOffline();
            });
        }
        checkNetworkStatus();
        onOffline();
        var offlineInterval = $interval(function(){
            checkNetworkStatus();
        }, 5000);
        $timeout(function(){
            $scope.animateSplashScreen();
        }, 0);

        window.handlePushRegistration = function(platform, push_token){
            var res = Users.update({_id:$scope.user_id, platform: platform, push_token: push_token});
            console.log("Update push data", res);
        }

        //app init
        function cordovaReady(){
            document.addEventListener("backbutton", onBackKeyDown, false);
            document.addEventListener("online", onOnline, false);
            document.addEventListener("offline", onOffline, false);

            initPushNotifications();
        }
        function init(){
            $scope.canAnimate = true;
            $rootScope.windowHeight = $(window).height();
            $rootScope.windowWidth = $(window).width();
            $rootScope.containerWidth = $('.container').width();
            $rootScope.picHeight = $('.container').width() * 0.6;
            document.addEventListener("deviceready", cordovaReady, false);
            FastClick.attach(document.body);
            $timeout(function () {
                window.scrollTo(0, 1);
            }, 1000);
        }
        $timeout(function () {
            init();
        }, 5);

    }]);
