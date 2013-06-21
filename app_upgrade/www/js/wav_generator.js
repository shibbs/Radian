$().ns('RadianApp.Sound');

/* WavGenerator
 * -------------
 * Encodes any array of 1's and 0's into highs and lows
 *
 * Example
 * var wavGenerator = new WavGenerator({packet: int8Array });
 * wavGenerator.getBase64Wav();
 */

$(function(){
    var pack = RadianApp.Utilities.pack;
    var btoa = RadianApp.Utilities.btoa;

    RadianApp.Sound.WavGenerator = Backbone.Model.extend({

        defaults: {
            "channels":  1,
            "sampleRate":   44100,
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

    });

}());


