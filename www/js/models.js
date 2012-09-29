//Random Util should be removed
_.mixin({
	round: function roundNumber(num, dec) {
		var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
		return result;
	}
});
//dfasdfasdfas

var RadianApp = Backbone.Model.extend({

  initialize: function() {
	
  },

  defaults: {
	timelapse: true,
	degrees: 120,
	totalTimeHours: 2,
	totalTimeMinutes: 30,
	intervalMinutes: 0,
	intervalSeconds: 15,
    isClockwise: false, //False is counterclockwise
  },
                                      
                                      //abstract
                                    direction: function() {
                                      if(this.get('isClockwise')){
                                        return "CLOCKWISE";
                                      }
                                       return "COUNTER-CLOCKWISE";
                                    },
                                      //abstract
                                      directionAbr: function() {
                                      if(this.get('isClockwise')){
                                      return "CW";
                                      }
                                      return "CCW";
                                      },

  getStats: function() {
      var totalPhotos = Math.round((this.get('totalTimeHours') * 3600 + this.get('totalTimeMinutes') * 60) / (this.get('intervalMinutes')*60 + this.get('intervalSeconds')));
      var degreesPerPhoto = _.round(this.get('degrees') / totalPhotos, 2);
      var frameRate = _.round(totalPhotos/24, 1);
	  return {
		totalPhotos: totalPhotos,
		degreesPerPhoto: degreesPerPhoto,
		frameRate: frameRate,
        direction: this.direction(),
        directionAbr: this.directionAbr(),
	};
  },

  

  getTemplateJSON: function() {
	  return _.extend( 
	      this.toJSON(), 
	      this.getStats()
	    );
  }

});

$(document).ready(function() {
	window.app = new RadianApp();
});