$().ns('RadianApp.Router');

$(document).ready(function () {
    RadianApp.Router = Backbone.Router.extend({
    	
        routes: {
            "": 'noop',
    		"settings": 'settings', 
            "settings/framerate": 'settingsFrameRate',
            "settings/about": 'settingsAbout',
            "settings/use": 'settingsUse',
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
            //"timelapse/queue/add": 'timeLapseQueueAdd',
    		"timelapse/advanced": 'timeLapseAdvanced',
            "timelapse/speedramping": 'speedRamping',
            "timelapse/bulbramping": 'bulbramping',
            "timelapse/bulbramping/delay": 'bulbrampingDelay',
            "timelapse/bulbramping/duration": 'bulbrampingDuration',
            "timelapse/bulbramping/startshutter": 'bulbrampingStartShutter',
            "timelapse/bulbramping/exposurechange": 'bulbrampingExposureChange',
            "timelapse/timedelay": 'timeLapseTimeDelay',
            "timelapse/hold": 'timeLapseHold',
        },

        noop: function() {
        },

        home: function() {
            if(RadianApp.app.currentView) {
                RadianApp.app.currentView.close();
            }
            RadianApp.app.currentView = new RadianApp.Views.HomeView();
            RadianApp.app.currentView.render();
        },

        settings: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.SettingsView();
            RadianApp.app.currentView.render();
        },

        settingsFrameRate: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.SettingsFrameRateView();
            RadianApp.app.currentView.render();
        },
        
        settingsAbout: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.SettingsAboutView();
            RadianApp.app.currentView.render();
        },

        settingsUse: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.SettingsUseView();
            RadianApp.app.currentView.render();
        },

        timeLapse: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapsePresets: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapsePresetsView();
            RadianApp.app.currentView.render();
        },

    	timeLapseDegrees: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseDegreesView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseTotalTime: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseTotalTimeView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseInterval: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseIntervalView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseCountDown: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseCountDownView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseUpload: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseUploadView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseCurrent: function() {
            RadianApp.app.currentView.close();
    		RadianApp.app.currentView =  new RadianApp.Views.TimeLapseCurrent({model: window.running_program});
            RadianApp.app.currentView.render();
        },

    	timeLapseQueue: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseQueueView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        timeLapseQueueAdd: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseQueueAddView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseAdvanced: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseAdvancedView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        timeLapseCompleted: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseCompletedView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        speedRamping: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.SpeedRampingView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbramping: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingDelay: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingDelay({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingDuration: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingDuration({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingStartShutter: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingStartShutter({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingExposureChange: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingExposureChange({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        timeLapseTimeDelay: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseTimeDelay({model: RadianApp.app});
            RadianApp.app.currentView.render();
        },

        timeLapseHold: function() {
            RadianApp.app.currentView.close();
            RadianApp.app.currentView =  new RadianApp.Views.TimeLapseHoldView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    });
}());