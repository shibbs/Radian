var saveBase64File = function(base64String, name, success) {

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

    function gotFS(fileSystem) {
        fileSystem.root.getFile(name, {create: true, exclusive: false}, gotFileEntry, fail);
    };
                           
    function gotFileEntry(fileEntry) {
        fileEntry.createWriter(gotFileWriter, fail);
    };
                           
    function gotFileWriter(writer) {
        writer.onwriteend = function(evt) {
            success();
        };
        writer.write(base64String);
    };
                           
    function fail(error) {
        //TODO Add better error messages
        alert(error.code);
    }
}

                          
                        
