$().ns('RadianApp.Sound');

RadianApp.Sound.play = function(soundFile, finishCallback) {

    function playAudio() {
        var my_media = new Media(soundFile, onSuccess, onError);
        my_media.play();
    }

    function onSuccess() {
        console.log("playAudio():Audio Success");
        finishCallback();
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' + 
        'message: ' + error.message + '\n');
        finishCallback();
    }

    playAudio();
}
    