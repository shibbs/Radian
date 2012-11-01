var send_data = function(model) {

	//TODO: rewrite app model
	var appModel = {
		"rotationDegrees": model.get("degrees"),
	    "rotationDirection": !model.get("isClockwise"),
	    "intervalMinutes": model.get("intervalMinutes"),
	    "intervalSeconds": model.get("intervalSeconds"),
	    "lengthHours": model.get("totalTimeHours"),
	    "lengthMinutes": model.get("totalTimeMinutes"),
	    "shouldStopAtEnd": model.get("shouldContinue"),
	    "isBulbRamping": model.get("isBulbRamping"),
        "startShutter": model.get("startShutter"),
        "durationHours": model.get("durationHours"),
        "durationMinutes": model.get("durationMinutes"),
        "delayHours": model.get("delayHours"),
        "delayMinutes": model.get("delayMinutes"),
        "expChange": model.get("expChange"),
        "expType": model.get("expType"), 
	}

	// Convert to Protocol Data
	var standardTimeLapseData = new StandardTimeLapseData({model: appModel});
	var bulbRampingData  = new BulbRampingData({model: appModel});

    
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

