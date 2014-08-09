'use strict';

angular.module('clientApp')
    .directive('player', ['$location', '$timeout', function ($location, $timeout) {
        return {
            restrict: 'AE',
            scope: {
                show: '=',
                videoSrc: '=',
                isEditMode: '='
            },
            template: '<div id="dialog-video" class="dialog-video" ng-show="show" bindonce bo-class="{preview: !isMobile}">' +
                //'<video id="video-player"></video>' +
                '<video id="video-player" ng-src="{{videoSrc}}" ng-click="toggleVideo()"></video>' +
                '<div id="video-loading-indicator" ng-if="isVideoBuffering">Loading<i class="fa fa-spinner fa-spin"></i></div>' +
                '<div id="video-controls-wrapper">' +
                '<div class="video-controls">' +
                '<div class="video-controls-section playback">' +
                '<i ng-hide="isPlaying" ng-click="playVideo()" class="fa fa-play fa-fw"></i>' +
                '<i ng-show="isPlaying" ng-click="pauseVideo()" class="fa fa-pause fa-fw"></i>' +
                '</div>' +
                '<div class="video-controls-section progress-wrapper">' +
                '<div id="progressbar" class="video-progress-total" ng-click="seekVideo($event)">' +
                '<div id="progress-current" class="video-progress-current" ng-style="{width: currentPosition}"></div>' +
                '</div>' +
                '</div>' +
                '<span class="video-position-indicator" ng-bind="currentTime"></span>' +
                '</div>' +
                '</div>' +
                '<button class="dialog-video-close" ng-click="closeDialog()"><i class="fa fa-fw fa-times"></i></button>' +
                '</div>',
            link: function (scope, element, attrs) {
                //scope variables
                scope.isVideoLoaded = scope.isPlaying = scope.isMuted = false;
                scope.isVideoBuffering = true;
                scope.currentTime = "0:00";
                scope.currentPosition = 0;

                //local variables
                var video, progressbar, playing, progressBarWidth, progressBarOffset, scrollDisabled = false;

                //init

                scope.$watch('show', function (newVal, oldVal) {
                    if (newVal === true && (angular.isUndefined(oldVal) || oldVal === false)) {
                        initVideo();
                    }
                });

                scope.$on('setVideoSrc', function(e, src){
                    scope.videoSrc = src;
                    scope.show = true;
                });

                var alreadyInit = false;
                var initVideo = function () {

                    if (alreadyInit) {
                        //video.attr('src', scope.videoSrc);
                        scope.currentTime = "0:00";
                        scope.currentPosition = 0;
                        if (!scope.$root.isMobile) {
                            setDimensions();
                            video.volume = 1;
                        }
                        //video.attr('src', scope.videoSrc);
                        return;
                    }

                    alreadyInit = true;
                    video = document.getElementById('video-player');
                    //angular.element(video).attr('src', scope.videoSrc);

                    if (!scope.$root.isMobile) {
                        setDimensions();
                        video.volume = 1;
                    }

                    video.addEventListener('canplaythrough', videoCanPlay);
                    video.addEventListener('playing', videoPlaying);
                    video.addEventListener('timeupdate', videoTimeUpdate);
                    video.addEventListener('pause', videoPaused);
                    video.addEventListener('seeking', function () {
                        $timeout(function () {
                            scope.isVideoBuffering = true;
                        })
                    });
                    video.addEventListener('seeked', function () {
                        $timeout(function () {
                            scope.isVideoBuffering = false;
                        })
                    });

                    scope.currentTime = "0:00";
                    scope.currentPosition = 0;
                    progressbar = document.getElementById('progressbar');
                    progressBarWidth = progressbar.clientWidth;
                    progressBarOffset = progressbar.offsetLeft;

                }

                var setDimensions = function () {
                    //var dialogHeight = angular.element((window === window.top) ? '.editor-preview' : '#show-container').height() + 5;
//                    angular.element('#dialog-video').height(dialogHeight).css('top', Math.abs(scope.$root.myScroll['show-container'].y));
                    scrollDisabled = true;
                }

                //browser events
                scope.$on('mo.orientationchange', function () {
                    progressBarWidth = progressbar.clientWidth;
                    progressBarOffset = progressbar.offsetLeft;
                });

                //video player events
                var videoCanPlay = function (e) {
                    console.log('Video can play event');
                    $timeout(function () {
                        scope.isVideoLoaded = true;
                        scope.isVideoBuffering = false;
                    });
                    console.log('Video play');
                    video.play();
                    playing=true;
                    };

                var videoPlaying = function (e) {
                    console.log('Video playing event');
                    $timeout(function () {
                        scope.isPlaying = true;
                    });
                };

                var videoTimeUpdate = function (e) {

                    $timeout(function () {
                        //bar
                        scope.currentPosition = ((video.currentTime * progressBarWidth) / video.duration);
                        //text
                        scope.currentTime = video.currentTime.toString().toMMSS();
                    });
                };

                var videoPaused = function (e) {
                    console.log('Video paused event');
                    scope.$apply(function () {
                        $timeout(function () {
                            scope.isPlaying = false;
                        });
                    });
                };

                scope.toggleVideo = function () {
                    if (playing) {
                        scope.pauseVideo();
                    } else {
                        scope.playVideo();
                    }
                }
                //video player controls
                scope.playVideo = function () {
                    if (angular.isDefined(video)) {
                        console.log('play video action', video);
                        if (video.ended) {
                            //video.load();
                            scope.currentTime = "0:00";
                            scope.currentPosition = 0;
                        }

                        video.play();
                        playing = true;
                    }
                };

                scope.pauseVideo = function () {
                    console.log("pause video action");
                    if (angular.isDefined(video)) {
                        video.pause();
                        playing = false;
                    }
                };

                scope.seekVideo = function (e) {
                    console.log('seek video action');
                    if (angular.isDefined(video) && scope.isPlaying)
                        video.currentTime = (((e.clientX - progressBarOffset) * video.duration) / progressBarWidth);
                };

                //close dialog
                scope.closeDialog = function () {
                    scope.pauseVideo();
                    $timeout(function () {
                        scope.show = scope.isVideoLoaded = scope.isPlaying = scope.isMuted = false;
                        //scope.isVideoBuffering = true;
                        scope.isVideoLoaded = true;
                        scope.currentTime = "0:00";
                        scope.currentPosition = 0;
                    });

                    scope.$emit('mo.video-dialog-closed');
                    angular.element('body').css('overflow', 'auto');
                };


                scope.$on('closeDialog', function () {
                    scope.closeDialog();
                });
            }
        }
    }])
