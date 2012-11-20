var appModel = {
	"rotationDegrees": 10,
    "rotationDirection": false,
    "intervalMinutes": 10,
    "intervalSeconds": 2,
    "lengthHours": 2,
    "lengthMinutes": 1,
    "shouldStopAtEnd": false
}
// DataProtocol Tests
var protocolData = new ProtocolData({model: appModel});
var result = protocolData.toDataArray();
//[10, 0, 10, 2, 2, 1, 0]

var dT = new DataTransmission({data: [2,23,1,4,3,2]});
var result = dT.getPacket();
//[0, 0, 0, 0, 231, 2, 23, 1, 4, 3, 2, 35, 235, 0, 0, 0, 0]

var dT = new TransmissionPacket({data: [4,1]});
var result = dT.getPacket();
console.log(result);


var send_data = function() {
	var appModel = {
		"rotationDegrees": 10,
	    "rotationDirection": false,
	    "intervalMinutes": 10,
	    "intervalSeconds": 2,
	    "lengthHours": 2,
	    "lengthMinutes": 1,
	    "shouldStopAtEnd": false
	}

	// Convert to Protocol Data
	var protocolData = new ProtocolData({model: appModel});

	// Get Data Packet
	var protocolDataArray = protocolData.toDataArray()
	var dataPacket = new DataPacket({data: protocolDataArray });

	// Get Transmission Packet
	var transmissionPacket = new TransmissionPacket({data: int8Array });
 	var dataToSend = transmissionPacket.getPacket();

 	console.log(dataToSend);
 	//Generate Wav
 	var wavGenerator = new WavGenerator({data: dataToSend });
 	var wavData = wavGenerator.getBase64Wav();

 	var wavName = "test.wav"; //TODO abstract
 	// Save file
 	saveBase64File(wavData, wavName, function() {
 		//Play wav
 		playSound(wavName);
 		//TODO update volume
 	});
}
