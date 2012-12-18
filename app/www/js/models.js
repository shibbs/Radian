$().ns('RadianApp.Models');

$(document).ready(function () {
    var C = RadianApp.Constants;
    var M = RadianApp.Models;

    M.TimeLapse = Backbone.Model.extend({

        initialize: function (order) {
            if(order) this.order = order;
        },

        defaults: {
            name: "CURRENT",
            current: true,
            dateCreated: RadianApp.Utilities.formatDate(new Date()),
            timeLapse: C.TimeLapseType.NONE,
            degrees: 45,
            totalTimeHours: 1,
            totalTimeMinutes: 0,
            intervalMinutes: 0,
            intervalSeconds: 10,
            isClockwise: false, //False is counterclockwise
            shouldContinue: false,

            //BULB RAMPING
            isBulbRamping: false,
            startShutter: "1/25",
            durationHours: 0,
            durationMinutes: 45,
            delayHours: 0,
            delayMinutes: 0,
            expChange: "2",
            expType: "f/10min", //TODO: Make constant

            //SPEED RAMPING
            isSpeedRamping: false,
            speedRampingPoints: [],
            speedRampingCurved: false,

            //Hold
            hold: ".25", //default
            

            //Advanced
            isTimeDelay: false,
            timeDelayHours: 0,
            timeDelayMinutes: 0,
        },

        getStats: function () {
            var totalPhotos = Math.round((this.get('totalTimeHours') * 3600 + this.get('totalTimeMinutes') * 60) / (this.get('intervalMinutes') * 60 + this.get('intervalSeconds')));
            var degreesPerPhoto = RadianApp.Utilities.round(this.get('degrees') / totalPhotos, 2);
            var frameRate = RadianApp.Utilities.round(totalPhotos / RadianApp.app.get('fps'), 1);
            var stepIncreaseTime = (this.get('expType') === "f/10min") ? 10 : (this.get('totalTimeHours') * 60 + this.get('totalTimeMinutes')) / (totalPhotos/10);
            var finalShutter = eval(this.get('startShutter')) * Math.pow(2, eval(this.get('expChange')) * ((this.get('durationHours') * 60 + this.get('durationMinutes')) / stepIncreaseTime));
            
            return {
                totalPhotos: totalPhotos,
                degreesPerPhoto: degreesPerPhoto,
                frameRate: frameRate,
                direction: C.DirectionCanonical(this.get('isClockwise')),
                directionAbr: C.DirectionAbbr(this.get('isClockwise')),
                finalShutter: RadianApp.Utilities.round(finalShutter, 1),
                fps: RadianApp.app.get('fps'),
            };
        },

        getTotalPhotos: function(attrs) {
            return Math.round((attrs.totalTimeHours * 3600 + attrs.totalTimeMinutes * 60) / 
                              (attrs.intervalMinutes * 60 + attrs.intervalSeconds));
        },

        getDegreesPerPhoto: function(attrs) {
            var totalPhotos = this.getTotalPhotos(attrs);
            return RadianApp.Utilities.round(attrs.degrees / totalPhotos, 2);
        },

        getStepIncreaseTime: function(attrs) {
            return (attrs.expType === "f/10min") ? 10 : (attrs.totalTimeHours * 60 + attrs.totalTimeMinutes) / (this.getTotalPhotos(attrs)/10);
        },

        getFinalShutter: function(attrs) {
            return eval(attrs.startShutter) * Math.pow(2, eval(attrs.expChange) * (attrs.durationHours * 60 + attrs.durationMinutes) / this.getStepIncreaseTime(attrs));
        },

        getTemplateJSON: function () {
            return _.extend(
            this.toJSON(),
            this.getStats());
        },

        parse: function(json) {
            alert('worked');
        },

        validate: function(attrs) {
            var intervalTotalSeconds = attrs.intervalSeconds + attrs.intervalMinutes * 60;
            var durationTotalSeconds = attrs.totalTimeMinutes * 60 + attrs.totalTimeHours * 60 * 60;
            var degreesPerPhoto = this.getDegreesPerPhoto(attrs);
            var finalExposure = this.getFinalShutter(attrs);
            var delayTotalSeconds = attrs.delayMinutes * 60 + attrs.delayHours * 60 * 60;
            var brampDurationTotalSeconds = attrs.durationMinutes * 60 + attrs.durationHours * 60 * 60;

            var error = {};

            /* Radian cannot exceed 5 degrees per second. If user selects an interval in 
                which (degrees per photo/interval) > 5, a message should appear          */
            if(degreesPerPhoto / intervalTotalSeconds > 5) {
                error.message = "Radian cannot move this fast!";
            }

            //Interval must never be longer than total time, but can be equal to it.
            if(intervalTotalSeconds > durationTotalSeconds) {
                error.message = "Your interval cannot be longer than the total duration of your time-lapse!";
            }
            
            /* If user has chosen a non-zero number for degrees to move, and has 
               chosen a hold time that is more than 30% of the time-lapse interval */
            if(attrs.degrees > 0 && intervalTotalSeconds <= 3 && Number(attrs.hold) >= intervalTotalSeconds*.3) {
                error.message = "If your time-lapse interval is 3 seconds or less, your hold time can not exceed 30% of the interval!"; 
            }

            /* If user has chosen a non-zero number for degrees to move, interval is
               4 seconds or longer, and has chosen a hold time that is greater than 
               (Interval - 2 seconds). */
            if(attrs.degrees > 0 && intervalTotalSeconds >= 4 && Number(attrs.hold) > intervalTotalSeconds -2) {
                error.message = "If your time-lapse interval is 4 seconds or more, your hold time can be at most 2 seconds less than your interval. Otherwise Radian will move while you are still shooting!"; 
            }

            /* If user has chosen to move Radian 0 degrees, HOLD time can not equal 
               or exceed interval */
            if(attrs.degrees == 0 && Number(attrs.hold) >= intervalTotalSeconds) {
                error.message = "Your hold time cannot equal or exceed your time-lapse interval!";
            }

            /* Final exposure can at most = interval - 2 seconds */
            if(attrs.isBulbRamping && finalExposure > intervalTotalSeconds - 2) {
                error.message = "Your final exposure can be at most 2 seconds less than your interval, otherwise Radian will move while you are still shooting";
            }

            /* If infinity is set, then user can set whatever delay and duration they want, 
               as long as final exp is 2 seconds less than interval. */
            if(attrs.isBulbRamping && !attrs.shouldContinue && (delayTotalSeconds + brampDurationTotalSeconds) >= durationTotalSeconds) {
                error.message = "Delay + Bramp time cannot be longer than the total duration of your time-lapse!";
            }

            if(error.message) {
                 $.modal("<div style='width: 256px; font-family:\"Conv_Gotham-Medium\", Helvetica, Arial, sans-serif; font-size: 13.5px; color: rgb(30,30,30)'> \
                        <div>"+ error.message +"</div> \
                        <div class='cancelBox'> \
                            <div id='cancelAddNewPreset' class='simplemodal-close'>OK</div> \
                        </div> \
                        </div>", {  position: ['160px', '15px'] });
                 return true;
            }
        }
    });


    M.Queue = Backbone.Collection.extend({
        model: M.TimeLapse,

        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },

        comparator: function(timeLapse) {
         return timeLapse.get('order');
        }

    });

    M.Presets = Backbone.Collection.extend({
        model: M.TimeLapse,
        nextOrder: function() {
            if (!this.length) return 0;
            return this.last().get('order') + 1;
        },

        comparator: function(timeLapse) {
         return timeLapse.get('order');
        }
    });


    RadianApp.Models.App = Backbone.Model.extend({

        loadCollection: function(collection, key) {
            var value = window.localStorage.getItem(key);
            if(!value) return;
            var timeLapseJSONs = JSON.parse(value);

            for (var i = 0; i < timeLapseJSONs.length; i++) {
                collection.add(new M.TimeLapse(timeLapseJSONs[i]));
            };
        },

        loadFPS: function() {
            var value = window.localStorage.getItem("fps");
            if(!value) return 24;
            return Number(value);
        },

        setFPS: function(fps) {
            window.localStorage.setItem("fps", String(fps));
        },

        saveTimeLapseAsPreset: function(timeLapse, name) {
            var newTimeLapse = timeLapse.clone();
            newTimeLapse.set('order', this.presets.nextOrder());
            newTimeLapse.set('name', name);
            newTimeLapse.set('current', false);
            this.presets.add(newTimeLapse);
            window.localStorage.setItem("presets", JSON.stringify(this.presets));
            return newTimeLapse;
        },

        removeTimeLapseFromPresets: function(timeLapse) {
            this.presets.remove(timeLapse);
            timeLapse = null;
            window.localStorage.setItem("presets", JSON.stringify(this.presets));
        },

        addPresetToQueue: function(timeLapse) {
            var newTimeLapse = timeLapse.clone();
            newTimeLapse.set('order', this.queue.nextOrder());
            this.queue.add(newTimeLapse);
            window.localStorage.setItem("queue", JSON.stringify(this.queue));
        },

        removePresetFromQueue: function(timeLapse) {
            this.queue.remove(timeLapse);
            timeLapse = null;
            window.localStorage.setItem("queue", JSON.stringify(this.queue));
        },

        initialize: function () {
            this.visibleTimeLapse = new M.TimeLapse();
            this.runningTimeLapses = [];
            this.runningTimeLapseIndex = null;
            this.sentTime = null;
            this.soundPlaying = false;
            this.queue = new M.Queue();
            this.presets = new M.Presets();
            this.loadCollection(this.presets, "presets");
            this.loadCollection(this.queue, "queue");
            this.set('fps', this.loadFPS());
        },

        loadTimeLapse: function(timeLapse) {
            this.visibleTimeLapse.set(timeLapse.toJSON());
            // = null;
            //this.visibleTimeLapse = timeLapse.clone();
        },

        runTimeLapse: function(timeLapse) {
            if(this.queue.length > 0) {
                this.runningTimeLapses = this.queue.models;
            } else {
                this.runningTimeLapses = [timeLapse.clone()];
            }
            this.runningTimeLapseIndex = 0;
            this.sentTime = new Date();
            RadianApp.DataTransmission.send(this.runningTimeLapses);
        },

        advanceRunningTimeLapse: function() {
            if(this.runningTimeLapseIndex + 1 < this.runningTimeLapses.length) {
                this.runningTimeLapseIndex++;
                this.sentTime = new Date();
                return true;
            } 
            return false;
        },

        resetStartTime: function() {
            this.runningTimeLapseIndex = 0;
            this.sentTime = new Date();
        },

        getRunningTimeLapse: function() {
            return this.runningTimeLapses[this.runningTimeLapseIndex];
        },

        cancelRunningTimeLapses: function() {
            if(!this.runningTimeLapses) console.log('ERROR: No running TimeLapse Running');
            this.runningTimeLapseIndex = 0;
            this.runningTimeLapses = [];
            this.sentTime = null;
            this.queue.reset();
        }

    });

});