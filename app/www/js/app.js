//Check if android, if not then do device ready
document.addEventListener('deviceready', function() {
                       window.location.hash = 'home';
                          
                          }, false);

window.MobileAppRouter = Backbone.Router.extend({
	
    routes: {
        "": 'noop',
		//"panorama": 'panorama', Not needed in testing
		//"settings": 'settings', Not needed in testing
        "home": 'home',
        "timelapse": 'timeLapse',
		"timelapse/presets": 'timeLapsePresets',
		"timelapse/degrees": 'timeLapseDegrees',
		"timelapse/totaltime": 'timeLapseTotalTime',
		"timelapse/interval": 'timeLapseInterval',
		"timelapse/upload": 'timeLapseUpload',
		"timelapse/countdown": 'timeLapseCountDown',
		"timelapse/current": 'timeLapseCurrent',
        "timelapse/completed": 'timeLapseCompleted',
		"timelapse/queue": 'timeLapseQueue',
		"timelapse/advanced": 'timeLapseAdvanced',
        "timelapse/bulbramping": 'bulbramping',
        "timelapse/bulbramping/delay": 'bulbrampingDelay',
        "timelapse/bulbramping/duration": 'bulbrampingDuration',
        "timelapse/bulbramping/startshutter": 'bulbrampingStartShutter',
        "timelapse/bulbramping/exposurechange": 'bulbrampingExposureChange',
    },

    noop: function() {
    },

    home: function() {
        window.views.homeView.render();
    },

    timeLapse: function() {
        window.views.timeLapseView.render();
    },

	timeLapsePresets: function() {
        window.views.timeLapsePresetsView.render();
    },

	timeLapseDegrees: function() {
        window.views.timeLapseDegreesView.render();
    },

	timeLapseTotalTime: function() {
        window.views.timeLapseTotalTimeView.render();
    },

	timeLapseInterval: function() {
        window.views.timeLapseIntervalView.render();
    },

	timeLapseCountDown: function() {
        window.views.timeLapseCountDownView.render();
    },

	timeLapseUpload: function() {
        window.views.timeLapseUploadView.render();
    },

	timeLapseCurrent: function() {
		window.views.timeLapseCurrent = new window.views.TimeLapseCurrent({model: window.running_program});
        window.views.timeLapseCurrent.render();
    },

	timeLapseQueue: function() {
        window.views.timeLapseQueueView.render();
    },

	timeLapseAdvanced: function() {
        window.views.timeLapseAdvancedView.render();
    },

    timeLapseCompleted: function() {
        window.views.timeLapseCompletedView.render();
    },

    bulbramping: function() {
        window.views.bulbRampingView.render();
    },

    bulbrampingDelay: function() {
        window.views.bulbRampingDelay.render();
    },

    bulbrampingDuration: function() {
        window.views.bulbRampingDuration.render();
    },

    bulbrampingStartShutter: function() {
        window.views.bulbRampingStartShutter.render();
    },

    bulbrampingExposureChange: function() {
        window.views.bulbRampingExposureChange.render();
    }

});

$(document).ready(function() {
    window.mobileRouter = new MobileAppRouter();
    Backbone.history.start();
    //window.location.hash = 'timelapse';
});