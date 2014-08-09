var Utils = {
    isLocal: (document.location.host.search('localhost') > -1) || (document.location.host.search('lvh.me') > -1),
    isBchmn: (document.location.host.search('bchmn.com') > -1),
    isHeroku: (document.location.host.search('herokuapp.com') > -1),
    findIdInArray: function(arr, idVal, idKey){
        if (typeof idKey == 'undefined') idKey = '_id';
        for (var i=0, a; a = arr[i]; i++){
            if (a[idKey] == idVal){
                return a;
            }
        }
        return false;
    }
}

var Consts = {
    debug: true,
    api_root: Utils.isLocal ? 'http://localhost:3000/' : 'http://tfl.bchmn.com/',//http://treatsforlife-api.herokuapp.com/'
    client_root: Utils.isLocal ? 'http://localhost:9000/': 'http://treatsforlife.org/',
    fb_app_id: Utils.isLocal ? '262700727225341' : '601219569953172'
}

String.prototype.toMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var minutes = Math.floor(sec_num / 60);
    var seconds = sec_num - (minutes * 60);

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = minutes + ':' + seconds;
    return time;
}

