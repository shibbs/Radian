$().ns('RadianApp.DataTransmission');

RadianApp.DataTransmission.send = function(model) {

	var DT = RadianApp.DataTransmission;
	var Sound = RadianApp.Sound;

	//TODO: rewrite app model
	var appModel = {
		"timeLapse": model.get("timeLapse"),
		"rotationDegrees": model.get("degrees"),
	    "rotationDirection": !model.get("isClockwise"),
	    "intervalMinutes": model.get("intervalMinutes"),
	    "intervalSeconds": model.get("intervalSeconds"),
	    "lengthHours": model.get("totalTimeHours"),
	    "lengthMinutes": model.get("totalTimeMinutes"),
	    "shouldContinue": model.get("shouldContinue"),
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
	var standardTimeLapseData = new DT.StandardTimeLapseData({model: appModel});
	var bulbRampingData  = new DT.BulbRampingData({model: appModel});

    
	// Get Data Packet
	var dataArray = DT.combineData(standardTimeLapseData.toDataArray(), bulbRampingData.toDataArray());
	var dataPacket = new DT.DataPacket({data: dataArray });

	// Get Transmission Packet'
	var transmissionPacket = new DT.TransmissionPacket({data: dataPacket.getPacket() });
 	var dataToSend = transmissionPacket.getPacket();
 
 	//Generate Wav
 	var wavGenerator = new Sound.WavGenerator({packet: dataToSend });
 	var wavData = wavGenerator.getBase64Wav();

 	var wavName = "test.wav"; //TODO abstract
    
 	// Save file
 	setTimeout(function() {
       	RadianApp.Filesystem.saveBase64File(wavData, wavName, function(path) {
			//Play wav
			//TODO Save Volume
			//TODO Increase Volume
			Sound.play(path);
			//TODO Change Volume back
		});
     }, 1000);
}

