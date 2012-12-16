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
            degrees: 120,
            totalTimeHours: 2,
            totalTimeMinutes: 30,
            intervalMinutes: 0,
            intervalSeconds: 15,
            isClockwise: false, //False is counterclockwise
            shouldContinue: false,

            //BULB RAMPING
            isBulbRamping: false,
            startShutter: "30",
            durationHours: 2,
            durationMinutes: 30,
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

        getTemplateJSON: function () {
            return _.extend(
            this.toJSON(),
            this.getStats());
        },

        parse: function(json) {
            alert('worked');
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
            this.runningTimeLapse = null;
            this.sentTime = null;
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
            this.runningTimeLapse = timeLapse.clone();
            this.sentTime = new Date();
            RadianApp.DataTransmission.send(this.runningTimeLapse);
        },

        resetStartTime: function() {
            this.sentTime = new Date();
        },

        cancelRunningTimeLapse: function() {
            if(!this.runningTimeLapse) console.log('ERROR: No running TimeLapse Running');
            this.runningTimeLapse = null;
            this.sentTime = null;
            this.queue.reset();
        }

    });

});