var playSound = function(soundFile) {

    function playAudio() {
        var my_media = new Media(soundFile, onSuccess, onError);
        my_media.play();
    }

    function onSuccess() {
        console.log("playAudio():Audio Success");
    }

    function onError(error) {
        alert('code: '    + error.code    + '\n' + 
        'message: ' + error.message + '\n');
    }

    playAudio();
}
    