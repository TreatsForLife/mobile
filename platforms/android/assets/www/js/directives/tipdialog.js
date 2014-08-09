'use strict';

angular.module('clientApp')
    .directive('tipDialog', ['$timeout', '$location', function ($timeout, $location) {
        return {
            template: '<div class="tip-dialog-container" ng-show="shown">' +
                '<div class="tip-dialog-wrapper">' +
                '<div class="tip-dialog animated bounce{{!leaving ? \'InDown\' : \'OutUp\'}}"><div class="tip-dialog-content rtl" ng-include="contentUrl"></div></div>' +
                '<div class="tip-dialog-point animated bounce{{!leaving ? \'InDown\' : \'OutUp\'}}"></div>' +
                '<div class="tip-dialog-dog animated bounce{{!leaving ? \'InUp\' : \'OutDown\'}}" ng-style="{backgroundImage: \'url(images/logo.png)\'}"></div>' +
                '<div class="tip-dialog-x animated fade{{!leaving ? \'In\' : \'Out\'}}" ng-click="closeTipDialog()"> סגור <i class="fa fa-times"></i>' +
                '</div>' +
                '</div>' +
                '</div>',
            restrict: 'E',
            link: function (scope, element, attrs) {
                scope.shown = false;
                scope.leaving = false;

                scope.$on('showTipDialog', function (e, filename) {
                    if (scope.shown) return;
                    $timeout(function () {
                        scope.contentUrl = 'views/partials/' + filename + '-dialog.html';
                        scope.shown = true;
                    }, 100);
                    $location.search({'dialog':'1'});
                });
                scope.closeTipDialog = function () {
                    if (!scope.shown) return;
                    scope.leaving = true;
                    $timeout(function () {
                        scope.shown = false;
                        scope.leaving = false;
                    }, 1000);
                    $location.search({'dialog':null});
                }

                scope.$on('closeTipDialog', function () {
                    scope.closeTipDialog();
                });
            }

        };
    }]);
