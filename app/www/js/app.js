document.addEventListener('deviceready', function() {
                       //  window.location.hash = 'timelapse';
                        //  alert("About to send data");
                          send_data();
                          }, false);

window.MobileAppRouter = Backbone.Router.extend({
	
    routes: {
        "": 'noop',
		//"panorama": 'panorama', Not needed in testing
		//"settings": 'settings', Not needed in testing
        "timelapse": 'timeLapse',
		"timelapse/presets": 'timeLapsePresets',
		"timelapse/degrees": 'timeLapseDegrees',
		"timelapse/totaltime": 'timeLapseTotalTime',
		"timelapse/interval": 'timeLapseInterval',
		"timelapse/upload": 'timeLapseUpload',
		"timelapse/upload/inprogress": 'timeLapseUploadInProgress',
		"timelapse/countdown": 'timeLapseCountDown',
		"timelapse/current": 'timeLapseCurrent',
		"timelapse/queue": 'timeLapseQueue',
		"timelapse/advanced": 'timeLapseAdvanced',
    },

    noop: function() {
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

	timeLapseUploadInProgress: function() {
        window.views.timeLapseUploadInProgressView.render();
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

});

$(document).ready(function() {
    window.mobileRouter = new MobileAppRouter();
    Backbone.history.start();
});