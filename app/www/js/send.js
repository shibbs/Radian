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
	var standardTimeLapseData = new StandardTimeLapseData({model: appModel});
	var bulbRampingData  = new bulbRampingData({model: appModel});

    
	// Get Data Packet
	var dataArray = combineData(standardTimeLapseData.toDataArray(), bulbRampingData.toDataArray());
	var dataPacket = new DataPacket({data: dataArray });

	// Get Transmission Packet'
	var transmissionPacket = new TransmissionPacket({data: dataPacket.getPacket() });
 	var dataToSend = transmissionPacket.getPacket();
 
 	//Generate Wav
 	var wavGenerator = new WavGenerator({packet: dataToSend });
 	var wavData = wavGenerator.getBase64Wav();

 	var wavName = "test.wav"; //TODO abstract
    
 	// Save file
 	setTimeout(function() {
               saveBase64File(wavData, wavName, function(path) {
                              //Play wav
                              playSound(path);
                              //TODO update volume
                              });
               }, 1000);
}

