//TODO: Abstract
var generate_slot = function (name, start, finish, increment, abbreviation) {
    var data = {};
    for (var i = start; i <= finish; i += increment) {
        data[i.toString()] = i.toString() + ' ' + abbreviation;
    }
    var slot = {};
    slot[name] = data;
    return slot;

}

$().ns('RadianApp.Views');

$(document).ready(function () {
    var C = RadianApp.Constants;
    var Views = RadianApp.Views;

    Views.BaseView = Backbone.View.extend({

        initialize: function () {
            this.setElement($("#container"));
        },

        render: function () {
            if(!this.model) {
                this.$el.empty().append(this.template());
            } else {
                this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            }  
            return this;
        }
    });

    Views.ModalView = Backbone.View.extend({

        initialize: function () {
            this.setElement($("#container"));
        },

        render: function () {
            Views.navigation.hide();
            if(!this.model) {
                this.$el.empty().append(this.template());
            } else {
                this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            }  
            return this;
        }
    });



    Views.StatsBoxView = Backbone.View.extend({
        template: _.template($('#statsBox_template').html()),

        initialize: function () {
            RadianApp.app.visibleTimeLapse.bind('change', this.render, this); //TODO make more granular
        },

        render: function () {
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getStats()));
            return this;
        },
    });

    Views.BulbRampStatsBoxView = Backbone.View.extend({
        template: _.template($('#bulbRampStatsBox_template').html()),

        initialize: function () {
            RadianApp.app.visibleTimeLapse.bind('change', this.render, this); //TODO make more granular
        },

        render: function () {
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getStats()));
            return this;
        },
    });

    Views.HomeView = Views.BaseView.extend({
        template: _.template($('#home_template').html()),

        render: function () {
            Views.navigation.selectStep(1);
            Views.navigation.unhide();
            Views.navigation.setPrevious(false);
            if(RadianApp.app.visibleTimeLapse.get("timeLapse") === RadianApp.Constants.TimeLapseType.NONE) {
                Views.navigation.setNext(true);
            } else {
                Views.navigation.setNext(true, "#timelapse");
            }

            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
        },

        events: {
            "click #pan": "pan",
            "click #tilt": "tilt",
        },

        pan: function() {
            RadianApp.app.visibleTimeLapse.set("timeLapse", RadianApp.Constants.TimeLapseType.PAN);
        },

        tilt: function() {
            RadianApp.app.visibleTimeLapse.set("timeLapse", RadianApp.Constants.TimeLapseType.TILT);
        }
    });

    Views.TimeLapseView = Views.BaseView.extend({
        template: _.template($('#timeLapse_template').html()),
        events: {
            "click #degreeLink": "degreeLink",
            "click #totalTimeLink": "totalTimeLink",
            "click #intervalLink": "intervalLink",
        },
        degreeLink: function () {
            window.location.hash = '#timelapse/degrees';
        },

        totalTimeLink: function () {
            window.location.hash = '#timelapse/totaltime';
        },

        intervalLink: function () {
            window.location.hash = '#timelapse/interval';

        },

        advancedLink: function () {
            window.location.hash = '#timelapse/advanced';

        },
        render: function () {
            Views.navigation.selectStep(2);
            Views.navigation.unhide();
            Views.navigation.setNext(true, "#timelapse/upload");
            Views.navigation.setPrevious(true, "#home");

            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            // If we are currently running one don't simulate upload
            //$('#thirdstep').attr('href', '#timelapse/current');
            return this;
        }
    });

    var vent = _.extend({}, Backbone.Events);
    

    Views.TimeLapsePresetItemView = Backbone.View.extend({
        tag: 'li',
        template: _.template($('#timeLapsePresetItem_template').html()),
        events: {
            "click .btn-row": "mainAction",
            "click .delete": "deleteEvent",
            "click": "toggleShow",    
        },

        endEvent: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
        },

        eventCurrent: function(e) {
            var me = this;
            $.modal("<div> \
                        <input id='presetName' autofocus placeholder='Preset Name'> \
                        <div class='minibox'> \
                            <div id='cancelAddNewPreset' class='btn btn-white simplemodal-close'>CANCEL</div> \
                            <div id='addNewPreset' class='btn highlighted-btn'>SAVE</div> \
                        </div> \
                    </div>", {  position: ['25%', '9%'],
                                onShow: function() { 

                                                $('#addNewPreset').hammer().bind("tap", function(event){
                                                    event.preventDefault();
                                                event.stopImmediatePropagation();
                                                me.saveNewPreset();
                                                
                                            });

                                            setTimeout(function(){
                                                $("#presetName").focus();
                                            },100);
                                        },
                            });

            
            this.endEvent(e);
        },

        loadEvent: function(e) {
            RadianApp.app.loadTimeLapse(this.model);
            window.location.hash = '#home';
            this.endEvent(e);
        },


        deleteEvent: function(e) {
            var that = this;
            navigator.notification.confirm(
            'Would you like to delete the preset?',  // message
            function(i) {
                if(i===1) return;
                RadianApp.app.removeTimeLapseFromPresets(that.model);
                that.remove();
                that.unbind();
                var scroller = that.scroller;
                setTimeout(function() { scroller.refresh()}, 0); 
            },// callback to invoke with index of button pressed
            'Delete Preset',            // title
            'No,Yes'          // buttonLabels
            );
            this.endEvent(e);
        },

        initialize: function(model, scroller, current, parent) {
            this.parent = parent;
            this.model = model;
            this.current = current ? current : false;
            this.scroller = scroller;
            this.mainAction = current ? this.eventCurrent : this.mainAction;
            vent.on('presets:editmode', this.enterEditMode, this);
            vent.on('presets:leaveeditmode', this.leaveEditMode, this);
            this.open = current ? current : false;
        },

        mainAction: function(e) {
            if(this.deleteMode) {
                this.deleteEvent(e);
            } else {
                this.loadEvent(e);
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        },

        toggleShow: function() {
            this.$('.box').toggleClass('hide');
            this.open = !this.open;
            if(this.open && this.deleteMode) {
                this.$('.opener .delete').addClass('hide');
            } else if (!this.open && this.deleteMode) {
                this.$('.opener .delete').removeClass('hide');
            }
            var scroller = this.scroller;
            setTimeout(function() { scroller.refresh()}, 0); 
        },

        saveNewPreset: function() {
            var name = $('#presetName').val().toUpperCase();
            if (name.length === 0) return;
            
            var newTimeLapse = RadianApp.app.saveTimeLapseAsPreset(RadianApp.app.visibleTimeLapse, name);
            this.parent.insertNewPreset(newTimeLapse, true);
            $.modal.close(); 
        },

        render: function() {
            var elem = this.template(this.model.getTemplateJSON());
            var me = this;
            this.$el.empty().append(elem);
            this.$('.opener .delete').addClass('hide');
            if(this.current) {
                this.$('.box').removeClass('hide');
                this.$('.box').addClass('show');
                this.$('.save-btn').html('SAVE AS PRESET');
            }
            return this;
        },

        enterEditMode: function() {
            if(this.current) {
                this.$el.css('display', 'none');
                var scroller = this.scroller;
                setTimeout(function() { scroller.refresh()}, 0); 
                return;
            }
            this.deleteMode = true;
            this.$('.save-btn').html('DELETE');
            this.$('.save-btn').removeClass('norm');
            this.$('.save-btn').addClass('delete');
            if(!this.open) this.$('.opener .delete').removeClass('hide');
        },

        leaveEditMode: function() {
            if(this.current) {
                var scroller = this.scroller;
                setTimeout(function() { scroller.refresh()}, 0); 
                this.$el.css('display', 'block');
                return;
            }
            this.deleteMode = false;
            this.$('.save-btn').html('LOAD PRESET');
            this.$('.save-btn').removeClass('delete');
            this.$('.save-btn').addClass('norm');
            this.$('.opener .delete').addClass('hide');
        }
    });

    Views.TimeLapsePresetsView = Views.BaseView.extend({
        template: _.template($('#timeLapsePresets_template').html()),

        events: {
            "click #edit": "editMode",
        },

        editMode: function(e) {
            if(this.isEditing) {
                this.$('#edit').html('EDIT');
                this.$('#edit').removeClass('highlighted-btn');
                this.$('#done').css('visibility', 'visible');
                vent.trigger('presets:leaveeditmode', "");
                this.isEditing = false;
            } else {
                this.$('#edit').html('DONE');
                this.$('#edit').addClass('highlighted-btn');
                this.$('#done').css('visibility', 'hidden');
                vent.trigger('presets:editmode', "");
                this.isEditing = true;
            }
            e.preventDefault();
            e.stopImmediatePropagation();
        },

        insertNewPreset: function (model, insert) {
            var me = this;
            var temp = new Views.TimeLapsePresetItemView(model, this.scroller, false, me);
            if(insert) { //Should be inserting at beginning or end
                this.$("#list > div:nth-child(1)").after(temp.render().$el);
            } else {
                this.$('#list').append(temp.render().$el);
            }
            var scroller = this.scroller;
            setTimeout(function() { scroller.refresh()}, 0);
        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template());
            var scroller = new iScroll('scrollwrapper', {});
            this.scroller = scroller;
            RadianApp.app.visibleTimeLapse.set('dateCreated', RadianApp.Utilities.formatDate(new Date()));
            var currentView = new Views.TimeLapsePresetItemView(RadianApp.app.visibleTimeLapse, scroller, true, this);
            this.$('#list').append(currentView.render().$el);
            var models = RadianApp.app.presets.models;

            for (var i = models.length -1; i >= 0; i--) {
                this.insertNewPreset(models[i]);
            };
            
            setTimeout(function() { scroller.refresh()}, 0); 
            return this;
        }

    });


    Views.TimeLapseQueueItemView = Backbone.View.extend({
        tagName: 'li',
        className:'canSort',
        template: _.template($('#timeLapseQueueItem_template').html()),
        
        events: {
            "click .delete": "deleteEvent", 
            "click .canSort": "updateIndex", 
        },

        updateIndex: function(me) {
            return function () {

            }
        },

        deleteEvent: function(e) {
            var that = this;
            navigator.notification.confirm(
            'Would you like to delete this from the queue?',  // message
            function(i) {
                if(i===1) return;
                RadianApp.app.removePresetFromQueue(that.model);
                that.remove();
                that.unbind();
                var scroller = that.scroller;
                setTimeout(function() { scroller.refresh()}, 0); 
            },// callback to invoke with index of button pressed
            'Delete',            // title
            'No,Yes'          // buttonLabels
            );
            e.preventDefault();
            e.stopImmediatePropagation();
        },

        initialize: function(model) {
            this.model = model;
            var me = this;
            vent.on('queues:updateIndex', me.updateIndex(me));
        },

        render: function() {
            var elem = this.template({name: this.model.get('name')});
            this.$el.empty().append(elem);
            return this;
        },

    });




    Views.TimeLapseQueueView = Views.ModalView.extend({
        template: _.template($('#timeLapseQueue_template').html()),

        events: {
            'click #addPresets': 'navigateToAddView'
        },



        navigateToAddView: function(e) {
            e.preventDefault();
            window.location.hash = '#timelapse/queue/add';
            var addView = new Views.TimeLapseQueueAddView();
            addView.render();
        },

        insertNewQueue: function (model) {
            var me = this;
            var temp = new Views.TimeLapseQueueItemView(model);
            this.$('#list').prepend(temp.render().$el);
            var scroller = this.scroller;
            setTimeout(function() { scroller.refresh()}, 0);
        },


        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var handleClass = 'handle';

            $('.sortable').sortable({
                handle: '.'+handleClass,
                axis: "y",
                delay: 250,
                items: '.canSort',
                stop: function( event, ui ) { 
                    var list = $('#list > li[order]');
                    var models = RadianApp.app.queue.models;
                    for (var i = 0; i < models.length; i++) {
                        var model = models[i];
                        model.set('order', Number(list.index($('#list > li[order='+(model.get('order'))+']')))+1);
                    };
                    RadianApp.app.queue.sort();
                },
            });

            var scroller = new iScroll('scrollwrapper', {
                userDisabled: function(e) {
                   return e.srcElement.className===handleClass;
                }
            });
            this.scroller = scroller;
            $('#scrollwrapper').css('overflow', 'visible');

            var models = RadianApp.app.queue.models;

            for (var i = models.length -1; i >= 0; i--) {
                this.insertNewQueue(models[i]);
            };
            
            setTimeout(function() { scroller.refresh()}, 0); 

            return this;
        }
    });


     Views.TimeLapseQueueAddItemView = Backbone.View.extend({
        tag: 'li',
        template: _.template($('#timeLapseQueueAddItem_template').html()),
        
        events: {
            "click .row": "selectModel", 
        },


        selectModel: function() {
            this.selected = !this.selected;
            if(this.selected) {
                this.$('.check').css('visibility', 'visible');
                this.$('.list-link-add').addClass('highlight');
                this.collection.add(this.model);
            } else {
                this.$('.check').css('visibility', 'hidden');
                this.$('.list-link-add').removeClass('highlight');
                this.collection.remove(this.model);
            }
        },

        initialize: function(model, collection) {
            this.model = model;
            this.collection = collection;
        },

        render: function() {
            var elem = this.template({name: this.model.get('name')});
            var me = this;
            this.$el.empty().append(elem);
            return this;
        },

    });


    Views.TimeLapseQueueAddView = Views.BaseView.extend({
        template: _.template($('#timeLapseQueueAdd_template').html()),

        events: {
            'click #save': 'save'
        },

        save: function() {
            this.collection.forEach(function(timelapse) {
                RadianApp.app.addPresetToQueue(timelapse);
            });
            this.collection.reset();
        },

        collection: new (Backbone.Collection.extend({
            model: RadianApp.Models.TimeLapse,

            comparator: function(timeLapse) {
             return -timeLapse.get('order');
            }

        }))(),

        insertNewPreset: function (model) {
            var me = this;
            var temp = new Views.TimeLapseQueueAddItemView(model, this.collection);
            this.$('#list').append(temp.render().$el);
            var scroller = this.scroller;
            setTimeout(function() { scroller.refresh()}, 0);
        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template());
            var scroller = new iScroll('scrollwrapper', {});
            this.scroller = scroller;

            var models = RadianApp.app.presets.models;

            for (var i = models.length -1; i >= 0; i--) {
                this.insertNewPreset(models[i]);
            };
            
            setTimeout(function() { scroller.refresh()}, 0); 
            return this;
        }

    });





    Views.TimeLapseDegreesView = Views.BaseView.extend({
        template: _.template($('#timeLapseDegrees_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:degrees', this.updateDegrees, this);
            RadianApp.app.visibleTimeLapse.bind('change:isClockwise', this.updateDirection, this);
        },
        updateDegrees: function () {
            this.$('#wrapper #degrees').html(RadianApp.app.visibleTimeLapse.get('degrees') + '&deg;');



        },

        updateDirection: function () {
            this.$('#direction').html(C.DirectionCanonical(RadianApp.app.visibleTimeLapse.get('isClockwise')));



        },




        render: function () {
            Views.navigation.hide();
            var create_slot = function (start, finish, increment) {
                var data = {};
                for (var i = start; i <= finish; i += increment) {
                    data[i.toString()] = i;
                }
                return data;
            }

            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.StatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: [{
                    'Degrees': create_slot(0, 360, 5)
                }, {
                    'Direction': {
                        CW: 'CW',
                        CCW: 'CCW'
                    }
                }],
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set('isClockwise', instance.values[1] == 'CW');

                    RadianApp.app.visibleTimeLapse.set('degrees', Number(instance.values[0]));
                },
            }).scroller('setValue', [String(RadianApp.app.visibleTimeLapse.get('degrees')), C.DirectionAbbr(RadianApp.app.visibleTimeLapse.get('isClockwise'))], false, 0);



            return this;
        },


    });

    Views.TimeLapseTotalTimeView = Views.BaseView.extend({
        template: _.template($('#timeLapseTotalTime_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:totalTimeHours', this.updateTotalTimeHours, this);
            RadianApp.app.visibleTimeLapse.bind('change:totalTimeMinutes', this.updateTotalTimeMinutes, this);
        },

        events: {
            "click #continue": "continue",
        },

        continue: function() {
            RadianApp.app.visibleTimeLapse.set("shouldContinue", !RadianApp.app.visibleTimeLapse.get("shouldContinue"));
            this.$('#continue').toggleClass('highlight');
        },

        updateTotalTimeHours: function () {
            this.$('#hours').html(RadianApp.app.visibleTimeLapse.get('totalTimeHours'));

        },

        updateTotalTimeMinutes: function () {
            this.$('#totalTimeMinutes').html(RadianApp.app.visibleTimeLapse.get('totalTimeMinutes'));

        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.StatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);

            var total_time_slots = [generate_slot('hours', 0, 240, 1, 'hr'), generate_slot('minutes', 0, 59, 1, 'min')];

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {

                    if (Number(instance.values[0]) === 0 && Number(instance.values[1]) == 0) {
                        $('#picker').scroller('setValue', ['0', '1'], true, 0.5);

                        RadianApp.app.visibleTimeLapse.set('totalTimeHours', 0);

                        RadianApp.app.visibleTimeLapse.set('totalTimeMinutes', 1);
                        return;
                    }
                    RadianApp.app.visibleTimeLapse.set('totalTimeHours', Number(instance.values[0]));

                    RadianApp.app.visibleTimeLapse.set('totalTimeMinutes', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(RadianApp.app.visibleTimeLapse.get('totalTimeHours')), String(RadianApp.app.visibleTimeLapse.get('totalTimeMinutes'))], false, 0);


            return this;
        }
    });

    Views.TimeLapseIntervalView = Views.BaseView.extend({
        template: _.template($('#timeLapseInterval_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change', this.updateInterval, this);
        },

        updateInterval: function () {
            this.$('#intervalMinutes').html(RadianApp.app.visibleTimeLapse.get('intervalMinutes'));
            this.$('#intervalSeconds').html(RadianApp.app.visibleTimeLapse.get('intervalSeconds'));

        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.StatsBoxView({
                model: RadianApp.app.visibleTimeLapse
            });
            this.$('#wrapper').append(statsView.render().el);

            var interval_slots = [generate_slot('minutes', 0, 360, 1, 'min'), generate_slot('seconds', 0, 59, 1, 'sec')];

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: interval_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    if (Number(instance.values[0]) === 0 && Number(instance.values[1]) == 0) {
                        $('#picker').scroller('setValue', ['0', '1'], true, 0.5);
                        RadianApp.app.visibleTimeLapse.set('intervalMinutes', 0);

                        RadianApp.app.visibleTimeLapse.set('intervalSeconds', 1);
                        return;
                    }
                    RadianApp.app.visibleTimeLapse.set('intervalMinutes', Number(instance.values[0]));

                    RadianApp.app.visibleTimeLapse.set('intervalSeconds', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(RadianApp.app.visibleTimeLapse.get('intervalMinutes')), String(RadianApp.app.visibleTimeLapse.get('intervalSeconds'))], false, 0);



            return this;
        }
    });

    Views.TimeLapseUploadView = Views.BaseView.extend({
        template: _.template($('#timeLapseUpload_template').html()),

        render: function () {
            Views.navigation.selectStep(3);
            Views.navigation.unhide();
            if(RadianApp.app.runningTimeLapse) {
                Views.navigation.setNext(true, "#timelapse/current");
            } else {
                Views.navigation.setNext(false);
            }
            Views.navigation.setPrevious(true, "#timelapse");
            this.$el.empty().append(this.template());
            return this;
        },

        events: {
            'click .upload': "upload"
        },

        upload: function () {
            this.percent = 0;
            this.disableNavigation();
            RadianApp.app.runTimeLapse(RadianApp.app.visibleTimeLapse);
            this.advanceProgressBar();
            this.updateMessage();
        },

        disableNavigation: function () {
            Views.navigation.setPrevious(true);
        }, 

        updateMessage: function () {
            this.$('.message').html("UPLOADING...");
        },

        advanceProgressBar: function () {
            var that = this;
            var callmethod = function () {
                that.advanceProgressBar()
            }
            if (that.percent !== 100) {
                that.percent += 1;
                that.$('.holder').css('width', that.percent + '%');
                window.timeLapseLoadingBarTimeout = setTimeout(callmethod, 40);
            }
            else {
                window.location.hash = 'timelapse/countdown';
                that.percent = 0;
            }
        }
    });

    Views.TimeLapseCurrent = Views.BaseView.extend({
        template: _.template($('#timeLapseCurrent_template').html()),

        render: function () {
            Views.navigation.selectStep(4);
            Views.navigation.unhide();
            Views.navigation.setNext(false);
            Views.navigation.setPrevious(true, "#timelapse/upload");

            RadianApp.app.runningTimeLapse;
            this.$el.empty().append(this.template(RadianApp.app.runningTimeLapse.toJSON()));
            this.percent = 0;
            $('.dial').knob();
            this.advanceProgressBar();
            return this;
        },

        events: {
            'click .prev': "prev",
            'click .newTimeLapse': "newTimeLapse",
            'click .restartCounter': "restartCounter"
        },

        newTimeLapse: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
            RadianApp.app.cancelRunningTimeLapse();
            window.location.hash = 'home';
        },

        restartCounter: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
            RadianApp.app.resetStartTime();
            window.location.hash = 'timelapse/current';
            this.advanceProgressBar();
        },

        prev: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
        },


        advanceProgressBar: function () {
            var that = this;
            var callmethod = function () {
                that.advanceProgressBar()
            }
            var totalSeconds = RadianApp.app.runningTimeLapse.get('totalTimeHours') * 3600 + RadianApp.app.runningTimeLapse.get('totalTimeMinutes') * 60;
            var timePassed = ((new Date()).getTime() - RadianApp.app.sentTime.getTime()) / 1000;
            that.percent = timePassed / totalSeconds;

            hours = parseInt(timePassed / 3600) % 24;
            minutes = parseInt(timePassed / 60) % 60;
            that.$('.dial').val(RadianApp.Utilities.round(that.percent*100, 0)).trigger('change');
            that.$('#hours').html(RadianApp.Utilities.round(hours, 0));
            that.$('#minutes').html(RadianApp.Utilities.round(minutes, 0));
            that.$('#degrees').html(RadianApp.Utilities.round(that.percent * RadianApp.app.runningTimeLapse.get('degrees'), 2) + '&deg;');
            if (RadianApp.Utilities.round(that.percent*100, 0) < 100) {
                window.timeLapseCurrentLoadingBarTimeout = setTimeout(callmethod, 20 * 1000);
            } else {
                clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
                window.location.hash = 'timelapse/completed';
            }
        }
    });

    Views.TimeLapseCountDownView = Views.BaseView.extend({
        template: _.template($('#timeLapseCountDown_template').html()),


        render: function () {
            this.$el.empty().append(this.template());
            this.count = 5;
            this.cancelled = false;
            window.timeLapseCountDownTimeout = [];


            this.countDown();
            return this;
        },

        events: {
            'click .nostart': "nostart",
            'click .prev': "prev"
        },

        nostart: function () {
            clearTimeout(window.timeLapseCountDownTimeout);
            RadianApp.app.cancelRunningTimeLapse();
        },

        prev: function () {
            clearTimeout(window.timeLapseCountDownTimeout);
        },

        countDown: function () {

            var that = this;

            var callmethod = function () {
                that.countDown()
            }

            if (that.count !== 0) {
                that.count -= 1;
                window.timeLapseCountDownTimeout = setTimeout(callmethod, 1000);
            }
            else {
                window.location.hash = 'timelapse/current';
            }
        }
    });

    Views.homeView = new Views.HomeView({
        model: RadianApp.app
    });

    //SPEED RAMPING CODE

    Views.SpeedRampingView = Views.ModalView.extend({
        template: _.template($('#speedRamping_template').html()),

        events: {
            'click #linear': "linear",
            'click #cubic': "curve",
            'click #reset': 'reset',
            'click #back': 'save',     
        },

        save: function() {
            var points = ChartMonotonic.getPoints();
            if(!points) {
                RadianApp.app.visibleTimeLapse.set('isSpeedRamping', false);
                RadianApp.app.visibleTimeLapse.set('speedRampingPoints', []);
                RadianApp.app.visibleTimeLapse.set('speedRampingCurved', false);
                return;
            }
            RadianApp.app.visibleTimeLapse.set('isSpeedRamping', true);
            RadianApp.app.visibleTimeLapse.set('speedRampingPoints', points);
            RadianApp.app.visibleTimeLapse.set('speedRampingCurved', !ChartMonotonic.isLinear());
        },

        reset: function() {
            this.linear();
            ChartMonotonic.setPoints();
        },

        linear: function() {
            ChartMonotonic.setLinear(true);
            this.$('#linear').addClass('highlight-bg');
            this.$('#cubic').removeClass('highlight-bg');
        },

        curve: function() {
            ChartMonotonic.setLinear(false);
            this.$('#linear').removeClass('highlight-bg');
            this.$('#cubic').addClass('highlight-bg');
        },

        render: function () {
            Views.navigation.hide();
            if(RadianApp.isIOS) {
                Views.navigation.setLandscape();
            }
            this.$el.empty();
            this.$el.append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var totalTime = RadianApp.app.visibleTimeLapse.get('totalTimeHours') * 60 + RadianApp.app.visibleTimeLapse.get('totalTimeMinutes');
            var degrees = RadianApp.app.visibleTimeLapse.get('degrees');

            ChartMonotonic = new SplineChart('chart_monotonic', 'Time (minutes)', 'Degrees', '#008bca', function(xs, ys) {
                return new MonotonicCubicSpline(xs, ys);
            }, totalTime, degrees);

            //ChartMonotonic.addNewPoint(0, 0, true); //Hack to be able to reset graph
            if(RadianApp.app.visibleTimeLapse.get('isSpeedRamping')) {
                if(RadianApp.app.visibleTimeLapse.get('speedRampingCurved')){
                    this.curve();
                } else {
                    this.linear();
                }
                ChartMonotonic.setPoints(RadianApp.app.visibleTimeLapse.get('speedRampingPoints'));
            } else {
                this.linear();
                ChartMonotonic.setPoints();
            }
        }
    });

    //BULB RAMPING CODE
    Views.BulbRampingView = Views.ModalView.extend({
        template: _.template($('#bulbRamping_template').html()),

        events: {
            'click #isBulbRamping': "toggleOn",        },


        toggleOn: function() {
            RadianApp.app.visibleTimeLapse.set("isBulbRamping", !RadianApp.app.visibleTimeLapse.get("isBulbRamping"));
        },

                render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.BulbRampStatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);
        }
    });
                  
    

    Views.BulbrampingDelay = Views.ModalView.extend({
        template: _.template($('#bulbRampingDelay_template').html()),

         initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:delayHours', this.updateDelayHours, this);
            RadianApp.app.visibleTimeLapse.bind('change:delayMinutes', this.updateDelayMinutes, this);
        },


        updateDelayHours: function () {
            this.$('#delayHours').html(RadianApp.app.visibleTimeLapse.get('delayHours'));

        },

        updateDelayMinutes: function () {
            this.$('#delayMinutes').html(RadianApp.app.visibleTimeLapse.get('delayMinutes'));

        },


        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.BulbRampStatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);

            var total_time_slots = [generate_slot('hours', 0, 2, 1, 'hr'), generate_slot('minutes', 0, 59, 5, 'min')];

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set('delayHours', Number(instance.values[0]));
                    RadianApp.app.visibleTimeLapse.set('delayMinutes', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(RadianApp.app.visibleTimeLapse.get('delayHours')), String(RadianApp.app.visibleTimeLapse.get('delayMinutes'))], false, 0);


            return this;
        }
    });

    Views.BulbrampingDuration = Views.ModalView.extend({
        template: _.template($('#bulbRampingDuration_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:durationHours', this.updateDurationHours, this);
            RadianApp.app.visibleTimeLapse.bind('change:durationMinutes', this.updateDurationMinutes, this);
        },


        updateDurationHours: function () {
            this.$('#durationHours').html(RadianApp.app.visibleTimeLapse.get('durationHours'));

        },

        updateDurationMinutes: function () {
            this.$('#durationMinutes').html(RadianApp.app.visibleTimeLapse.get('durationMinutes'));

        },


        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.BulbRampStatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);

            var total_time_slots = [generate_slot('hours', 0, 3, 1, 'hr'), generate_slot('minutes', 0, 59, 1, 'min')];

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {

                    if (Number(instance.values[0]) === 0 && Number(instance.values[1]) == 0) {
                        $('#picker').scroller('setValue', ['0', '1'], true, 0.5);

                        RadianApp.app.visibleTimeLapse.set('durationHours', 0);

                        RadianApp.app.visibleTimeLapse.set('durationMinutes', 1);
                        return;
                    }
                    RadianApp.app.visibleTimeLapse.set('durationHours', Number(instance.values[0]));

                    RadianApp.app.visibleTimeLapse.set('durationMinutes', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(RadianApp.app.visibleTimeLapse.get('durationHours')), String(RadianApp.app.visibleTimeLapse.get('durationMinutes'))], false, 0);


            return this;
        }
    });

    Views.BulbrampingStartShutter = Views.ModalView.extend({
        template: _.template($('#bulbRampingStartShutter_template').html()),

                initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:startShutter', this.updateStartShutter, this);
        },


        updateStartShutter: function () {
            this.$('#startShutter').html(RadianApp.app.visibleTimeLapse.get('startShutter'));

        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.BulbRampStatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);

            var exposures = function() {
                var temp_array = [];
                for(var i=4; i<=60; i++) {
                    temp_array.push(String(i));
                }
                return ["1/100", "1/80", "1/60", "1/50", "1/40", "1/30", "1/25", "1/20", "1/15", "1/13", "1/10", "1/8", "1/6", "1/5", "1/4", ".3", ".4", ".5", ".6", ".7", ".8", ".9", "1", "1.3", "1.6", "2", "3.2"].concat(temp_array)
            }()
            var wheel = {};
            for (var i = 0; i < exposures.length; i++) { 
                wheel[i] =  "          "+exposures[i]+ "          ";
            }

            var total_time_slots = [{'s': wheel}];

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set('startShutter', exposures[instance.values[0]]);
                },
            }).scroller('setValue', [exposures.indexOf(RadianApp.app.visibleTimeLapse.get('startShutter'))], false, 0);


            return this;
        }
    });

    Views.BulbrampingExposureChange = Views.ModalView.extend({
        template: _.template($('#bulbRampingExpChange_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:expChange', this.updateExpChange, this);
            RadianApp.app.visibleTimeLapse.bind('change:expType', this.updateExpType, this);
        },


        updateExpChange: function () {
            this.$('#expChange').html(RadianApp.app.visibleTimeLapse.get('expChange'));
        },


        updateExpType: function () {
            this.$('#expType').html(RadianApp.app.visibleTimeLapse.get('expType'));
        },


        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.BulbRampStatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);

            var exp = ["-5", "-4.9", "-4.8", "-4.7", "-4.6", "-4.5", "-4.4", "-4.3", "-4.2", "-4.1", "-4", "-3.9", "-3.8", "-3.7", "-3.6", "-3.5", "-3.4", "-3.3", "-3.2", "-3.1", "-3", "-2.9", "-2.8", "-2.7", "-2.6", "-2.5", "-2.4", "-2.3", "-2.2", "-2.1", "-2", "-1.9", "-1.8", "-1.7", "-1.6", "-1.5", "-1.4", "-1.3", "-1.2", "-1.1", "-1", "-0.9", "-0.8", "-0.7", "-0.6", "-0.5", "-0.4", "-0.3", "-0.2", "-0.1", "0", "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8", "1.9", "2", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "3", "3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "4", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "5"];
            var wheel = {};
            for (var i = 0; i < exp.length; i++) { 
                wheel[i] =  exp[i]; //+ " stops";
            }
            var expType = ["f/10min", "f/10frames"]
            var total_time_slots = [{"s": wheel}, {"type": {0:"f/10min", 1: "f/10frames"}}];

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    console.log(instance.values[1])
                    RadianApp.app.visibleTimeLapse.set('expChange', exp[instance.values[0]]);
                    RadianApp.app.visibleTimeLapse.set('expType', expType[instance.values[1]]);
                },
            }).scroller('setValue', [exp.indexOf(RadianApp.app.visibleTimeLapse.get('expChange')), expType.indexOf(RadianApp.app.visibleTimeLapse.get('expType'))], false, 0);

            console.log(RadianApp.app.visibleTimeLapse.get('expType'));
            console.log(expType.indexOf(RadianApp.app.visibleTimeLapse.get('expType')));
            return this;
        }
    });



    // ********************* END OF BULB RAMPING CODE ****************** //


    Views.TimeLapseTimeDelay = Views.BaseView.extend({
        template: _.template($('#timeLapseTimeDelay_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:timeDelayHours', this.updateTimeDelayHours, this);
            RadianApp.app.visibleTimeLapse.bind('change:timeDelayMinutes', this.updateTimeDelayMinutes, this);
        },

        updateTimeDelayHours: function () {
            this.$('#timeDelayHours').html(RadianApp.app.visibleTimeLapse.get('timeDelayHours'));

        },

        updateTimeDelayMinutes: function () {
            this.$('#timeDelayMinutes').html(RadianApp.app.visibleTimeLapse.get('timeDelayMinutes'));

        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.StatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);

            var total_time_slots = [generate_slot('hours', 0, 240, 1, 'hr'), generate_slot('minutes', 0, 59, 1, 'min')];

            this.$('#picker').scroller({
                theme: 'ios',
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set('timeDelayHours', Number(instance.values[0]));
                    RadianApp.app.visibleTimeLapse.set('timeDelayMinutes', Number(instance.values[1]));
                    if(Number(instance.values[0])==0 && Number(instance.values[1]) == 0) {
                        RadianApp.app.visibleTimeLapse.set('isTimeDelay', false);
                    } else {
                        RadianApp.app.visibleTimeLapse.set('isTimeDelay', true);
                    }
                },
            }).scroller('setValue', [String(RadianApp.app.visibleTimeLapse.get('timeDelayHours')), String(RadianApp.app.visibleTimeLapse.get('timeDelayMinutes'))], false, 0);

            return this;
        }
    });



    Views.TimeLapseAdvancedView = Views.ModalView.extend({
        template: _.template($('#timeLapseAdvanced_template').html()),
    });

     Views.TimeLapseCompletedView = Views.BaseView.extend({
        template: _.template($('#timeLapseCompleted_template').html()),

        render: function () {
            this.model = RadianApp.app.runningTimeLapse;
            this.$el.empty().append(this.template());
            return this;
        },

        events: {
            'click .newTimeLapse': "newTimeLapse",
            'click .restartCounter': "restartCounter"
        },

        newTimeLapse: function () {
            RadianApp.app.cancelRunningTimeLapse();
            window.location.hash = 'home';
        },

        restartCounter: function () {
            RadianApp.app.resetStartTime();
            window.location.hash = 'timelapse/current';
        },
    });


    Views.Navigation = Backbone.View.extend({
        el: '#navigation',

        hide: function() {
            if(this.landscape && RadianApp.isIOS)  {
                navigator.screenOrientation.set('portrait', function(){}, function(){});
            }
            this.setPrevious(false);
            this.setNext(false);
            this.$el.css("visibility", "hidden");
        },

        unhide: function() {
            this.$el.css("visibility", "visible");
        },

        set: function(element, isVisible, link) {
            if(this.landscape && RadianApp.isIOS)  {
                navigator.screenOrientation.set('portrait', function(){}, function(){});
            }
            element.children().attr("href", "#");

            if(!isVisible) {
                element.css("visibility", "hidden");
                return;
            } 
            
            element.css("visibility", "visible");
            
            if(link) {
                element.removeClass('dimmed');
                element.addClass('norm');
                element.children().attr("href", link);
            } else {
                element.addClass('dimmed');
                element.removeClass('norm');
            }
        },

        setLandscape: function() {
            this.landscape = true;
            navigator.screenOrientation.set('landscape', function(){}, function(){});
        },

        setPrevious: function(isVisible, link) {
            this.set(this.$(".prev-holder"), isVisible, link);
        },

        setNext: function(isVisible, link) {
            this.set(this.$(".next-holder"), isVisible, link);
        },

        selectStep: function(number) {
            var children = this.$("#nav_numbers").children();
            for (var i = 0; i < 4; i++) {
                if(i === number-1) {
                    $(children[i]).addClass('selected');
                } else {
                    $(children[i]).removeClass('selected');
                }
            };
            if(RadianApp.app.runningTimeLapse) {
                this.highlight();
            } else {
                this.removeHighlight();
            }
        },

        highlight: function() {
            $('#4').addClass('highlight');
        },

        removeHighlight: function() {
            $('#4').removeClass('highlight');
        }

    });
    Views.navigation = new Views.Navigation();

    Views.timeLapseView = new Views.TimeLapseView({
        model: RadianApp.app
    });
    Views.timeLapsePresetsView = new Views.TimeLapsePresetsView();
    Views.timeLapseDegreesView = new Views.TimeLapseDegreesView({
        model: RadianApp.app
    });
    Views.timeLapseTotalTimeView = new Views.TimeLapseTotalTimeView({
        model: RadianApp.app
    });
    Views.timeLapseIntervalView = new Views.TimeLapseIntervalView({
        model: RadianApp.app
    });
    Views.timeLapseUploadView = new Views.TimeLapseUploadView();
    Views.timeLapseCountDownView = new Views.TimeLapseCountDownView();
    Views.timeLapseCompletedView = new Views.TimeLapseCompletedView();
    Views.timeLapseQueueView = new Views.TimeLapseQueueView({
        model: RadianApp.app
    });

    Views.timeLapseAdvancedView = new Views.TimeLapseAdvancedView({
        model: RadianApp.app
    });

    Views.speedRampingView =  new Views.SpeedRampingView({
        model: RadianApp.app
    });

    Views.bulbRampingView =  new Views.BulbRampingView({
        model: RadianApp.app
    });

    Views.bulbRampingDelay = new Views.BulbrampingDelay({
        model: RadianApp.app
    });

    Views.bulbRampingDuration = new Views.BulbrampingDuration({
        model: RadianApp.app
    });

    Views.bulbRampingStartShutter = new Views.BulbrampingStartShutter({
        model: RadianApp.app
    });

    Views.bulbRampingExposureChange = new Views.BulbrampingExposureChange({
        model: RadianApp.app
    });

    Views.timeLapseTimeDelayView = new Views.TimeLapseTimeDelay({
        model: RadianApp.app
    });

            //Launch the router
        RadianApp.router= new RadianApp.Router();
        Backbone.history.start();

        //Launch the home page
        window.location.hash = 'home';
});