(function () {
	window.location.hash = '';

	isRadianWeb = true;
	isDroid = true;//navigator.userAgent.match(/Android/); //polluting global, TODO: wrap under radianapp

	var loadScript = function(src) {
		var line = "<script src='"+src+"'><\/script>";
		document.writeln(line);
	};
	if(!isRadianWeb) {
		if (isDroid) {
			loadScript('js/lib/cordova-2.2.0_android.js');
		} else {
			loadScript('js/lib/cordova-2.2.0_ios.js');
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