var send_data = function(model) {

	//TODO: rewrite app model
	var appModel = {
		"rotationDegrees": model.get("degrees"),
	    "rotationDirection": !model.get("isClockwise"),
	    "intervalMinutes": model.get("intervalMinutes"),
	    "intervalSeconds": model.get("intervalSeconds"),
	    "lengthHours": model.get("totalTimeHours"),
	    "lengthMinutes": model.get("totalTimeMinutes"),
	    "shouldStopAtEnd": false //TODO implement in UI
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

