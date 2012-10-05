var DataTransmission = {
    
    send: function (successCallback, failureCallback, data_array) {
        return Cordova.exec( successCallback, failureCallback,
                            "DataTransmission",
                            "send",
                            data_array);
    }
    
};

