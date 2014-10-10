'use strict';

angular.module('clientApp')
    .controller('ThanksCtrl', ['$scope', 'Pets', 'Donations', 'Treats', 'Users', '$rootScope', '$stateParams', '$timeout', '$interval', '$sce', '$location', function ($scope, Pets, Donations, Treats, Users, $rootScope, $stateParams, $timeout, $interval, $sce, $location) {

        console.log('ThanksCtrl');

        $rootScope.bodyClass = 'pet';
        $scope.buttonAnimationReady = false;

        //search pet in route or in cookie

        function init() {
            if ($rootScope.user) {
                $scope.getPetId();
            } else {
                $scope.$on('userIsFetched', function () {
                    //check if the user has a pet
                    $scope.getPetId();
                });
            }
        }

        $scope.getPetId = function () {
            $scope.pet_id = $stateParams['id'] || $rootScope.user_pet_id;
            if (!$scope.pet_id && $rootScope.user && $rootScope.user.pet && $rootScope.user.pet._id) {
                $scope.pet_id = $rootScope.user.pet._id;
            }
            if (!$scope.pet_id) {
                $location.path('/pets');
            } else {
                $timeout(function(){
                    $scope.showAnimation();
                },3000);
            }
        }

        $scope.showAnimation = function(){
            if ($stateParams['adopt']){
                if ($stateParams['adopt']=='adopt'){
                    var callback = function(){
                        $scope.adopted();
                        $location.path('/pet/' + $scope.pet_id);
                    }
                }else{
                    var callback = function(){
                        $scope.bought();
                        $location.path('/pet/' + $scope.pet_id);
                    }
                }
                $scope.animateAdoptionButton(callback);
            }
        }

        var woof = new Audio('http://www.sounddogs.com/previews/101/mp3/121537_SOUNDDOGS__do.mp3');
        $timeout(function(){
            woof.load();
            woof.volume = 0.5;
        });
        $scope.woof = function(){
            woof.play();
        }

        $scope.animateAdoptionButton = function (callback) {
            $scope.woof();
            $timeout(function () {
                $scope.showAdoptionAnimation = true;
                $('.pet-adopted-button').addClass('animated fadeIn');

                //frame dimension 423x633
                var ar = 423/633;
                var ww = $scope.windowWidth - 80;
                var wh = $scope.windowHeight - 80;
                var wr = ww/wh;
                if (ar < wr){
                    //match height
                    $scope.adoptAnimationHeight = wh;
                    $scope.adoptAnimationWidth = parseInt(wh * ar);
                    $scope.adoptAnimationHeight = ww / ar;
                }else{
                    //match width
                    $scope.adoptAnimationWidth = ww;
                    $scope.adoptAnimationHeight = ww / ar;
                }

                var animationDuration = 4500;
                var numOfFrames = 70;
                var frame = numOfFrames;
                var dim = $scope.adoptAnimationWidth;
                var animationBgPosition = 0;
                $('.pet-adopted-button').css({
                    'background-size':($scope.adoptAnimationWidth * numOfFrames) + 'px auto',
                    'width': $scope.adoptAnimationWidth + 'px',
                    'height': $scope.adoptAnimationHeight + 'px'
                });
                $timeout(function () {
                    var animationInterval = $interval(function () {
                        if (frame == 0) {
                            $interval.cancel(animationInterval);
                            $('.pet-adopted-button').removeClass('fadeIn').addClass('fadeOut');
                            $timeout(function () {
                                $scope.showAdoptionAnimation = false;
                                callback();
                            }, 1000);
                            return;
                        }
                        $('.pet-adopted-button').css('background-position-x', -1 * animationBgPosition);
                        frame--;
                        animationBgPosition += dim;
                    }, (animationDuration / numOfFrames))
                }, 2500);
            })
        }

        $scope.adopted = function () {
            var pet_link = Consts.client_root + '#/pet/' + $scope.pet_id;
            facebookConnectPlugin.showDialog({
                method: 'feed',
                app_id: Consts.fb_app_id,
                display: ($scope.isWeb ? 'popup' : 'touch'),
                link: pet_link,//$scope.pet.media.link,
                picture: $scope.pet.media.image,
                name: 'אתם לא מבינים מה עשיתי הרגע',
                caption: 'אימצתי כלב! קוראים לו ' + $scope.pet.name + ' ולא הוא לא יבוא אליי הביתה. לא כרגע לפחות.. אבל הולך לקבל ים פינוקים ממני.',
                description: ' ',
                actions: [
                    {name: 'בואו לראות אותי', link: pet_link}
                ]
            }, function (response) {
            });
        }

        $scope.bought = function () {
            var pet_link = Consts.client_root + '#/pet/' + $scope.pet_id;
            facebookConnectPlugin.showDialog({
                method: 'feed',
                app_id: Consts.fb_app_id,
                display: ($scope.isWeb ? 'popup' : 'touch'),
                link: pet_link,//$scope.pet.media.link,
                picture: $scope.pet.media.image,
                name: 'כל הזמן רק לפנק לפנק לפנק',
                caption: 'הרגע קניתי ל' + $scope.pet.name + ' מתנה קטנה. בואו לראות!',
                description: ' ',
                actions: [
                    {name: 'בואו לראות אותי', link: pet_link}
                ]
            }, function (response) {
            });
        }


        init();

        window.debug = $scope;

    }]);

