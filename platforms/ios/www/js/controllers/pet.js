'use strict';

angular.module('clientApp')
    .controller('PetCtrl', ['$scope', 'Pets', 'Donations', 'Treats', 'Users', '$rootScope', '$stateParams', '$timeout', '$interval', '$sce', '$location', function ($scope, Pets, Donations, Treats, Users, $rootScope, $stateParams, $timeout, $interval, $sce, $location) {

        console.log('PetCtrl');

        $rootScope.bodyClass = 'pet';
        $scope.buttonAnimationReady = false;
        $scope.buttonClicked = false;
        $scope.picHeight = $('.container').width() * 0.6;
        $scope.grassHeight = $(window).height() - $scope.picHeight;
        $scope.cartIsUp = false;
        $scope.swipeComplete = false;

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
                $scope.getPet();
            }
        }

        $scope.getPet = function () {
            console.log('Getting pet_id: ' + $scope.pet_id);
            Pets.one({id: $scope.pet_id}, function (pet) {
                console.log('Found pet: ', pet);
                $rootScope.pet = pet;
                $rootScope.navbarTitle = pet.name;
                $scope.donations = [];
                $scope.donations[0] = pet;

                $scope.initButtonInterval();

                console.log('Getting given donations: ' + $scope.pet_id);
                Donations.given({pet_id: $scope.pet_id}, function (res) {
                    console.log('Found given donations: ', res);
                    $timeout(function () {
                        for (var i = 0, donation; donation = res[i]; i++) {
                            $scope.donations.push(donation);
                        }
                    });
                    $timeout(function () {
                        window.videosSwipe = new Swipe(document.getElementById('slider'), {
                            startSlide: 0,
                            continuous: true,
                            disableScroll: true,
                            stopPropagation: false,
                            callback: function (index, elem) {
                            },
                            transitionEnd: function (index, elem) {
                            }
                        });

                        $scope.swipeComplete = true;

                    }, 500);
                    $timeout(function () {
                        //get pending items
                        console.log('Getting pending donations: ' + $scope.pet_id);
                        Donations.pending({pet_id: $scope.pet_id}, function (res) {
                            console.log('Found pending donations: ', res);
                            $timeout(function () {
                                $scope.pending = res;
                                $scope.showCart = (res.length > 0);
                                $scope.cartTitle = res.length + ' ' + ((res.length > 0) ? 'פריטים' : 'פריט');

                                calcDims();
                            });
                        });

                    }, 80);

                    if ($stateParams['adopt']){
                        if ($stateParams['adopt']=='adopt'){
                            var callback = function(){
                                $scope.adopted();
                            }
                        }else{
                            var callback = function(){
                                $scope.bought();
                            }
                        }
                        $scope.animateAdoptionButton(callback);
                    }

                });
            });
        }

        function calcDims(iterations) {
            if (typeof iterations == 'undefined') iterations = 3;

            $timeout(function () {
                var min_button_height = 100;
                $scope.grassHeight = $scope.windowHeight - ($scope.picHeight + 62) - 40 - ($scope.showCart ? 50 : 0);
                $scope.buttonHeight = $scope.buttonWidth = parseInt(Math.min(parseInt(($scope.grassHeight - 30) * 0.9), 150));
                $scope.buttonMargin = parseInt(($scope.grassHeight - $scope.buttonHeight) / 2);
                if ($scope.buttonHeight < min_button_height) {
                    $scope.buttonHeight = $scope.buttonWidth = min_button_height;
                    $scope.buttonMargin = 20;
                    $scope.grassHeight = min_button_height + ($scope.buttonMargin * 2);
                    $scope.picHeight = $scope.windowHeight - ($scope.grassHeight + 62) - 40 - ($scope.showCart ? 50 : 0);
                }

                $scope.picHeightPX = $scope.picHeight + 'px';
                $scope.grassHeightPX = $scope.grassHeight + 'px';
                $scope.buttonMarginPX = $scope.buttonMargin + 'px';
                $scope.buttonHeightPX = $scope.buttonHeight + 'px';
                $scope.buttonWidthPX = $scope.buttonWidth + 'px';


                if (iterations > 0) {
                    $timeout(function () {
                        calcDims(iterations - 1);
                    }, 1000);
                }
            });

        }

        $scope.adopt = function () {
            if (localStorage.adoptDialogShown){
                $location.path('/shop/' + $scope.pet_id);
            }else{
                $scope.showDialog('adopt');
                localStorage.adoptDialogShown = true;
            }
        }

        $scope.share = function () {
            var pet_link = Consts.client_root + '#/pet/' + $scope.pet_id;
            facebookConnectPlugin.showDialog({
                method: 'feed',
                app_id: Consts.fb_app_id,
                display: ($scope.isWeb ? 'popup' : 'touch'),
                link: pet_link,//$scope.pet.media.link,
                picture: $scope.pet.media.image,
                name: 'נעים מאוד להכיר, אני ' + $scope.pet.name,
                caption: 'תמיד רצית לאמץ כלב ולא יכולת בגלל 1042 סיבות? מצאנו דרך שתוכלו לעזור, להציל חיים או לפחות לעשות אותם קצת יותר קלים עבורם. בואו תראו.',
                description: ' ',
                actions: [
                    {name: 'תנו לי חטיף', link: pet_link}
                ]
            }, function (response) {
            });
        }

        $scope.like = function () {
            var pet_link = Consts.client_root + '#/pet/' + $scope.pet_id;
            facebookConnectPlugin.showDialog({
                method: 'feed',
                app_id: Consts.fb_app_id,
                to: $scope.pet.user.fb_id,
                display: ($scope.isWeb ? 'popup' : 'touch'),
                link: pet_link,//$scope.pet.media.link,
                picture: $scope.pet.media.image,
                name: $scope.pet.name + ' הזה הרס אותי עכשיו ',
                caption: 'איזה יופי של סרטונים, למות :)',
                description: ' ',
                actions: [
                    {name: 'תנו לי חטיף', link: pet_link}
                ]
            }, function (response) {
            });
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

        $scope.initButtonInterval = function () {
            var showButtonInterval = $interval(function () {
                if (!$scope.user || !$scope.pet) return;
                if (!!($scope.pet.user && ($scope.pet.user._id == $scope.user._id))) {
                    // BUY : if its my pet
                    $scope.showButton = 'buy';
                    $rootScope.bodyBg = ' mine';
                    $rootScope.currentPage = 'mine';
                    $rootScope.currentPet = $scope.pet_id;
                } else if (!!(!$scope.pet.user && $scope.user.pet)) {
                    // SHARE : if I have a pet and the pet has no owner
                    $scope.showButton = 'share';
                    $rootScope.bodyBg = ' lonely';
                    $rootScope.currentPage = 'lonely';
                    $rootScope.currentPet = $scope.pet_id;
                } else if (!!($scope.pet.user && ($scope.pet.user._id != $scope.user._id))) {
                    // LOVE : if the pet has owner and its not me
                    $scope.showButton = 'love';
                    $rootScope.bodyBg = ' adopted';
                    $rootScope.currentPage = 'adopted';
                    $rootScope.currentPet = $scope.pet_id;
                } else if (!$scope.pet.user && !$scope.user.pet) {
                    //ADOPT : if I have no pet and the this pet has no owner
                    $scope.showButton = 'adopt';
                    $rootScope.bodyBg = ' lonely';
                    $rootScope.currentPage = 'lonely';
                    $rootScope.currentPet = $scope.pet_id;
                } else {
                    $scope.showButton = false;
                }
                if ($scope.showButton)
                    $interval.cancel(showButtonInterval);

            }, 250);
        }

        $scope.animateButton = function () {
            if (!$scope.showButton) return;
            var animationDuration = 1700;
            var numOfFrames = 48;
            var frame = numOfFrames;
            var dim = $scope.buttonHeight;
            var animationBgPosition = 0;
            var animationInterval = $interval(function () {
                if (frame == 0) {
                    $interval.cancel(animationInterval);
                    $location.path('/shop/' + $scope.pet_id);
                    return;
                }
                $('.pet-buy-button').css('background-position-x', -1 * animationBgPosition);
                frame--;
                animationBgPosition += dim;
            }, (animationDuration / numOfFrames))
        }

        $scope.animateAdoptionButton = function (callback) {
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

        $scope.animateShareButton = function () {
            if (!$scope.showButton) return;
            var animationDuration = 1000;
            var numOfFrames = 25;
            var frame = numOfFrames;
            var dim = $scope.buttonHeight;
            var animationBgPosition = 0;
            var animationInterval = $interval(function () {
                if (frame == 0) {
                    $interval.cancel(animationInterval);
                    $timeout(function () {
                        $scope.share();
                        $('.pet-share-button').css('background-position-x', 0);
                    }, 500);
                    return;
                }
                $('.pet-share-button').css('background-position-x', -1 * animationBgPosition);
                frame--;
                animationBgPosition += dim;
            }, (animationDuration / numOfFrames))
        }

        $scope.animateLikeButton = function () {
            if (!$scope.showButton) return;
            var animationDuration = 1000;
            var numOfFrames = 34;
            var frame = numOfFrames;
            var dim = $scope.buttonHeight;
            var animationBgPosition = 0;
            var animationInterval = $interval(function () {
                if (frame == 0) {
                    $interval.cancel(animationInterval);
                    $timeout(function () {
                        $scope.like();
                        $('.pet-like-button').css('background-position-x', 0);
                    }, 500);
                    return;
                }
                $('.pet-like-button').css('background-position-x', -1 * animationBgPosition);
                frame--;
                animationBgPosition += dim;
            }, (animationDuration / numOfFrames))
        }

        $scope.animateAdoptButton = function () {
            if (!$scope.showButton) return;
            $scope.animatingAdopt = false;
            var animationDuration = 1700;
            var numOfFrames = 34;
            var frame = numOfFrames;
            var dim = $scope.buttonHeight;
            var animationBgPosition = 0;
            $('.pet-adopt-button-gif').hide();
            $('.pet-adopt-button').show();
            var animationInterval = $interval(function () {
                if (frame == 0) {
                    $interval.cancel(animationInterval);
                    $timeout(function () {
                        $scope.adopt();
                    }, 100);
                    $timeout(function () {
                        $('.pet-adopt-button-gif').show();
                        $('.pet-adopt-button').hide();
                        $('.pet-adopt-button').css('background-position-x', 0);
                    }, 1000);
                    return;
                }
                $('.pet-adopt-button').css('background-position-x', -1 * animationBgPosition);
                frame--;
                animationBgPosition += dim;
            }, (animationDuration / numOfFrames))
        }

        $scope.flip = function () {
            $('.flipper').toggleClass('flip');
        }

        //calc next friday at 12:00
        $scope.nextFriday = moment().hour(0).minute(0).second(0).add('days', 2).weekday(5).add('hours', 12).format();

        init();

        window.debug = $scope;

    }]);

