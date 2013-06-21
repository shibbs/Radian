$().ns('RadianApp.Sound');

RadianApp.Sound.play = function(soundFile, finishCallback) {
    var my_media;

    function playAudio() {
        my_media = new Media(soundFile, onSuccess, onError);
        my_media.setVolume(1.0);
        my_media.play();
        if(isDroid) {
            my_media.reset();
            my_media.release();
        }
    }

    function onSuccess() {
        console.log("playAudio():Audio Success");
        finishCallback();
        if(!isDroid) {
            my_media.release();
        }
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' + 
        'message: ' + error.message + '\n');
        finishCallback();
    }

    playAudio();
}
    