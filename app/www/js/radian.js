// RadianApp is the base namespace
$().ns('RadianApp');
$().ns('RadianApp.app');

$(document).ready(function() {

// Create a new RadianApp

//});

	document.addEventListener('deviceready', function() {

		RadianApp.app = new RadianApp.Models.App();

	    
	    onBackKeyDown = function() {
	        // Handle the back button
	        if($('#simplemodal-data').length) {
	        	$.modal.close();
	        	return;
	        }
	        window.location.hash = RadianApp.app.backButton;
	    }
	    document.addEventListener("backbutton", onBackKeyDown, false);
    
 

	}, false);
});