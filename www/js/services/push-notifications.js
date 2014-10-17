var pushNotification;

function initPushNotifications() {
    pushNotification = window.plugins.pushNotification;

    console.log('registering ' + device.platform);
    if (device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos") {
        pushNotification.register(
            PushPluginSuccessHandler,
            PushPluginErrorHandler,
            {
                "senderID": "644737401690",
                "ecb": "onNotification"
            });
    } else if (device.platform == 'blackberry10') {
        pushNotification.register(
            PushPluginSuccessHandler,
            PushPluginErrorHandler,
            {
                invokeTargetId: "replace_with_invoke_target_id",
                appId: "replace_with_app_id",
                ppgUrl: "replace_with_ppg_url", //remove for BES pushes
                ecb: "pushNotificationHandler",
                simChangeCallback: replace_with_simChange_callback,
                pushTransportReadyCallback: replace_with_pushTransportReady_callback,
                launchApplicationOnPush: true
            });
    } else {
        pushNotification.register(
            tokenHandler,
            PushPluginErrorHandler,
            {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "onNotificationAPN"
            });
    }
}

// iOS
function onNotificationAPN (event) {
    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(PushPluginSuccessHandler, PushPluginErrorHandler, event.badge);
    }
}

// Android and Amazon Fire OS
function onNotification(e) {
    console.log('EVENT -> RECEIVED:' + e.event);

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                console.log('REGISTERED -> REGID:' + e.regid);
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                window.handlePushRegistration('android', e.regid);
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if ( e.foreground )
            {
                console.log('--INLINE NOTIFICATION--');

                // on Android soundname is outside the payload.
                // On Amazon FireOS all custom attributes are contained within payload
                var soundfile = e.soundname || e.payload.sound;
                // if the notification contains a soundname, play it.
                var my_media = new Audio("/android_asset/www/images/"+ soundfile);
                my_media.play();
            }
            else
            {  // otherwise we were launched because the user touched a notification in the notification tray.
                if ( e.coldstart )
                {
                    console.log('--COLDSTART NOTIFICATION--');
                }
                else
                {
                    console.log('--BACKGROUND NOTIFICATION--');
                }
            }

            console.log('MESSAGE -> MSG: ' + e.payload.message);
            //Only works for GCM
            console.log('MESSAGE -> MSGCNT: ' + e.payload.msgcnt);
            //Only works on Amazon Fire OS
            //$status.append('<li>MESSAGE -> TIME: ' + e.payload.timeStamp);
            break;

        case 'error':
            console.log('ERROR -> MSG:' + e.msg);
            break;

        default:
            console.log('EVENT -> Unknown, an event was received and we do not know what it is</li>');
            break;
    }
}

function tokenHandler (result) {
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
    window.handlePushRegistration('ios', result);
}

function PushPluginSuccessHandler (result) {
    console.log('PushPlugin result = ' + result);
}

function PushPluginErrorHandler (error) {
    console.log('PushPlugin error = ' + error);
}
