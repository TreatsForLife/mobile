'use strict';

angular.module('clientApp')
    .controller('ShopCtrl', ['$scope', '$rootScope', '$routeParams', '$timeout', '$location', 'Treats', 'Pets', 'Donations', function ($scope, $rootScope, $routeParams, $timeout, $location, Treats, Pets, Donations) {

        console.log('ShopCtrl');

        var pet_id = $routeParams['id'] || $rootScope.user_pet_id;

        $rootScope.bodyClass = 'shop';
        $rootScope.navbarTitle = 'החנות';

        $scope.returnUrl = Consts.client_root + '#/pet/' + pet_id;
        $scope.notifyUrl = Consts.api_root + 'donation';

        $scope.treats = Treats.all();

        var chosenTreats = [];

        $timeout(function () {
            if (!window.localStorage['shop-dialog-shown']) {
//                $scope.showDialog('shop');
            }
        });

        if (!$scope.pet) {
            $scope.pet = Pets.one({id: pet_id});
        }

        $timeout(function(){
            $scope.showCheckout = true;
        },500);

        $scope.initCheckout = function () {
            $timeout(function () {
                //animate the checkout - do not remove there are problems with fixed position otherwise
                $('.shop-checkout')
                    .addClass('animated fadeInUp')

                //calc the cart (to include defaults)
                $scope.cartChanged();
            }, 500);
        }

        $scope.calcTotalToPay = function () {
            var total = 0;
            chosenTreats = [];
            for (var treat, t = 0; treat = $scope.treats[t]; t++) {
                if (treat.cart || treat.fixed) {
                    total += treat.price;
                    chosenTreats.push(treat);
                }
            }
            return total;
        }

        $scope.formatItemName = function () {
            var name = ' עבור ' + $scope.pet.name;
            var names = [];
            for (var treat, t = 0; treat = $scope.treats[t]; t++) {
                if (treat.cart || treat.fixed) {
                    names.push(treat.name);
                }
            }
            if (names.length > 1) {
                var last = names[0];
                var rest = names.slice(1);
                name = rest.join(', ') + ' ו' + last + name;
            } else {
                name = names[0] + name;
            }
            return name;
        }

        $scope.totalToPay = 0;
        $scope.cartChanged = function (i) {
            if (angular.isDefined(i)) {
                $timeout(function(){
                    $scope.treats[i].cart = !$scope.treats[i].cart;
                });
            }
            $timeout(function(){
                $scope.totalToPay = $scope.calcTotalToPay();
                $scope.formattedItemName = $scope.formatItemName();
                $scope.ItemNumber = (new Date()).getTime();
                $scope.paymentActive = ($scope.totalToPay > 0);
            },100);
        }

        $scope.pay = function (fakeIt) {

            $scope.cartChanged();
            if (!$scope.paymentActive) return;
            $scope.paymentActive = false;


            var created = 0;
            for (var t=0, treat; treat = chosenTreats[t]; t++) {
                Donations.create({
                    paypalItem: $scope.ItemNumber,
                    treat: treat._id,
                    user: $scope.user._id,
                    pet: $scope.pet._id,
                    payed: false
                }, function(res){
                    created++;
                    if ( created >= (chosenTreats.length) ) {
                        if (fakeIt){
                            document.location.href = ($scope.returnUrl + '?fake=1&item_number=' + $scope.ItemNumber);
                        }else{
                            $('#payment-form').submit();
                        }
                    }
                });
            }

        }

    }]);
