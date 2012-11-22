
$().ns('RadianApp.Models');


$().ns('RadianApp.Models.Constants');
RadianApp.Models.Constants.TimeLapseType = {
    NONE : 0,
    PAN : 1,
    TILT : 2,

}
RadianApp.Models.Constants.Direction = {
    CLOCKWISE : false,
    COUNTERCLOCKWISE : true,
}

var c = RadianApp.Models.Constants;

RadianApp.Models.TimeLapse = Backbone.Model.extend({

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
        var degreesPerPhoto = RadianApp.Utilities.round(this.get('degrees') / totalPhotos, 2);
        var frameRate = RadianApp.Utilities.round(totalPhotos / 24, 1);
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
RadianApp.Models.App = Backbone.Model.extend({

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

RadianApp.Models.Constants.ExpPowerType = {
    MINUTE : false,
    FRAME : true,
}

RadianApp.Models.App = Backbone.Model.extend({

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
        var degreesPerPhoto = RadianApp.Utilities.round(this.get('degrees') / totalPhotos, 2);
        var frameRate = RadianApp.Utilities.round(totalPhotos / 24, 1);
        var stepIncreaseTime = (this.get('expType') === "f/10min") ? 10 : (this.get('totalTimeHours') * 60 + this.get('totalTimeMinutes')) / (totalPhotos/10);
        var finalShutter = eval(this.get('startShutter')) * Math.pow(2, eval(this.get('expChange')) * ((this.get('durationHours') * 60 + this.get('durationMinutes')) / stepIncreaseTime));
        
        return {
            totalPhotos: totalPhotos,
            degreesPerPhoto: degreesPerPhoto,
            frameRate: frameRate,
            direction: this.direction(),
            directionAbr: this.directionAbr(),
            finalShutter: RadianApp.Utilities.round(finalShutter, 1)
        };
    },

    getTemplateJSON: function () {
        return _.extend(
        this.toJSON(),
        this.getStats());
    }

});


$(document).ready(function () {
    RadianApp.model = new RadianApp.Models.App();
});