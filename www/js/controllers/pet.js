'use strict';

angular.module('clientApp')
    .controller('PetCtrl', ['$scope', 'Pets', 'Donations', 'Treats', 'Users', '$rootScope', '$stateParams', '$timeout', '$interval', '$sce', '$location', function ($scope, Pets, Donations, Treats, Users, $rootScope, $stateParams, $timeout, $interval, $sce, $location) {

        console.log('PetCtrl');

        $rootScope.bodyClass = 'pet';
        $scope.buttonAnimationReady = false;
        $scope.buttonClicked = false;
        $scope.picHeight = $('.container').width() * 1;
        $scope.grassHeight = $(window).height() - $scope.picHeight;
        $scope.cartIsUp = false;
        $scope.swipeComplete = false;

        //search pet in route or in cookie

        function init() {
            //if ($rootScope.user) {
            //    $scope.getPetId();
            //} else {
            //    $scope.$on('userIsFetched', function () {
            //        //check if the user has a pet
            //        $scope.getPetId();
            //    });
            //}
            $scope.getPetId();
            if ($location.search()['given']) {
                $scope.showDialogIfNeeded('given');
            }
        }

        function calcDims(iterations) {
            if (typeof iterations == 'undefined') iterations = 3;

            $timeout(function () {
                var min_button_height = 130;
                $scope.grassHeight = $scope.windowHeight - ($scope.picHeight + 62) - 40 - ($scope.showCart ? 50 : 0) - ($scope.isIphone ? 20 : 0);
                $scope.buttonHeight = $scope.buttonWidth = parseInt(Math.min(parseInt(($scope.grassHeight - 30) * 0.9), 150));
                $scope.buttonMargin = parseInt(($scope.grassHeight - $scope.buttonHeight) / 2);
                if ($scope.buttonHeight < min_button_height) {
                    $scope.buttonHeight = $scope.buttonWidth = min_button_height;
                    $scope.buttonMargin = 20;
                    $scope.grassHeight = min_button_height + ($scope.buttonMargin * 2);
                    $scope.picHeight = $scope.windowHeight - ($scope.grassHeight + 62) - 40 - ($scope.showCart ? 50 : 0) - ($scope.isIphone ? 20 : 0);
                }

                $scope.picHeightPX = Math.min($scope.picHeight, ($scope.windowWidth - 20)) + 'px';
                $scope.infoHeightPX = ($scope.picHeight + 42) + 'px';
                $scope.grassHeightPX = $scope.grassHeight + 'px';
                $scope.buttonMarginPX = $scope.buttonMargin + 'px';
                $scope.buttonHeightPX = $scope.buttonHeight + 'px';
                $scope.buttonWidthPX = $scope.buttonWidth + 'px';

                $scope.videoStyle = {
                    'margin-top': -1 * ($scope.picHeight - $scope.windowWidth) / 2
                }
                $scope.$broadcast('calcedDims');

                if (iterations > 0) {
                    $timeout(function () {
                        calcDims(iterations - 1);
                    }, 1000);
                }
            });

        }

        $scope.getPetId = function () {
            $scope.pet_id = $stateParams['id'] || $rootScope.user_pet_id;
            $scope.pet_link = Consts.client_root + '#/pet/' + $scope.pet_id;
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

                $scope.initChooseButtonInterval();

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
                            startSlide: 1,
                            continuous: true,
                            disableScroll: false,
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
                                $scope.pendingAccumulated = {};
                                accumulatePendingItems();
                                $scope.showCart = (res.length > 0);
                                $scope.cartTitle = ((res.length > 1) ? res.length + ' פינוקים' : 'פינוק אחד') + ' בדרך ל' + pet.name + '';

                                calcDims();
                            });
                        });

                    }, 80);

                });
            });
        }

        function accumulatePendingItems() {
            var items = $scope.pending;
            var accumulated = $scope.pendingAccumulated;
            for (var item, i = 0; item = items[i]; i++) {
                var idx = item.treat.name;
                if (accumulated[idx]) {
                    accumulated[idx]['sum']++;
                } else {
                    accumulated[idx] = item;
                    accumulated[idx]['sum'] = 1;
                }
            }
        }

        $scope.initChooseButtonInterval = function () {
            var showButtonInterval = $interval(function () {
                if (!$scope.pet) return;
                if (! $scope.user) {
                    //ADOPT : if I have no pet and the this pet has no owner
                    $scope.showButton = 'adopt';
                    $rootScope.bodyBg = ' lonely';
                    $rootScope.currentPage = 'lonely';
                    $rootScope.currentPet = $scope.pet_id;
                } else if (!!($scope.pet.user && ($scope.pet.user._id == $scope.user._id))) {
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

        $scope.buyClicked = function () {
            if (!$scope.showButton) return;
            $('.pet-buy-button-gif').hide();
            $('.pet-buy-button').show();
            $rootScope.runAnimation('.pet-buy-button', 3500, 85, $scope.buttonHeight, function () {
                $timeout(function () {
                    $('.pet-buy-button-gif').show();
                    $('.pet-buy-button').hide();
                }, 800);
                if (window.ionic.Platform.isIOS()) {
                    $scope.goto(Consts.client_root + '#/shop/' + $scope.user_id + '/' + $scope.pet_id);
                } else {
                    $location.path('/shop/' + $scope.pet_id);
                }
            });
        }

        $scope.shareClicked = function () {
            if (!$scope.showButton) return;
            $('.pet-share-button-gif').hide();
            $('.pet-share-button').show();
            $rootScope.runAnimation('.pet-share-button', 2000, 48, $scope.buttonHeight, function () {
                $timeout(function () {
                    $('.pet-share-button-gif').show();
                    $('.pet-share-button').hide();
                }, 800);
                $scope.fbShare(
                    $scope.pet_link,
                    $scope.pet.media.image,
                    'נעים מאוד להכיר, אני ' + $scope.pet.name,
                    'תמיד רצית לאמץ כלב ולא יכולת בגלל 1042 סיבות? מצאנו דרך שתוכלו לעזור, להציל חיים או לפחות לעשות אותם קצת יותר קלים עבורם. בואו תראו.',
                    'תנו לי חטיף',
                    function () {
                    }
                )
            });
        }

        $scope.likeClicked = function () {
            if (!$scope.showButton) return;
            $('.pet-like-button-gif').hide();
            $('.pet-like-button').show();
            $rootScope.runAnimation('.pet-like-button', 2000, 48, $scope.buttonHeight, function () {
                $timeout(function () {
                    $('.pet-like-button-gif').show();
                    $('.pet-like-button').hide();
                }, 800);
                $scope.fbShare(
                    $scope.pet_link,
                    $scope.pet.media.image,
                    $scope.pet.name + ' הזה הרס אותי עכשיו ',
                    'איזה יופי של סרטונים, למות :)',
                    'תראו אותי',
                    function () {
                    }
                )
            });
        }

        $scope.adoptClicked = function () {
            if (!$scope.showButton) return;
            $('.pet-adopt-button-gif').hide();
            $('.pet-adopt-button').show();
            $rootScope.runAnimation('.pet-adopt-button', 2042, 49, $scope.buttonHeight, function () {
                if (window.ionic.Platform.isIOS()) {
                    $scope.goto(Consts.client_root + '#/shop/' + $scope.user_id + '/' + $scope.pet_id);
                } else {
                    $location.path('/shop/' + $scope.pet_id);
                }
                $timeout(function () {
                    $('.pet-adopt-button-gif').show();
                    $('.pet-adopt-button').hide();
                }, 800);
            });
        }

        $scope.gotoKennel = function () {
            var url = $scope.trustSrc($scope.pet.kennel.link);
            window.open(url, '_system');
        }

        init();

        window.debug = $scope;

    }]);

