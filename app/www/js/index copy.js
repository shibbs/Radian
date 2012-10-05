var create_slot = function(name, start, finish, increment, abbreviation) {
    var data = [];
    for(var i=start; i <= finish; i+= increment) {
        data.push({text: i.toString() + ' ' + abbreviation, value: i});
    }
    return {name: name, title: name, data: data};
    
}



function nativePluginResultHandler (result) {
    alert("Attempting to send the data");
}

function callNativePlugin( returnSuccess ) {
    DataTransmission.send( nativePluginResultHandler, nativePluginResultHandler, returnSuccess );
}

var app = {
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.report(), and not this.report()
        app.report('deviceready');
        document.querySelector('body').className = '';

        var pickerView = window.plugins.pickerView;
        var total_time_slots = [create_slot('hours', 0, 240, 1, 'hr'), create_slot('minutes', 0, 59, 1, 'min')];
        var degrees_slots = [create_slot('degrees', 0, 360, 5, ''), {name: 'direction', title: 'direction', data: [{text: 'CW', value: false}, {text: 'CCW', value: true}] }];
        var interval_slots = [create_slot('minutes', 0, 360, 1, 'min'), create_slot('seconds', 0, 59, 1, 'sec')];
        
        pickerView.create('', interval_slots, function(selectedValues, buttonIndex) {
                          console.warn('create(), arguments=' + Array.prototype.slice.call(arguments).join(', '));
                          }, {style: 'black-opaque', doneButtonLabel: 'OK', cancelButtonLabel: 'Cancel'});
        
    },
    report: function(id) { 
        console.log("report:" + id);
        // hide the .pending <p> and show the .complete <p>
        
        document.querySelector('#' + id + ' .pending').className += ' hide';
        var completeElem = document.querySelector('#' + id + ' .complete');
        completeElem.className = completeElem.className.split('hide').join('');
        
    }
};
