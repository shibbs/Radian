$().ns('RadianApp.Router');

$(document).ready(function () {

    RadianApp.Router = Backbone.Router.extend({
    	
        routes: {
            "": 'noop',
    		"settings": 'settings', 
            "settings/framerate": 'settingsFrameRate',
            "settings/about": 'settingsAbout',
            "settings/use": 'settingsUse',
            "settings/version": 'settingsVersion',
            "home": 'home',
            "timelapse": 'timeLapse',
    		"presets": 'timeLapsePresets',
    		"timelapse/degrees": 'timeLapseDegrees',
    		"timelapse/totaltime": 'timeLapseTotalTime',
    		"timelapse/interval": 'timeLapseInterval',
    		"timelapse/upload": 'timeLapseUpload',
    		"timelapse/countdown": 'timeLapseCountDown',
    		"timelapse/current": 'timeLapseCurrent',
            "timelapse/completed": 'timeLapseCompleted',
    		"queue": 'timeLapseQueue',
            'queue/add': 'queueAdd',
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
            RadianApp.app.backButton = 'home';
            RadianApp.app.currentView = new RadianApp.Views.HomeView();
            RadianApp.app.currentView.render();
        },

        settings: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'home';
            RadianApp.app.currentView = new RadianApp.Views.SettingsView();
            RadianApp.app.currentView.render();
        },

        settingsFrameRate: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'settings';
            RadianApp.app.currentView = new RadianApp.Views.SettingsFrameRateView();
            RadianApp.app.currentView.render();
        },
        
        settingsAbout: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'settings';
            RadianApp.app.currentView = new RadianApp.Views.SettingsAboutView();
            RadianApp.app.currentView.render();
        },

        settingsUse: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'settings';
            RadianApp.app.currentView = new RadianApp.Views.SettingsUseView();
            RadianApp.app.currentView.render();
        },

        settingsVersion: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'settings';
            RadianApp.app.currentView = new RadianApp.Views.SettingsVersion();
            RadianApp.app.currentView.render();
        },

        timeLapse: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'home';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapsePresets: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'home';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapsePresetsView();
            RadianApp.app.currentView.render();
        },

    	timeLapseDegrees: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseDegreesView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseTotalTime: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseTotalTimeView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseInterval: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseIntervalView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseCountDown: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/upload';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseCountDownView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseUpload: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            if(RadianApp.app.isRunningSingleTimeLapse) {
                RadianApp.app.backButton = 'timelapse';
            } else {
                RadianApp.app.backButton = 'queue';
            }
            
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseUploadView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    	timeLapseCurrent: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/upload';
    		RadianApp.app.currentView =  new RadianApp.Views.TimeLapseCurrent({model: window.running_program});
            RadianApp.app.currentView.render();
        },

    	timeLapseQueue: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'home';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseQueueView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        queueAdd: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'queue';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseQueueAddView();
            RadianApp.app.currentView.render();
        },
        
    	timeLapseAdvanced: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseAdvancedView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        timeLapseCompleted: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/upload';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseCompletedView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        speedRamping: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/advanced';
            RadianApp.app.currentView = new RadianApp.Views.SpeedRampingView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbramping: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/advanced';
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingDelay: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/bulbramping';
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingDelay({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingDuration: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/bulbramping';
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingDuration({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingStartShutter: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/bulbramping';
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingStartShutter({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        bulbrampingExposureChange: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/bulbramping';
            RadianApp.app.currentView = new RadianApp.Views.BulbRampingExposureChange({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

        timeLapseTimeDelay: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/advanced';
            RadianApp.app.currentView = new RadianApp.Views.TimeLapseTimeDelay({model: RadianApp.app});
            RadianApp.app.currentView.render();
        },

        timeLapseHold: function() {
            if(!RadianApp.app.currentView) {
                window.location.hash = 'home';
                return;
            }
            RadianApp.app.currentView.close();
            RadianApp.app.backButton = 'timelapse/advanced';
            RadianApp.app.currentView =  new RadianApp.Views.TimeLapseHoldView({
                model: RadianApp.app
            });
            RadianApp.app.currentView.render();
        },

    });
}());