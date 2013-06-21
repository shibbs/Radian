(function () {
	window.location.hash = '';

	isRadianWeb = false;
	isDroid = false;//navigator.userAgent.match(/Android/); //polluting global, TODO: wrap under radianapp

	var loadScript = function(src) {
		var line = "<script src='"+src+"'><\/script>";
		document.writeln(line);
	};
	if(!isRadianWeb) {
		if (isDroid) {
			loadScript('js/lib/cordova-2.8.0_android.js');
		} else {
			loadScript('js/lib/cordova-2.8.0_ios.js');
		}
	}
	var PRODUCTION = 1;
	if(PRODUCTION) {
	  var noOp = function(){}; // no-op function
	  console = {
	    log: noOp,
	    warn: noOp,
	    error: noOp
	  }
	} 
})();