var screenOrientation = function() {}

screenOrientation.prototype.set = function(str, success, fail) {
	try {
		if(device.platform !== 'Android') {
			var args = {};
	    	args.key = str;
	    	PhoneGap.exec(success, fail, "ScreenOrientation", "set", [args]);
		} else {
			if(str === 'landscape') {
				str = 'sensorLandscape';
			}
			PhoneGap.exec(success, fail, "ScreenOrientation", "set", [str]);
		}
	} catch(e) {
	}
};
navigator.screenOrientation = new screenOrientation();
