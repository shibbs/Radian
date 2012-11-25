$().ns('RadianApp.Constants');

$(document).ready(function () {
    var C = RadianApp.Constants;

    // What kind of time lapse is it
    C.TimeLapseType = {
        NONE : 0,
        PAN : 1,
        TILT : 2,
    }

    // Which direction
    C.Direction = {
        CLOCKWISE : true,
        COUNTERCLOCKWISE : false,
    }

    C.DirectionCanonical = function(direction) {
        if(C.Direction.CLOCKWISE === direction) {
            return "CLOCKWISE";
        }
        return "COUNTER-CLOCKWISE";
    }

    C.DirectionAbbr = function(direction) {
        if(C.Direction.CLOCKWISE === direction) {
            return "CW";
        }
        return "CCW";
    }

    // How to calculate f frame
    C.ExpPowerType = {
        MINUTE : false,
        FRAME : true,
    }
});