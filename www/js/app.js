// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('clientApp', ['ionic',
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'ngTouch',
    ])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider, $compileProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|file):/);

        $stateProvider

            // setup an abstract state for the tabs directive
            .state('welcome', {
                url: "/welcome",
                templateUrl: 'templates/welcome.html',
                controller: 'WelcomeCtrl'
            })
            .state('pets', {
                url: "/pets/:filter",
                templateUrl: 'templates/pets.html',
                controller: 'PetsCtrl'
            })
            .state('pet', {
                url: "/pet/:id",
                templateUrl: 'templates/pet.html',
                controller: 'PetCtrl'
            })
            .state('adopt', {
                url: "/pet/:id/:adopt",
                templateUrl: 'templates/thanks.html',
                controller: 'ThanksCtrl'
            })
            .state('shop', {
                url: "/shop/:id",
                templateUrl: 'templates/shop.html',
                controller: 'ShopCtrl'
            })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise(function(){
            console.log('localStorage', localStorage);
            if (!localStorage.fb_id) {
                console.log('ROUTER: Redirecting to Welcome');
                return ('/welcome');
            } else if (!localStorage.user_pet_id) {
                console.log('ROUTER: Redirecting to Pets');
                return ('/pets/lonely');
            } else {
                console.log('ROUTER: Redirecting to Pet');
                return ('/pet/'+localStorage.user_pet_id);
            }
        });

    })
;