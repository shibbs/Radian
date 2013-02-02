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
    var scrollTheme = isDroid ? 'android-ics' : 'ios';

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
            //Removes boxing and preloads images
            if(!this.preloaded) {
                this.$el.empty().append($('#preload_template').html());
                this.preloaded = true;
            }
            Views.navigation.unhide();
            Views.navigation.selectStep(1);
            Views.navigation.setPrevious(false);
            if(RadianApp.app.visibleTimeLapse.get("timeLapse") === RadianApp.Constants.TimeLapseType.NONE) {
                Views.navigation.setNext(true);
                $('.next').addClass('inactive-right');
            } else {
                Views.navigation.setNext(true, "#timelapse");
            }

            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));

        },

        events: {
            "click #pan": "pan",
            "click #tilt": "tilt",
            "touchstart #pan": "panStart",
            "touchstart #tilt": "tiltStart",
            "touchend #pan": "panEnd",
            "touchend #tilt": "tiltEnd",
        },

        pan: function(e) {
            RadianApp.app.visibleTimeLapse.set("timeLapse", RadianApp.Constants.TimeLapseType.PAN);
            $('.next').removeClass('inactive-right');
            window.location.hash = '#timelapse';
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        },

        tilt: function(e) {
            RadianApp.app.visibleTimeLapse.set("timeLapse", RadianApp.Constants.TimeLapseType.TILT);
            $('.next').removeClass('inactive-right');
            window.location.hash = '#timelapse';
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        },

        panStart: function() {
           // this.$('#tilt').removeClass('btn-blue');
        },

        tiltStart: function() {
           // this.$('#pan').removeClass('btn-blue');
        },

        panEnd: function() {
          // this.$('#tilt').addClass('btn-blue');
        },

        tiltEnd: function() {
          // this.$('#pan').addClass('btn-blue');
        },


    });

    Views.SettingsView = Views.ModalView.extend({
        template: _.template($('#settings_template').html()),

        events: {
            "click #fps": "fps",
            "click #about": "about",
            "click #use": "use",
        },

        render: function() {
            Views.navigation.hide();
            var elem = this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON());
            this.$el.empty().append(elem);
            return this;
        },

        fps: function () {
            window.location.hash = '#settings/framerate';
        },

        about: function () {
            window.location.hash = '#settings/about';
        },

        use: function () {
            window.location.hash = '#settings/use';

        },

    });

    Views.SettingsAboutView = Views.ModalView.extend({
        template: _.template($('#settingsAbout_template').html()),

    });

    Views.SettingsUseView = Views.ModalView.extend({
        template: _.template($('#settingsUse_template').html()),

    });

    Views.TimeLapseQueueHomeView = Backbone.View.extend({
        tagName: 'li',
        className: 'step2QueueItem',

        events: {
            "click": "toggleShow",    
        },

        template: _.template($('#timeLapseQueueItemHome_template').html()),

        endEvent: function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
        },

        initialize: function(model, scroller) {
            this.model = model;
            this.scroller = scroller;
        },
        render: function() {
            var elem = this.template(this.model.getTemplateJSON());
            this.$el.empty().append(elem);
            return this;
        },

        toggleShow: function(e) {
            if(e) this.endEvent(e);
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

    });


    Views.TimeLapseView = Views.BaseView.extend({
        template: _.template($('#timeLapse_template').html()),
        qtemplate: _.template($('#timeLapse_Queue_template').html()),
        events: {
            "click #degreeLink": "degreeLink",
            "click #totalTimeLink": "totalTimeLink",
            "click #intervalLink": "intervalLink",
            "click #presetsLink": "presetsLink",
            "click #queueLink": "queueLink",
            "click #advancedLink": "advancedLink",
        },

        degreeLink: function () {
            window.location.hash = '#timelapse/degrees';
            return false;
        },

        totalTimeLink: function () {
            window.location.hash = '#timelapse/totaltime';
            return false;
        },

        intervalLink: function () {
            window.location.hash = '#timelapse/interval';

        },

        presetsLink: function () {
            window.location.hash = '#timelapse/presets';
            return false;

        },

        queueLink: function () {
            window.location.hash = '#timelapse/queue';
            return false;

        },

        advancedLink: function () {
            window.location.hash = '#timelapse/advanced';
            return false;

        },

        insertQueue: function (model) {
            var me = this;
            var scroller = this.scroller;
            var temp = new Views.TimeLapseQueueHomeView(model, scroller);
            this.$('#list').append(temp.render().$el);
            setTimeout(function() { scroller.refresh()}, 0);
        },

        render: function () {
            Views.navigation.selectStep(2);
            Views.navigation.unhide();
            Views.navigation.setNext(true, "#timelapse/upload");
            Views.navigation.setPrevious(true, "#home");

            if(RadianApp.app.queue.length > 0) {
                this.$el.empty().append(this.qtemplate(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
                var scroller = new iScroll('scrollwrapper', {});
                this.scroller = scroller;
                var models = RadianApp.app.queue.models;
                for (var i = 0; i < models.length; i++) {
                    this.insertQueue(models[i]);
                };
                setTimeout(function() { scroller.refresh()}, 0);  
            } else {
                this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            }
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
            var isSaved = false;
            $.modal("<div> \
                        <input id='presetName' autofocus placeholder='Preset Name'> \
                        <div class='minibox'> \
                            <div id='cancelAddNewPreset' class='btn btn-white simplemodal-close'>CANCEL</div> \
                            <div id='addNewPreset' class='btn highlighted-btn'>SAVE</div> \
                        </div> \
                    </div>", {  position: ['50%', '50%'],
                                onShow: function() { 
                                                $('#simplemodal-container').css('margin-left', '-140px');
                                                $('#simplemodal-container').css('margin-top', '-70px');
                                                $('#addNewPreset').hammer().bind("tap", function(event){
                                                    isSaved = true;
                                                    event.preventDefault();
                                                event.stopImmediatePropagation();
                                                me.saveNewPreset();
                                                
                                            });

                                            setTimeout(function(){
                                                $("#presetName").focus();
                                            },100);
                                        },
                                onClose: function() {
                                    $.modal.close();
                                    if(isSaved) {
                                        $.modal("<div class='alert'>PRESET SAVED</div>", {
                                            opacity: 80,
                                            position: ['50%', '50%'],
                                            containerId: 'simplemodal-container-simple'
                                        });
                                        setTimeout(function(){
                                            $.modal.close();
                                        },600);
                                    }

                                }
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

        toggleShow: function(e) {
            if(e) this.endEvent(e);
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
            this.$('#edit').removeClass('tappable-active');
        },

        insertNewPreset: function (model, insert) {
            var me = this;
            var temp = new Views.TimeLapsePresetItemView(model, this.scroller, false, me);
            if(insert) { //Should be inserting at beginning or end
                this.$("#list > div:nth-child(1)").after(temp.render().$el);
                temp.toggleShow();
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
            var temp = RadianApp.app.visibleTimeLapse.clone();
            temp.set('current', true);
            temp.set('dateCreated', RadianApp.Utilities.formatDate(new Date(), true));
            var currentView = new Views.TimeLapsePresetItemView(temp, scroller, true, this);
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
                var scroller = that.scroller;
                that.remove();
                that.unbind();
                setTimeout(function() { if(scroller) scroller.refresh()}, 0); 
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
            if(RadianApp.app.queue.length >= 4) {
                RadianApp.Utilities.errorModal('You may only have four presets in the queue.')
                return;
            }
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
                    RadianApp.app.saveQueue();
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
            if(!this.selected && (RadianApp.app.queue.length + this.collection.length) >= 4) {
                RadianApp.Utilities.errorModal('You may only have four presets in the queue.')
                return;
            }
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

            var getSettings = function() {
                return [String(RadianApp.app.visibleTimeLapse.get('degrees')), C.DirectionAbbr(RadianApp.app.visibleTimeLapse.get('isClockwise'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };
            this.$('#picker').scroller({
                theme: scrollTheme,
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
                    RadianApp.app.visibleTimeLapse.set({'isClockwise': instance.values[1] == 'CW'} , error);
                    RadianApp.app.visibleTimeLapse.set({'degrees': Number(instance.values[0])}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);



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
            if(RadianApp.app.visibleTimeLapse.get("shouldContinue")) {
                this.$('#continue').addClass('highlight');
            } else {
                this.$('#continue').removeClass('highlight');
            }
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

            var getSettings = function() {
                return [String(RadianApp.app.visibleTimeLapse.get('totalTimeHours')), String(RadianApp.app.visibleTimeLapse.get('totalTimeMinutes'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {

                    if (Number(instance.values[0]) === 0 && Number(instance.values[1]) == 0) {
                        $('#picker').scroller('setValue', ['0', '1'], true, 0.5);
                        RadianApp.app.visibleTimeLapse.set({'totalTimeMinutes': 1} , error);
                        RadianApp.app.visibleTimeLapse.set({'totalTimeHours': 0}, error);   
                        return;
                    }
                    RadianApp.app.visibleTimeLapse.set({'totalTimeHours': Number(instance.values[0])}, error);
                    RadianApp.app.visibleTimeLapse.set({'totalTimeMinutes': Number(instance.values[1])}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);


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

            var getSettings = function() {
                return [String(RadianApp.app.visibleTimeLapse.get('intervalMinutes')), String(RadianApp.app.visibleTimeLapse.get('intervalSeconds'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };
            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: interval_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    if (Number(instance.values[0]) === 0 && Number(instance.values[1]) == 0) {
                        $('#picker').scroller('setValue', ['0', '1'], true, 0.5);
                        RadianApp.app.visibleTimeLapse.set({'intervalMinutes':0}, error);

                        RadianApp.app.visibleTimeLapse.set({'intervalSeconds':1}, error);
                        return;
                    }
                    RadianApp.app.visibleTimeLapse.set({'intervalMinutes': Number(instance.values[0])}, error);

                    RadianApp.app.visibleTimeLapse.set({'intervalSeconds': Number(instance.values[1])}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);



            return this;
        }
    });

    Views.TimeLapseUploadView = Views.BaseView.extend({
        template: _.template($('#timeLapseUpload_template').html()),

        render: function () {
            this.running = false;
            Views.navigation.selectStep(3);
            Views.navigation.unhide();
            if(RadianApp.app.runningTimeLapses.length > 0) {
                Views.navigation.setNext(true, "#timelapse/current");
            } else {
                Views.navigation.setNext(false);
            }
            Views.navigation.setPrevious(true, "#timelapse");
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));

            return this;
        },

        events: {
            'click .upload': "upload"
        },

        upload: function () {
            if(!this.running) {
                this.running = true;
                this.percent = 0;
                this.disableNavigation();
                RadianApp.app.runTimeLapse(RadianApp.app.visibleTimeLapse);
                this.advanceProgressBar();
                this.updateMessage();
            }
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
            var that = this;
            $('.prev-holder').click(function() {
                that.prev();
            });
            this.wait = 5;
            this.updateTimeInterval();
            var runningTimeLapse = RadianApp.app.getRunningTimeLapse();
            this.$el.empty().append( this.template(this.getJSON()));
            this.percent = 0;
            var totalTime = runningTimeLapse.get('totalTimeHours') * 3600 + runningTimeLapse.get('totalTimeMinutes') * 60;
            this.interval = this.getInterval(totalTime);
            $('.dial').knob();
            this.advanceProgressBar();
            return this;
        },

        updateTimeInterval: function() {
            var runningTimeLapse = RadianApp.app.getRunningTimeLapse();
            var totalTime = runningTimeLapse.get('totalTimeHours') * 3600 + runningTimeLapse.get('totalTimeMinutes') * 60;
            var elapsedTime = ((new Date()).getTime() - RadianApp.app.sentTime.getTime()) / 1000;
            if(elapsedTime > totalTime) {
                var amountOver = elapsedTime - totalTime;
                if(amountOver < 5) {
                    this.wait = Math.round(5-amountOver);
                } else {
                    var timeWhenWouldHaveStarted = (amountOver - 5) * 1000;
                    RadianApp.app.advanceRunningTimeLapse();
                    RadianApp.app.sentTime = new Date((new Date()).getTime() - timeWhenWouldHaveStarted);
                    this.updateTimeInterval();
                }
            }
        },

        getJSON: function() {
            var runningTimeLapse = RadianApp.app.getRunningTimeLapse();
            var templateJSON = runningTimeLapse.getTemplateJSON();
            if(templateJSON.totalTimeMinutes < 10) {
                templateJSON.totalTimeMinutes = '0'+templateJSON.totalTimeMinutes;
            }
            
            templateJSON.index = RadianApp.app.runningTimeLapseIndex + 1;
            templateJSON.size = RadianApp.app.getNumTimeLapses();
            templateJSON.isQueue = RadianApp.app.isQueue;
            templateJSON.isNext = templateJSON.size!==0 && templateJSON.index !== templateJSON.size;
            if(templateJSON.isNext) templateJSON.nextName = RadianApp.app.runningTimeLapses[templateJSON.index].get('name');
            //console.log(templateJSON);
            return templateJSON;
        },

        events: {
            'click .prev-holder': "prev",
            'click .newTimeLapse': "newTimeLapse",
            'click .restartCounter': "restartCounter"
        },

        newTimeLapse: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
            RadianApp.app.cancelRunningTimeLapses();
            window.location.hash = 'home';
        },

        restartCounter: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
            RadianApp.app.resetStartTime();
            this.render();
            this.advanceProgressBar();
        },

        prev: function (e) {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
        },

        updateValues: function(secondsPassed) {
            var runningTimeLapse = RadianApp.app.getRunningTimeLapse();
            var totalSeconds = runningTimeLapse.get('totalTimeHours') * 3600 + runningTimeLapse.get('totalTimeMinutes') * 60;
            this.percent = secondsPassed / totalSeconds;
            var progress = runningTimeLapse.calculateProgress(secondsPassed);

            this.$('.dial').val(RadianApp.Utilities.round(this.percent*100, 0)).trigger('change');
            this.$('#photosProgress').html(progress.photosProgress);
            this.$('#degreesProgress').html(progress.degreesProgress);
            this.$('#timeProgressHour').html(progress.timeHoursProgress);
            if(progress.timeMinutesProgress < 10) {
                progress.timeMinutesProgress = '0'+progress.timeMinutesProgress;
            }
            this.$('#timeProgressMinute').html(progress.timeMinutesProgress);
        },

        getInterval: function (totalTime) {
            var minInterval = 500; //500ms
            var maxInterval = 10000;
            var suggestedInterval = totalTime;
            if(suggestedInterval < minInterval) {
                suggestedInterval = minInterval;
            } else if(suggestedInterval > maxInterval) {
                suggestedInterval = maxInterval;
            }
            return suggestedInterval;
        },

        advanceProgressBar: function () {
            var runningTimeLapse = RadianApp.app.getRunningTimeLapse();
            var that = this;
            var callmethod = function () {
                that.advanceProgressBar()
            }
            var timePassed = ((new Date()).getTime() - RadianApp.app.sentTime.getTime()) / 1000; //offset for wait
            that.updateValues(timePassed);

            if (RadianApp.Utilities.round(that.percent*100, 0) < 100) {
                window.timeLapseCurrentLoadingBarTimeout = setTimeout(callmethod, that.interval);
            } else {
                clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
                //Try to advance the running time lapse
                if(RadianApp.app.advanceRunningTimeLapse()) {
                    //TODO keep track of global time
                    $.modal("<div class='alert'>NEXT TIME-LAPSE STARTING IN</div><div id='countDown' style='font-size: 36px;font-family: \"Conv_Gotham-Medium\";text-align: center;margin-top: 8px; color:#008bca'>"+this.wait+"</div>", {
                        position: ['50%', '50%'],
                        containerId: 'simplemodal-container-simple',
                    });
                    var that = this;
                    RadianApp.Utilities.countDown(this.wait, function(count) {
                        $('#countDown').html(count);
                    }, function() {
                        that.render();
                        $.modal.close();
                        RadianApp.app.startTime = new Date();
                    });
                } else {
                    window.location.hash = 'timelapse/completed';
                } 
            }
        }
    });

    Views.TimeLapseCountDownView = Views.BaseView.extend({
        template: _.template($('#timeLapseCountDown_template').html()),


        render: function () {
            this.$el.empty().append(this.template());
            this.count = 6;
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
            RadianApp.app.cancelRunningTimeLapses();
        },

        prev: function () {
            clearTimeout(window.timeLapseCountDownTimeout);
        },

        countDown: function () {

            var that = this;

            var callmethod = function () {
                that.countDown()
            }

            if (that.count !== 1) {
                that.count -= 1;
                that.$('#countdown').html(that.count);

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
            'click #previous': 'save',     
        },

        save: function() {

            var points = ChartMonotonic.getPoints();
            if(!points) {
                RadianApp.app.visibleTimeLapse.set('isSpeedRamping', false);
                RadianApp.app.visibleTimeLapse.set('speedRampingPoints', []);
                RadianApp.app.visibleTimeLapse.set('speedRampingCurved', false);
                
                window.location.hash = 'timelapse/advanced';
                return;
            }
            RadianApp.app.visibleTimeLapse.set('isSpeedRamping', true);
            RadianApp.app.visibleTimeLapse.set('speedRampingPoints', points);
            RadianApp.app.visibleTimeLapse.set('speedRampingCurved', !ChartMonotonic.isLinear());

            window.location.hash = 'timelapse/advanced';
        },

        reset: function() {
            this.linear();
            ChartMonotonic.setPoints();
            this.$('#reset').removeClass('tappable-active');
            this.$('.reset').removeClass('tappable-active');
        },

        linear: function() {
            ChartMonotonic.setLinear(true);
            this.$('#linear').addClass('highlight-bg');
            this.$('#cubic').removeClass('highlight-bg');
            this.$('#cubic').removeClass('tappable-active');
            this.$('#linear').removeClass('tappable-active');
        },

        curve: function() {
            ChartMonotonic.setLinear(false);
            this.$('#linear').removeClass('highlight-bg');
            this.$('#cubic').addClass('highlight-bg');
            this.$('#cubic').removeClass('tappable-active');
            this.$('#linear').removeClass('tappable-active');
        },

        render: function () {
            var width = $('body').width();

            Views.navigation.hide();
            if(RadianApp.isIOS) {
                Views.navigation.setLandscape();
            }
            this.$el.empty();
            this.$el.append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            
            var that = this;
            var loadPage = function() { 
                if(width === $('body').width()) {
                    setTimeout(loadPage, 50);
                    return
                }
                var canvas = document.createElement('canvas');
                var container = $("#chart_monotonic");
                canvas.width = $("#horizontalNav").width()-80;
                canvas.height = container.height();
                canvas.id = 'chart';
                container.append(canvas);
                //<canvas width="100%" height="100%" id="chart"></canvas>
                var totalTime = RadianApp.app.visibleTimeLapse.get('totalTimeHours') * 60 + RadianApp.app.visibleTimeLapse.get('totalTimeMinutes');
                var degrees = RadianApp.app.visibleTimeLapse.get('degrees');

                ChartMonotonic = new SplineChart('chart_monotonic', 'Time (minutes)', 'Degrees', '#008bca', function(xs, ys) {
                    return new MonotonicCubicSpline(xs, ys);
                }, totalTime, degrees);

                //ChartMonotonic.addNewPoint(0, 0, true); //Hack to be able to reset graph
                if(RadianApp.app.visibleTimeLapse.get('isSpeedRamping')) {
                    if(RadianApp.app.visibleTimeLapse.get('speedRampingCurved')){
                        that.curve();
                    } else {
                        that.linear();
                    }
                    ChartMonotonic.setPoints(RadianApp.app.visibleTimeLapse.get('speedRampingPoints'));
                } else {
                    that.linear();
                    ChartMonotonic.setPoints();
                }
            }
            setTimeout(loadPage, 50);
        }
    });

    //BULB RAMPING CODE
    Views.BulbRampingView = Views.ModalView.extend({
        template: _.template($('#bulbRamping_template').html()),

        events: {
            'click #isBulbRamping': "toggleOn",        
        },


        toggleOn: function(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            RadianApp.app.visibleTimeLapse.set("isBulbRamping", !RadianApp.app.visibleTimeLapse.get("isBulbRamping"));
            this.$('#unchecked').prop("checked", RadianApp.app.visibleTimeLapse.get("isBulbRamping"));
        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));
            var statsView = new Views.BulbRampStatsBoxView({
                model: this.model
            });
            this.$('#secondary').append(statsView.render().el);
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

            var getSettings = function() {
                return [String(RadianApp.app.visibleTimeLapse.get('delayHours')), String(RadianApp.app.visibleTimeLapse.get('delayMinutes'))]
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set({'delayHours': Number(instance.values[0])}, error);
                    RadianApp.app.visibleTimeLapse.set({'delayMinutes': Number(instance.values[1])}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);


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


            var getSettings = function() {
                return [String(RadianApp.app.visibleTimeLapse.get('durationHours')), String(RadianApp.app.visibleTimeLapse.get('durationMinutes'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {

                    if (Number(instance.values[0]) === 0 && Number(instance.values[1]) == 0) {
                        $('#picker').scroller('setValue', ['0', '1'], true, 0.5);
                        RadianApp.app.visibleTimeLapse.set({'durationMinutes': 1});
                        RadianApp.app.visibleTimeLapse.set({'durationHours': 0});
                        return;
                    }
                    RadianApp.app.visibleTimeLapse.set({'durationHours': Number(instance.values[0])}, error);
                    RadianApp.app.visibleTimeLapse.set({'durationMinutes': Number(instance.values[1])}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);


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
                return ["1/30", "1/25", "1/20", "1/15", "1/13", "1/10", "1/8", "1/6", "1/5", "1/4", ".3", ".4", ".5", ".6", ".7", ".8", ".9", "1", "1.3", "1.6", "2", "3.2"].concat(temp_array)
            }()
            var wheel = {};
            for (var i = 0; i < exposures.length; i++) { 
                wheel[i] =  "          "+exposures[i]+ "          ";
            }

            var total_time_slots = [{'s': wheel}];

            var getSettings = function() {
                return [exposures.indexOf(RadianApp.app.visibleTimeLapse.get('startShutter'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set({'startShutter': exposures[instance.values[0]]}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);

            $('.ios .dwwl').css('min-width', '270px');

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

            var getSettings = function() {
                return [exp.indexOf(RadianApp.app.visibleTimeLapse.get('expChange')), expType.indexOf(RadianApp.app.visibleTimeLapse.get('expType'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    //console.log(instance.values[1])
                    RadianApp.app.visibleTimeLapse.set({'expChange': exp[instance.values[0]]}, error);
                    RadianApp.app.visibleTimeLapse.set({'expType': expType[instance.values[1]]}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);

            //console.log(RadianApp.app.visibleTimeLapse.get('expType'));
            //console.log(expType.indexOf(RadianApp.app.visibleTimeLapse.get('expType')));
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

            var getSettings = function() {
                return [String(RadianApp.app.visibleTimeLapse.get('timeDelayHours')), String(RadianApp.app.visibleTimeLapse.get('timeDelayMinutes'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: total_time_slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set({'timeDelayHours': Number(instance.values[0])}, error);
                    RadianApp.app.visibleTimeLapse.set({'timeDelayMinutes': Number(instance.values[1])}, error);
                    if(Number(instance.values[0])==0 && Number(instance.values[1]) == 0) {
                        RadianApp.app.visibleTimeLapse.set({'isTimeDelay': false}, error);
                    } else {
                        RadianApp.app.visibleTimeLapse.set({'isTimeDelay': true}, error);
                    }
                },
            }).scroller('setValue', getSettings(), false, 0);

            return this;
        }
    });

    Views.TimeLapseHoldView = Views.ModalView.extend({
        template: _.template($('#timeLapseHold_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.visibleTimeLapse.bind('change:hold', this.updateHold, this);
        },


        updateHold: function () {
            this.$('#hold').html(RadianApp.app.visibleTimeLapse.get('hold'));
        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));

            var exp = [".25", ".5", "1", "2", "3", "4", "5"];
            var wheel = {};
            for (var i = 0; i < exp.length; i++) { 
                wheel[i] =  exp[i] + " s";
            }
            var slots = [{"s": wheel}];

            var getSettings = function() {
                return [exp.indexOf(RadianApp.app.visibleTimeLapse.get('hold'))];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.visibleTimeLapse.set({'hold': exp[instance.values[0]]}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);
            $('.ios .dwwl').css('min-width', '270px');
            return this;
        }
    });

    Views.SettingsFrameRateView = Views.ModalView.extend({
        template: _.template($('#settingsFrameRate_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            RadianApp.app.bind('change:fps', this.updateFps, this);
        },

        updateFps: function () {
            this.$('#fps').html(RadianApp.app.get('fps'));
        },

        render: function () {
            Views.navigation.hide();
            this.$el.empty().append(this.template(RadianApp.app.visibleTimeLapse.getTemplateJSON()));

            var exp = ["5", "10", "11", "12", "13", "14", "15", "20", "24", "25", "30", "45", "50", "60"];
            var wheel = {};
            for (var i = 0; i < exp.length; i++) { 
                wheel[i] =  exp[i];
            }
            var slots = [{"s": wheel}];


            var getSettings = function() {
                return [exp.indexOf( String(RadianApp.app.get('fps')) )];
            };
            var error= {
                error: function () {
                    $('#picker').scroller('setValue', getSettings(), true, 0.5);
                }
            };

            this.$('#picker').scroller({
                theme: scrollTheme,
                display: 'inline',
                mode: 'scroller',
                wheels: slots,
                height: 35,
                rows: 3,
                onChange: function (valueText, instance) {
                    RadianApp.app.set({'fps': exp[instance.values[0]]}, error);
                },
            }).scroller('setValue', getSettings(), false, 0);
            $('.ios .dwwl').css('min-width', '270px');
            return this;
        }
    });





    Views.TimeLapseAdvancedView = Views.ModalView.extend({
        template: _.template($('#timeLapseAdvanced_template').html()),

        events: {
            'click #timedelay': 'timedelay',
            'click #speedramping': 'speedramping',
            'click #bulbramping': 'bulbramping',
            'click #hold': 'hold'
        },

        timedelay: function() {
            window.location.hash = 'timelapse/timedelay';
        },

        speedramping: function() {
            window.location.hash = 'timelapse/speedramping';
        },

        bulbramping: function() {
            window.location.hash = 'timelapse/bulbramping';
        },
        
        hold: function() {
            window.location.hash = 'timelapse/hold';
        },


    });

     Views.TimeLapseCompletedView = Views.BaseView.extend({
        template: _.template($('#timeLapseCompleted_template').html()),

        render: function () {
            this.$el.empty().append(this.template());
            return this;
        },

        events: {
            'click .newTimeLapse': "newTimeLapse",
            'click .restartCounter': "restartCounter"
        },

        newTimeLapse: function () {
            RadianApp.app.cancelRunningTimeLapses();
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
            this.isModal = true;
            if(this.landscape)  {
                navigator.screenOrientation.set('portrait', function(){}, function(){});
            }
            this.setPrevious(false);
            this.setNext(false);
            this.$el.css("visibility", "hidden");
        },

        unhide: function() {
            this.isModal = false;
            this.$el.css("visibility", "visible");
        },

        set: function(element, isVisible, link) {
            if(this.landscape)  {
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
            if(RadianApp.app.runningTimeLapses.length > 0) {
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