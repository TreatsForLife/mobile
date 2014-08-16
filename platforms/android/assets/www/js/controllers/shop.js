'use strict';

angular.module('clientApp')
    .controller('ShopCtrl', ['$scope', '$rootScope', '$stateParams', '$timeout', '$location', 'Treats', 'Pets', 'Donations', function ($scope, $rootScope, $stateParams, $timeout, $location, Treats, Pets, Donations) {

        console.log('ShopCtrl');

        var pet_id = $stateParams['id'] || $rootScope.user_pet_id;

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

            $scope.paypal.initialize();

            $scope.donationsCreated = [];
            for (var t=0, treat; treat = chosenTreats[t]; t++) {
                Donations.create({
                    paypalItem: $scope.ItemNumber,
                    treat: treat._id,
                    user: $scope.user._id,
                    pet: $scope.pet._id,
                    payed: false
                }, function(res){
                    $scope.donationsCreated.push(res);
                    if ( $scope.donationsCreated.length >= (chosenTreats.length) ) {
                        $scope.paypal.buyNow();
//                        if (fakeIt){
//                            document.location.href = ($scope.returnUrl + '?fake=1&item_number=' + $scope.ItemNumber);
//                        }else{
//                            $('#payment-form').submit();
//                        }
                    }
                });
            }

        }

        //PAYPAL-START
        $scope.paypal = {
            // Application Constructor
            initialize: function() {
                this.bindEvents();
            },
            // Bind Event Listeners
            //
            // Bind any events that are required on startup. Common events are:
            // 'load', 'deviceready', 'offline', and 'online'.
            bindEvents: function() {
                document.addEventListener('deviceready', this.onDeviceReady, false);
            },
            // deviceready Event Handler
            //
            // The scope of 'this' is the event. In order to call the 'receivedEvent'
            // function, we must explicity call 'app.receivedEvent(...);'
            onDeviceReady: function() {
                $scope.paypal.receivedEvent('deviceready');
            },
            // Update DOM on a Received Event
            receivedEvent: function(id) {
                // start to initialize PayPalMobile library
                $scope.paypal.initPaymentUI();
            },
            initPaymentUI : function () {
                var clientIDs = {
                    "PayPalEnvironmentProduction": "ATFL-xCxgAUPAGl4xq_UFp_YKGTLMfPdlbjSTHMvRsIv7VFgyREbfIeC2bVA",
                    "PayPalEnvironmentSandbox": "AaU98hCYEOjYssUkh9FGKL1CnCMdET8YKuwJ_hzuB9jMLGO5nuKCsbiyZvKu"
                };
                PayPalMobile.init(clientIDs, $scope.paypal.onPayPalMobileInit);

            },
            onSuccesfulPayment : function(payment) {
                console.log("payment success: " + JSON.stringify(payment, null, 4));
                //aprove paypal payments & get pending items from db

                var approved = $scope.donationsCreated.length;
                for (var i= 0, donation; donation = $scope.donationsCreated[i]; i++){
                    Donations.approve({_id: donation['_id']}, function (res) {
                        approved--;
                        if (approved==0){
                            if ($scope.user.pet){
                                $location.path('/pet/' + $scope.pet._id);
                                scope.user = false;
                                scope.pet = false;
                            }else{
                                $location.path('/pet/' + $scope.pet._id + '?adopt=true');
                                scope.user = false;
                                scope.pet = false;
                            }
                        }
                    });
                }
            },
            createPayment : function () {
                // for simplicity use predefined amount
                var paymentDetails = new PayPalPaymentDetails($scope.totalToPay, "0", "0");
                var payment = new PayPalPayment($scope.totalToPay, "ILS", $scope.formattedItemName, "Sale", paymentDetails);
                return payment;
            },
            configuration : function () {
                // for more options see `paypal-mobile-js-helper.js`
                var config = new PayPalConfiguration({
                    merchantName: "חטיפים לחיים",
                    merchantPrivacyPolicyURL: "http://treatsforlife.org/policy.pdf",
                    merchantUserAgreementURL: "http://treatsforlife.org/agreement.pdf",
                    languageOrLocale: "he",
                    forceDefaultsInSandbox : true,
                    sandboxUserPassword: "Treats41M$",
                    defaultUserEmail: "sandbox@treatsforlife.org"
                });
                return config;
            },
            onPrepareRender : function() {
//                $scope.paypal.buyNow();
            },
            buyNow: function(){
                PayPalMobile.renderSinglePaymentUI($scope.paypal.createPayment(), $scope.paypal.onSuccesfulPayment, $scope.paypal.onUserCanceled);
            },
            onPayPalMobileInit : function() {
                // must be called
                // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
                PayPalMobile.prepareToRender("PayPalEnvironmentSandbox", $scope.paypal.configuration(), $scope.paypal.onPrepareRender);
            },
            onUserCanceled : function(result) {
                console.log(result);
            }
        };

        //PAYPAL-END


    }]);
