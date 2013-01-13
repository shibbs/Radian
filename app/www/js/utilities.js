$().ns('RadianApp.Utilities');

RadianApp.Utilities.round = function roundNumber(num, dec) {
    var result = Math.round(Number(num) * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
};

RadianApp.Utilities.isAndroid = function() {
    try {
        if(device.platform === 'Android') {
            return true;
        }
    } catch(e) {
    }
    return false;
}

RadianApp.Utilities.countDown = function(count, countFn, finishFn) {
    var countDown = count;
    var callmethod = function () {
        countDown -= 1;
        countFn(countDown);
        if(countDown===0) {
            finishFn();
        } else {
            window.countDown = setTimeout(callmethod, 1000);
        }
    };
    window.countDown = setTimeout(callmethod, 1000);
};

RadianApp.Utilities.formatDate = function(d, onlyDate) {
    var date = d.getDate();
    date = date < 10 ? "0"+date : date;
    var mon = d.getMonth()+1;
    mon = mon < 10 ? "0"+mon : mon;
    var year = d.getFullYear();
    var hour = d.getHours()%12;
    if(hour === 0) hour = 12;
    var minutes = d.getMinutes();
    if(minutes < 10) minutes = '0' + minutes;
    var ampm = d.getHours()/12 > 1 ? "PM" : "AM";
    if(onlyDate) return (mon+"/"+date+"/"+year);
    return (mon+"/"+date+"/"+year+" "+hour+":"+minutes+" "+ampm);
}

RadianApp.Utilities.errorModal = function(errorMessage) {
     $.modal("<div style='width: 256px; font-family:\"Conv_Gotham-Medium\", Helvetica, Arial, sans-serif; font-size: 13.5px; color: rgb(30,30,30)'> \
        <div>"+ errorMessage +"</div> \
        <div class='cancelBox'> \
            <div id='cancelAddNewPreset' class='simplemodal-close'>OK</div> \
        </div> \
        </div>", {  position: ['50%', '50%'],
                    onShow: function() { 
                        $('#simplemodal-container').css('margin-left', '-140px');
                        $('#simplemodal-container').css('margin-top', '-40px');
                    }
                });
}

RadianApp.Utilities.copyNestedArray = function(array) {
    var newArray = []
    for (var i = 0; i < array.length; i++) {
        newArray.push(array[i].slice(0));
    };
    return newArray;
}

// Base 64 encoding function, for browsers that do not support btoa()
// by Tyler Akins (http://rumkin.com), available in the public domain
if (!window.btoa) {
    RadianApp.Utilities.btoa = function btoa(input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + 
                     keyStr.charAt(enc3) + keyStr.charAt(enc4);
        } while (i < input.length);

        return output;
    }
} else {
    RadianApp.Utilities.btoa = window.btoa;
}

// pack() emulation (from the PHP version), for binary crunching
RadianApp.Utilities.pack = function pack(fmt) {
    var output = '';
    
    var argi = 1;
    for (var i = 0; i < fmt.length; i++) {
        var c = fmt.charAt(i);
        var arg = arguments[argi];
        argi++;
        
        switch (c) {
            case "a":
                output += arg[0] + "\0";
                break;
            case "A":
                output += arg[0] + " ";
                break;
            case "C":
            case "c":
                output += String.fromCharCode(arg);
                break;
            case "n":
                output += String.fromCharCode((arg >> 8) & 255, arg & 255);
                break;
            case "v":
                output += String.fromCharCode(arg & 255, (arg >> 8) & 255);
                break;
            case "N":
                output += String.fromCharCode((arg >> 24) & 255, (arg >> 16) & 255, (arg >> 8) & 255, arg & 255);
                break;
            case "V":
                output += String.fromCharCode(arg & 255, (arg >> 8) & 255, (arg >> 16) & 255, (arg >> 24) & 255);
                break;
            case "x":
                argi--;
                output += "\0";
                break;
            default:
                throw new Error("Unknown pack format character '"+c+"'");
        }
    }
    
    return output;
}
