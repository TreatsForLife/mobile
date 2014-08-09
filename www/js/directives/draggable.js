'use strict';

angular.module('clientApp')
    .directive('draggable', function ($document) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attr) {
                var startX = 0, startY = 0, startEleX = 0, startEleY = 0, x = 0, y = 0;

                element.on('mousedown', function (event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.pageX;
                    startY = event.pageY;
                    startEleX = element.offset().left;//event.pageX - x;
                    startEleY = element.offset().top;//event.pageY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });

                function mousemove(event) {
                    y = event.pageY - startY + startEleY;
                    x = event.pageX - startX  + startEleX;
                    element.css({
                        top: y + 'px',
                        left: x + 'px'
                    });
                }

                function mouseup() {
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }
            }
        };
    });
