/* DATA TRANSMISSION
 * -----------------
 * These models provide a way to convert the raw app data into 
 * packets that eventually be sent over the wire.  Much like a
 * networking stack, it has been architected in layers.
 * 
 * Architecture:
 * ProtocolData - performs transforms on the general app data
 * DataPacket - formats the data into a packet (human readable)
 * TransmissionPacket - performs the final transform on the data packet.
 *
 * Todos:
 * - more test cases
 * - no namespace pollution
 */


/* ProtocolData
 * -------------
 * A model representing the data in form specified in the protocol.
 * It takes in AppData model and applies the necessary transforms.
 *
 * Example
 * var protocolData = new ProtocolData({model: appData});
 * protocolData.toDataArray();
 */
var ProtocolData = Backbone.Model.extend({

    ordering: [
                "rotationDegrees",
                "rotationDirection",
                "intervalMinutes",
                "intervalSeconds",
                "lengthHours",
                "lengthMinutes",
                "shouldStopAtEnd"
               ],

    initialize: function() {
        var model = this.get('model');
        this.rotationDegrees = model.rotationDegrees / 5;
        this.rotationDirection = (model.rotationDirection) ? 1 : 0;
        this.intervalMinutes = model.intervalMinutes;
        this.intervalSeconds = model.intervalSeconds;
        this.lengthHours = model.lengthHours;
        this.lengthMinutes = model.lengthMinutes;
        this.shouldStopAtEnd = (model.shouldStopAtEnd) ? 1 : 0;
    },

    // Outputs data with the respect to ordering into an array of ints
    toDataArray: function() {
        var model = this.get('model');
        var data = new Int8Array(this.ordering.length);
        for (var i = this.ordering.length - 1; i >= 0; i--) {
            data[i] = this[this.ordering[i]];
        };
        return data;
    }

});

/* DataPacket
 * -------------
 * A model representing the data in packet form.
 * It creates the following packet from any int8 array.
 *   _________________
 *  | (4) DEAD BYTES  | 
 *  |-----------------|
 *  |    START FLAG   |
 *  |-----------------|
 *  |     THE DATA    |
 *  |-----------------|
 *  |     CHECKSUM    |
 *  |-----------------|
 *  |     ENDFLAG     |
 *  |-----------------|
 *  | (4) DEAD BYTES  |
 *  |-----------------|
 *
 *  DEAD BYTE = a predefined byte, can be specified at initialization
 *  START FLAG = a predefined byte, can be specified at initialization
 *  CHECKSUM = unsigned int8 that is the sum of all of the data array
 *  END FLAG = a predefined byte, can be specified at initialization
 *  
 * Example
 * var dataPacket = new DataPacket({data: int8Array });
 * dataPacket.getPacket();
 */
var DataPacket = Backbone.Model.extend({
    TOTAL_EXTRA_BYTES: 3,

    defaults: {
        "startFlag":  231,
        "stopFlag":   235,
        "deadByte":   0xFF,
        "numDeadBytes": 4 //Total number of dead bytes to padd the packet with
    },

    setChecksum: function(data) {
        var checkSum = new Uint8Array(1); // Hackery to get unsigned int
        for (var i = data.length - 1; i >= 0; i--) {
            checkSum[0] += data[i];
        };
        this.set('checkSum', checkSum[0]%230);
    },

    initialize: function() {
        this.setChecksum(this.get('data'));
    },

    getPacket: function() {
        var data = this.get('data');
        var size = 2 * this.get("numDeadBytes") + this.TOTAL_EXTRA_BYTES + data.length;
        var packet = new Uint8Array(size);

        var i = 0;

        // Initial Dead Bytes
        for (; i < this.get("numDeadBytes"); i++) {
            packet[i] = this.get("deadByte");
        };

        // Start Flag
        packet[i++] = this.get("startFlag");

        // The Data
        var ending_index = data.length + i;
        var j = 0;
        for (; i < ending_index; i++) {
            packet[i] = data[j++];
        };

        // Checksum
        packet[i++] = this.get("checkSum");

        // Stop Flag
        packet[i++] = this.get("stopFlag");

        // Ending Dead Bytes
        for (; i < this.get("numDeadBytes"); i++) {
            packet[i] = this.get("deadByte");
        };
        return packet;
    }
});


/* TransmissionPacket
 * -------------
 * A model that represents the data in a transferrable way.
 * It turns the bits from MSB to LSB into an INT8 array with 
 * a start bit and end bit as padding.  It also stretches the
 * array depending on the stretch factor which causes each
 * element to repeat.
 * It creates the following packet from any int8 array when
 * stretch factor is 1.
 *
 *       int8 array
 *   _________________
 *  |    START BIT    | 
 *  |-----------------|
 *  |      BIT_0      |
 *  |-----------------|
 *  |      BIT_1      | <- bit value of the bytes of data
 *  |-----------------|
 *  |      BIT_2      |
 *  |-----------------|
            ...
 *  |-----------------|
 *  |      BIT_8      |
 *  |-----------------|
 *  |     END BIT     | 
 *  |-----------------|
 *          ...         <- continues for all data arrays
 *
 *  START BIT = a predefined bit, defaults to 0
 *  END BIT = a predefined bit, defaults to 0
 *  stretchFactor = the amount to duplicate each element, defaults to 50
 *  
 * Example
 * var transmissionPacket = new TransmissionPacket({data: int8Array });
 * transmissionPacket.getPacket();
 */
var TransmissionPacket = Backbone.Model.extend({
    TOTAL_SEGMENT_SIZE: 10,

    defaults: {
        "startBit":  0,
        "stopBit":   1,
        "stretchFactor":  44,
    },
                                               
                                    
    stretchPacket: function(numArray) {
        var packet = new Uint8Array(numArray.length * this.get("stretchFactor"));
        var packet_index = 0;
                                               

        for (var i = 0; i < numArray.length; i++) {
            for (var z = 0; z < this.get("stretchFactor"); z++) {
                packet[packet_index++] = numArray[i];
            };
        };
        return packet;
    },

    invertPacket: function(numArray) {
        var packet = new Uint8Array(numArray.length);
        for (var i = packet.length - 1; i >= 0; i--) {
           packet[i] = numArray[i] ? 0 : 1;
        };

        return packet;
    },

    combinePackets: function(packet1, packet2) {
        var packet = new Uint8Array(packet1.length + packet2.length);

        var i = 0;
        for (; i < packet1.length; i++) {
            packet[i] = packet1[i]
        };

        for (var j = 0; j < packet2.length; j++) {
            packet[i++] = packet2[j];
        };

        return packet;
    },

    calculatePacket: function() {
        var data = this.get('data');
        var size = this.TOTAL_SEGMENT_SIZE * data.length;
        var packet = new Uint8Array(size);

        var packet_index = 0;
        for (var byte_index = 0; byte_index < data.length; byte_index++) {

            // Start bit
            packet[packet_index++] = this.get("startBit");
                                            
            // The Data
            var current_byte = data[byte_index];
            for (var j = 0; j <8; j++) {
                var mask = 1 << j;
                var bit = Number((current_byte & mask) != 0);
                packet[packet_index++] = bit;
            };

            // End bit
            packet[packet_index++] = this.get("stopBit");

        };

        return packet;
    },

    getPacket: function() {
        var packet = this.calculatePacket();
        var stretchedPacket = this.stretchPacket(packet);
        var invertedPacket = this.invertPacket(stretchedPacket);
        return this.combinePackets(stretchedPacket, invertedPacket);
    }
});
