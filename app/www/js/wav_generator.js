/* WavGenerator
 * -------------
 * Encodes any array of 1's and 0's into highs and lows
 *
 * Example
 * var wavGenerator = new WavGenerator({packet: int8Array });
 * wavGenerator.getBase64Wav();
 */

var WavGenerator = Backbone.Model.extend({

    defaults: {
        "channels":  1,
        "sampleRate":   2024,
        "bitsPerSample": 16,
    },

    getSoundChunk: function() {
        var packet = this.get("packet"); // Here's the packet
        var channels = this.get("channels");
        var sampleRate = this.get("sampleRate");
        var bitsPerSample = this.get("bitsPerSample");

        // Constants that mostly need for the sine generation
        var samples = 0;
        var frequency = 440;
        var volume = 32767;
        var seconds = 2.0;

        var data = [];
        var samples = 0;

        /* ******** EDIT HERE *********** */
        for (var i = 0; i < packet.length; i++) {
                var v = packet[i] ? volume : -volume; 
                data.push(pack("v", v));
                samples++;
        }
        
        data = data.join('');

        // Data sub-chunk (contains the sound)
        var sound_chunk = [
            "data", // Sub-chunk identifier
            pack("V", samples * channels * bitsPerSample / 8), // Chunk length
            data
        ].join('');


        return sound_chunk;
    },

    getBase64Wav: function() {
        var channels = this.get("channels");
        var sampleRate = this.get("sampleRate");
        var bitsPerSample = this.get("bitsPerSample");

        // Format sub-chunk
        var chunk1 = [
            "fmt ", // Sub-chunk identifier
            pack("V", 16), // Chunk length
            pack("v", 1), // Audio format (1 is linear quantization)
            pack("v", channels),
            pack("V", sampleRate),
            pack("V", sampleRate * channels * bitsPerSample / 8), // Byte rate
            pack("v", channels * bitsPerSample / 8),
            pack("v", bitsPerSample)
        ].join('');

        var sound_chunk = this.getSoundChunk();
        
        // Header
        var header = [
            "RIFF",
            pack("V", 4 + (8 + chunk1.length) + (8 + sound_chunk.length)), // Length
            "WAVE"
        ].join('');

        var out = [header, chunk1, sound_chunk].join('');
        var base64Encoded = escape(btoa(out));
        console.log(out);
        return base64Encoded;
    }


})

/* TODO: Abstract to utilities namespace and check if needed */
// Base 64 encoding function, for browsers that do not support btoa()
// by Tyler Akins (http://rumkin.com), available in the public domain
if (!window.btoa) {
    function btoa(input) {
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
}

/* TODO: Abstract to utilities namespace */
// pack() emulation (from the PHP version), for binary crunching
function pack(fmt) {
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

