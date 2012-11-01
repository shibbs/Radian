//Random Util should be removed
_.mixin({
    round: function roundNumber(num, dec) {
        var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
        return result;
    }
});

var Constants = {};
Constants.TimeLapseType = {
    NONE : 0,
    PAN : 1,
    TILT : 2,

}
Constants.Direction = {
    CLOCKWISE : false,
    COUNTERCLOCKWISE : true,
}

var c = Constants;

var TimeLapse = Backbone.Model.extend({

    defaults: {
        timelapse: c.TimeLapseType.NONE,
        degrees: 120,
        totalTimeHours: 2,
        totalTimeMinutes: 30,
        intervalMinutes: 0,
        intervalSeconds: 15,
        isClockwise: c.Direction.COUNTERCLOCKWISE, 
        shouldContinue: true,


    },

    getStats: function () {
        var totalPhotos = Math.round((this.get('totalTimeHours') * 3600 + this.get('totalTimeMinutes') * 60) / (this.get('intervalMinutes') * 60 + this.get('intervalSeconds')));
        var degreesPerPhoto = _.round(this.get('degrees') / totalPhotos, 2);
        var frameRate = _.round(totalPhotos / 24, 1);
        return {
            totalPhotos: totalPhotos,
            degreesPerPhoto: degreesPerPhoto,
            frameRate: frameRate,
            direction: this.direction(),
            directionAbr: this.directionAbr(),
        };
    },

    getTemplateJSON: function () {
        return _.extend(
        this.toJSON(),
        this.getStats());
    }

});

//Active TimeLapse
//Queue (Collection of TimeLapses) (also stored in the DB)
//Presets (Collection of TimeLapses (which are stored in the DB))
var RadianApp = Backbone.Model.extend({

    initialize: function () {

    },

    defaults: {
        timelapse: c.TimeLapseType.NONE,
        degrees: 120,
        totalTimeHours: 2,
        totalTimeMinutes: 30,
        intervalMinutes: 0,
        intervalSeconds: 15,
        isClockwise: false, //False is counterclockwise
    },

    //abstract
    direction: function () {
        if (this.get('isClockwise')) {
            return "CLOCKWISE";
        }
        return "COUNTER-CLOCKWISE";
    },
    //abstract
    directionAbr: function () {
        if (this.get('isClockwise')) {
            return "CW";
        }
        return "CCW";
    },

    isIOS: function () {
      return device.platform === "iPhone";
    }

});

Constants.ExpPowerType = {
    MINUTE : false,
    FRAME : true,
}

var RadianApp = Backbone.Model.extend({

    initialize: function () {

    },

    defaults: {
        timeLapse: c.TimeLapseType.NONE,
        degrees: 120,
        totalTimeHours: 2,
        totalTimeMinutes: 30,
        intervalMinutes: 0,
        intervalSeconds: 15,
        isClockwise: false, //False is counterclockwise
        shouldContinue: false,

        //TODO: ABSTRACT BULB RAMPING
        isBulbRamping: false,
        startShutter: "30",
        durationHours: 2,
        durationMinutes: 30,
        delayHours: 0,
        delayMinutes: 0,
        expChange: "2",
        expType: "f/10min" //TODO: Make constant
    },

    //abstract
    direction: function () {
        if (this.get('isClockwise')) {
            return "CLOCKWISE";
        }
        return "COUNTER<br />CLOCKWISE";
    },
    //abstract
    directionAbr: function () {
        if (this.get('isClockwise')) {
            return "CW";
        }
        return "CCW";
    },

    getStats: function () {
        var totalPhotos = Math.round((this.get('totalTimeHours') * 3600 + this.get('totalTimeMinutes') * 60) / (this.get('intervalMinutes') * 60 + this.get('intervalSeconds')));
        var degreesPerPhoto = _.round(this.get('degrees') / totalPhotos, 2);
        var frameRate = _.round(totalPhotos / 24, 1);
        return {
            totalPhotos: totalPhotos,
            degreesPerPhoto: degreesPerPhoto,
            frameRate: frameRate,
            direction: this.direction(),
            directionAbr: this.directionAbr(),
        };
    },

    getTemplateJSON: function () {
        return _.extend(
        this.toJSON(),
        this.getStats());
    }

});


$(document).ready(function () {
    window.app = new RadianApp();
});