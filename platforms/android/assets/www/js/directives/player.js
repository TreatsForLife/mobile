'use strict';

angular.module('clientApp')
    .directive('petPlayer', ['$location', '$timeout', '$sce', function ($location, $timeout, $sce) {
        return {
            restrict: 'A',
            replace: false,
            scope: true,
            template: '<video class="pet-video" ng-src="{{trustSrc(item.media.video)}}" poster="{{item.media.image}}" ng-style="videoStyle"></video>' +
                '<span class="pet-pic-play fa-stack fa-lg" ng-hide="playing">'+
                '<i ng-hide="loading || playing" class="fa fa-circle fa-stack-2x pet-pic-play-circle" ng-style="{lineHeight: (picHeight +\'px\')}"></i>' +
                '<i ng-hide="loading || playing" class="fa fa-play fa-stack-1x fa-inverse" ng-style="{lineHeight: (picHeight +\'px\')}"></i>' +
                '<i ng-show="loading && !playing" class="fa fa-refresh fa-fw fa-spin " ng-style="{lineHeight: (picHeight +\'px\')}"></i>' +
                '</span>',
            link: function ($scope, element, attrs) {
                var video = $(element).children('.pet-video')[0];
                $scope.playing = false;
                $scope.loading = true;
                $(element).click(function(){
                    $scope.toggleVideo();
                });
                var videoCanPlay = function(e){
                    $timeout(function () {
                        $scope.loading = false;
                    });
                };
                var endVideo = function(e){
                    console.log('Auto Video Restart');
                    video.pause();
                    video.currentTime = 0;
                    $timeout(function () {
                        $scope.playing = false;
                        $scope.loading = false;
                    });
                };
                var videoPlaying = function(e){
                    $timeout(function () {
                        $scope.playing = true;
                        $scope.loading = false;
                    });
                };
                $scope.playVideo = function () {
                    if (angular.isDefined(video)) {
                        console.log('play video action', video);
                        video.play();
                        $timeout(function () {
                            $scope.loading = true;
                        });
                    }
                };
                $scope.pauseVideo = function () {
                    console.log("pause video action");
                    if (angular.isDefined(video)) {
                        video.pause();
                        $timeout(function () {
                            $scope.playing = false;
                            $scope.loading = false;
                        });
                    }
                };
                $scope.initVideo = function () {
                    $timeout(function () {
                        video.volume = 0;
                        video.addEventListener('ended', endVideo);
                        video.addEventListener('canplaythrough', videoCanPlay);
                        video.addEventListener('playing', videoPlaying);
                    }, 0);
                }
                $scope.toggleVideo = function () {
                    $timeout(function () {
                        if ($scope.playing) {
                            $scope.pauseVideo();
                        } else {
                            $scope.initVideo();
                            $scope.playVideo();
                        }
                    }, 0);
                }
                $scope.initVideo();

            }
        }
    }])


angular.module('clientApp')
    .directive('player', ['$location', '$timeout', '$sce', function ($location, $timeout, $sce) {
        return {
            restrict: 'AE',
            scope: {
                show: '=',
                videoSrc: '=',
                isEditMode: '='
            },
            template: '<div id="dialog-video" class="dialog-video" ng-show="show" bindonce bo-class="{preview: !isMobile}">' +
                //'<video id="video-player"></video>' +
                '<video id="video-player" ng-click="toggleVideo()" ng-hide="isVideoBuffering" ></video>' +
                '<div id="video-loading-indicator" ng-if="isVideoBuffering">Loading<i class="fa fa-spinner fa-spin"></i></div>' +
                '<div id="video-controls-wrapper">' +
                '<div class="video-controls">' +
                '<div class="video-controls-section playback">' +
                '<i ng-hide="isPlaying" ng-click="playVideo()" class="fa fa-play fa-fw"></i>' +
                '<i ng-show="isPlaying" ng-click="pauseVideo()" class="fa fa-pause fa-fw"></i>' +
                '</div>' +
                '<div class="video-controls-section progress-wrapper">' +
                '<div id="progressbar" class="video-progress-total" ng-click="seekVideo($event)">' +
                '<div id="progress-current" class="video-progress-current" ng-style="{width: currentPosition+\'px\'}"></div>' +
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
                scope.autoplay = false;

                //local variables
                var video, progressbar, playing, progressBarWidth, progressBarOffset, scrollDisabled = false;

                //init

//                scope.$watch('show', function (newVal, oldVal) {
//                    if (newVal === true && (angular.isUndefined(oldVal) || oldVal === false)) {
//                        initVideo();
//                    }
//                });
//
                scope.$on('setVideoSrc', function (e, src) {
                    scope.autoplay = false;
                    scope.videoSrc = $sce.trustAsResourceUrl(src);
                    scope.videoSrcRaw = (src);
                    initVideo();
                });

                scope.$on('playVideoSrc', function (e, src) {
                    scope.autoplay = true;
                    if (scope.videoSrcRaw != src) {
                        scope.videoSrc = $sce.trustAsResourceUrl(src);
                        scope.videoSrcRaw = (src);
                        initVideo();
                    }
                    scope.show = true;
                    scope.playVideo();
                });

                var alreadyInit = false;
                var initVideo = function () {

                    if (!alreadyInit) {

                        alreadyInit = true;
                        video = document.getElementById('video-player');

                        video.volume = 0;

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

                        progressbar = document.getElementById('progressbar');

                    }

                    $timeout(function () {
                        scope.currentTime = "0:00";
                        scope.currentPosition = 0;
                        video.src = scope.videoSrc;
                    });

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
                    if (scope.autoplay){
                        console.log('Auto Video play');
                        scope.playVideo();
                        playing = true;
                    }
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
                        progressBarWidth = progressbar.clientWidth;
                        progressBarOffset = progressbar.offsetLeft;

                        scope.currentPosition = ((video.currentTime * progressBarWidth) / video.duration);
                        //text
                        scope.currentTime = video.currentTime.toString().toMMSS();

                        if (video.currentTime > 0) {
                            //remove loading indicator
                            scope.isVideoBuffering = false;
                        }
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
                    $('body').css('overflow', 'auto');
                };


                scope.$on('closeDialog', function () {
                    scope.closeDialog();
                });
            }
        }
    }])
