$().ns('RadianApp.DataTransmission');

RadianApp.DataTransmission.prepareTimeLapsePacket = function(model) {

	var DT = RadianApp.DataTransmission;
	var Sound = RadianApp.Sound;

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
        "hold": model.get("hold"),
        "expChange": model.get("expChange"),
        "expType": model.get("expType"), 

        //Time Delay
        "timeDelayHours": model.get("timeDelayHours"),
        "timeDelayMinutes": model.get("timeDelayMinutes"),

        //Speed ramping stuff
        "isSpeedRamping": model.get("isSpeedRamping"),
        "speedRampingPoints": RadianApp.Utilities.copyNestedArray(model.get("speedRampingPoints")),
        "speedRampingCurved": model.get("speedRampingCurved"),
	}

	// Convert to Protocol Data
	var standardTimeLapseData = new DT.StandardTimeLapseData({model: appModel});
	var bulbRampingData  = new DT.BulbRampingData({model: appModel});
	var speedRampingData  = new DT.SpeedRampingData({model: appModel});

    
	// Get Data Packet
	var dataArray = DT.combineData(standardTimeLapseData.toDataArray(), 
									bulbRampingData.toDataArray(),
									speedRampingData.toDataArray());
	return dataArray;
}

RadianApp.DataTransmission.send = function(models) {

	var DT = RadianApp.DataTransmission;
	var Sound = RadianApp.Sound;

	var settings = {
        "preloadMotion1": 60,
        "preloadMotion2": 80,
	}

	var dataArray = [];

	for (var i = 0; i < models.length; i++) {
		dataArray.push( DT.prepareTimeLapsePacket( models[i] ) );
	};

	var dataPacket = new DT.DataPacket({dataArray: dataArray, settings: settings});

	// Get Transmission Packet'
	var transmissionPacket = new DT.TransmissionPacket({data: dataPacket.getPacket()});
 	var dataToSend = transmissionPacket.getPacket();
 
 	//Generate Wav
 	var wavGenerator = new Sound.WavGenerator({packet: dataToSend });
 	var wavData = wavGenerator.getBase64Wav();

 	var wavName = "test.wav"; //TODO abstract
    
 	// Save file
 	setTimeout(function() {
 		if(!RadianApp.app.soundPlaying) {
            RadianApp.app.soundPlaying = true;
	       	RadianApp.Filesystem.saveBase64File(wavData, wavName, function(path) {
				//Play wav
				//TODO Save Volume
				//TODO Increase Volume
				Sound.play(path, function() {
					RadianApp.app.soundPlaying = false;
				});
				//TODO Change Volume back
			});
		}
     }, 1000);
}

