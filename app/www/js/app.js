document.addEventListener('deviceready', function() {
                         window.location.hash = 'timelapse';
                   
       
                          window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
           /*
                          function gotFS(fileSystem) {
                          fileSystem.root.getFile("readme2.txt", {create: true, exclusive: false}, gotFileEntry, fail);
                          }
                          
                          function gotFileEntry(fileEntry) {
                          alert("Got file");
                          fileEntry.createWriter(gotFileWriter, fail);
                          }
                          
                          function gotFileWriter(writer) {
                          writer.write("aGVsbG93b3JsZA==");
                          alert("Wrote some sample text");
                          }
                          
                          function fail(error) {
                          console.log(error.code);
                          }

     */
/*
        function gotFS(fileSystem) {
        fileSystem.root.getFile("readme2.txt", null, gotFileEntry, fail);
        }
        
        function gotFileEntry(fileEntry) {
        fileEntry.file(gotFile, fail);
        }
        
        function gotFile(file){
        readDataUrl(file);
        readAsText(file);
        }
        
        function readDataUrl(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
        console.log("Read as data URL");
        console.log(evt.target.result);
        };
        reader.readAsDataURL(file);
        }
        
        function readAsText(file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
        console.log("Read as text");
                          alert("test");
        console.log(evt.target.result);
        };
                          alert("Test");
        reader.readAsText(file);
        }
        
        function fail(evt) {
        console.log(evt.target.error.code);
        }
             */        
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