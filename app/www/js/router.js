$().ns('RadianApp.Router');

$(document).ready(function () {
    RadianApp.Router = Backbone.Router.extend({
    	
        routes: {
            "": 'noop',
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
            "timelapse/timedelay": 'timeLapseTimeDelay',
        },

        noop: function() {
        },

        home: function() {
            RadianApp.Views.homeView.render();
        },

        timeLapse: function() {
            RadianApp.Views.timeLapseView.render();
        },

    	timeLapsePresets: function() {
            RadianApp.Views.timeLapsePresetsView.render();
        },

    	timeLapseDegrees: function() {
            RadianApp.Views.timeLapseDegreesView.render();
        },

    	timeLapseTotalTime: function() {
            RadianApp.Views.timeLapseTotalTimeView.render();
        },

    	timeLapseInterval: function() {
            RadianApp.Views.timeLapseIntervalView.render();
        },

    	timeLapseCountDown: function() {
            RadianApp.Views.timeLapseCountDownView.render();
        },

    	timeLapseUpload: function() {
            RadianApp.Views.timeLapseUploadView.render();
        },

    	timeLapseCurrent: function() {
    		RadianApp.Views.timeLapseCurrent = new RadianApp.Views.TimeLapseCurrent({model: window.running_program});
            RadianApp.Views.timeLapseCurrent.render();
        },

    	timeLapseQueue: function() {
            RadianApp.Views.timeLapseQueueView.render();
        },

    	timeLapseAdvanced: function() {
            RadianApp.Views.timeLapseAdvancedView.render();
        },

        timeLapseCompleted: function() {
            RadianApp.Views.timeLapseCompletedView.render();
        },

        bulbramping: function() {
            RadianApp.Views.bulbRampingView.render();
        },

        bulbrampingDelay: function() {
            RadianApp.Views.bulbRampingDelay.render();
        },

        bulbrampingDuration: function() {
            RadianApp.Views.bulbRampingDuration.render();
        },

        bulbrampingStartShutter: function() {
            RadianApp.Views.bulbRampingStartShutter.render();
        },

        bulbrampingExposureChange: function() {
            RadianApp.Views.bulbRampingExposureChange.render();
        },

        timeLapseTimeDelay: function() {
            RadianApp.Views.timeLapseTimeDelayView.render();
        },

    });
}());