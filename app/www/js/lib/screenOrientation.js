var screenOrientation = function() {}

screenOrientation.prototype.set = function(str, success, fail) {
	try{
		var args = {};
    	args.key = str;
    	PhoneGap.exec(success, fail, "ScreenOrientation", "set", [args]);
	} catch(e) {

	}

};
navigator.screenOrientation = new screenOrientation();
