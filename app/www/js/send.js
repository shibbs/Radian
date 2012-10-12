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

	// Get Transmission Packet'
	var transmissionPacket = new TransmissionPacket({data: dataPacket.getPacket() });
 	var dataToSend = transmissionPacket.getPacket();

 	//Generate Wav
 	var wavGenerator = new WavGenerator({data: dataToSend });
 	var wavData = wavGenerator.getBase64Wav();

 	var wavName = "test.wav"; //TODO abstract
    
 	// Save file
 	setTimeout(function() {
               saveBase64File(wavData, wavName, function() {
                              //Play wav
                              playSound(wavName);
                              //TODO update volume
                              });
               }, 1000);
}

