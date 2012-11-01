//TODO: Abstract
_.mixin({
    round: function(num, dec) {
        var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
        return result;
    }
});

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


$(document).ready(function () {
    window.views = {};
    window.views.BaseView = Backbone.View.extend({

        initialize: function () {
            this.setElement($("#container"));
        },

        render: function () {
            if(!this.model) {
                this.$el.empty().append(this.template());
            } else {
                this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            }  
            return this;
        }
    });

    window.views.ModalView = Backbone.View.extend({

        initialize: function () {
            this.setElement($("#container"));
        },

        render: function () {
            window.views.navigation.hide();
            if(!this.model) {
                this.$el.empty().append(this.template());
            } else {
                this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            }  
            return this;
        }
    });



    window.views.StatsBoxView = Backbone.View.extend({
        template: _.template($('#statsBox_template').html()),

        initialize: function () {
            this.model.bind('change', this.render, this); //TODO make more granular
        },

        render: function () {
            this.$el.empty().append(this.template(this.model.getStats()));
            return this;
        },
    });

    window.views.BulbRampStatsBoxView = Backbone.View.extend({
        template: _.template($('#bulbRampStatsBox_template').html()),

        initialize: function () {
            this.model.bind('change', this.render, this); //TODO make more granular
        },

        render: function () {
            this.$el.empty().append(this.template(this.model.getStats()));
            return this;
        },
    });

    window.views.HomeView = window.views.BaseView.extend({
        template: _.template($('#home_template').html()),

        render: function () {
            window.views.navigation.selectStep(1);
            window.views.navigation.unhide();
            window.views.navigation.setPrevious(false);
            if(this.model.get("timeLapse") === Constants.TimeLapseType.NONE) {
                window.views.navigation.setNext(true);
            } else {
                window.views.navigation.setNext(true, "#timelapse");
            }

            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
        },

        events: {
            "click #pan": "pan",
            "click #tilt": "tilt",
        },

        pan: function() {
            this.model.set("timeLapse", Constants.TimeLapseType.PAN);
        },

        tilt: function() {
            this.model.set("timeLapse", Constants.TimeLapseType.TILT);
        }
    });

    window.views.TimeLapseView = window.views.BaseView.extend({
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
            window.views.navigation.selectStep(2);
            window.views.navigation.unhide();
            window.views.navigation.setNext(true, "#timelapse/upload");
            window.views.navigation.setPrevious(true, "#home");

            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            // If we are currently running one don't simulate upload
            if (window.running_program) {
                $('#thirdstep').attr('href', '#timelapse/current');
            }
            return this;
        }
    });

    window.views.TimeLapsePresetsView = window.views.ModalView.extend({
        template: _.template($('#timeLapsePresets_template').html()),


    });

    window.views.TimeLapseDegreesView = window.views.BaseView.extend({
        template: _.template($('#timeLapseDegrees_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            this.model.bind('change:degrees', this.updateDegrees, this);
            this.model.bind('change:isClockwise', this.updateDirection, this);
        },
        updateDegrees: function () {
            this.$('#wrapper #degrees').html(this.model.get('degrees') + '&deg;');



        },

        updateDirection: function () {
            this.$('#direction').html(this.model.direction());



        },




        render: function () {
            window.views.navigation.hide();
            var create_slot = function (start, finish, increment) {
                var data = {};
                for (var i = start; i <= finish; i += increment) {
                    data[i.toString()] = i;
                }
                return data;
            }

            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.StatsBoxView({
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
                    window.app.set('isClockwise', instance.values[1] == 'CW');

                    window.app.set('degrees', Number(instance.values[0]));
                },
            }).scroller('setValue', [String(this.model.get('degrees')), this.model.directionAbr()], false, 0);



            return this;
        },


    });

    window.views.TimeLapseTotalTimeView = window.views.BaseView.extend({
        template: _.template($('#timeLapseTotalTime_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            this.model.bind('change:totalTimeHours', this.updateTotalTimeHours, this);
            this.model.bind('change:totalTimeMinutes', this.updateTotalTimeMinutes, this);
        },

        events: {
            "click #continue": "continue",
        },

        continue: function() {
            this.model.set("shouldContinue", !this.model.get("shouldContinue"));
            this.$('#continue').toggleClass('highlight');
        },

        updateTotalTimeHours: function () {
            this.$('#hours').html(this.model.get('totalTimeHours'));

        },

        updateTotalTimeMinutes: function () {
            this.$('#totalTimeMinutes').html(this.model.get('totalTimeMinutes'));

        },

        render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.StatsBoxView({
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

                        window.app.set('totalTimeHours', 0);

                        window.app.set('totalTimeMinutes', 1);
                        return;
                    }
                    window.app.set('totalTimeHours', Number(instance.values[0]));

                    window.app.set('totalTimeMinutes', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(this.model.get('totalTimeHours')), String(this.model.get('totalTimeMinutes'))], false, 0);


            return this;
        }
    });

    window.views.TimeLapseIntervalView = window.views.BaseView.extend({
        template: _.template($('#timeLapseInterval_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            this.model.bind('change', this.updateInterval, this);
        },

        updateInterval: function () {
            this.$('#intervalMinutes').html(this.model.get('intervalMinutes'));
            this.$('#intervalSeconds').html(this.model.get('intervalSeconds'));

        },

        render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.StatsBoxView({
                model: this.model
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
                        window.app.set('intervalMinutes', 0);

                        window.app.set('intervalSeconds', 1);
                        return;
                    }
                    window.app.set('intervalMinutes', Number(instance.values[0]));

                    window.app.set('intervalSeconds', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(this.model.get('intervalMinutes')), String(this.model.get('intervalSeconds'))], false, 0);



            return this;
        }
    });

    window.views.TimeLapseUploadView = window.views.BaseView.extend({
        template: _.template($('#timeLapseUpload_template').html()),

        render: function () {
            window.views.navigation.selectStep(3);
            window.views.navigation.unhide();
            window.views.navigation.setNext(true);
            window.views.navigation.setPrevious(true, "#timelapse");
            this.$el.empty().append(this.template());
            return this;
        },

        events: {
            'click .upload': "upload"
        },

        upload: function () {
            window.running_program = window.app.clone();
            this.percent = 0;
            this.disableNavigation();
            send_data(window.running_program);
            send_data(window.running_program);
            this.advanceProgressBar();
            this.updateMessage();
        },

        disableNavigation: function () {
            window.views.navigation.setPrevious(true);
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
            }
        }
    });

    window.views.TimeLapseCurrent = window.views.BaseView.extend({
        template: _.template($('#timeLapseCurrent_template').html()),

        render: function () {
            window.views.navigation.selectStep(4);
            window.views.navigation.unhide();
            window.views.navigation.setNext(false);
            window.views.navigation.setPrevious(true, "#timelapse");

            this.m = window.running_program;
            this.$el.empty().append(this.template(this.model.toJSON()));
            this.percent = 0;
            if (!this.m.get('start_time')) {
                this.m.set('start_time', new Date());
            }
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
            window.running_program = null;
            window.location.hash = 'home';
        },

        restartCounter: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
            window.running_program.set('start_time', new Date());
            this.m=window.running_program;
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
            var totalSeconds = that.m.get('totalTimeHours') * 3600 + that.m.get('totalTimeMinutes') * 60;
            var timePassed = ((new Date()).getTime() - that.m.get('start_time').getTime()) / 1000;
            that.percent = timePassed / totalSeconds;

            hours = parseInt(timePassed / 3600) % 24;
            minutes = parseInt(timePassed / 60) % 60;
            that.$('.dial').val(_.round(that.percent*100, 0)).trigger('change');
            that.$('#hours').html(hours);
            that.$('#minutes').html(minutes);
            that.$('#degrees').html(_.round(that.percent * that.m.get('degrees'), 2) + '&deg;');
            if (_.round(that.percent*100, 0) < 100) {
                window.timeLapseCurrentLoadingBarTimeout = setTimeout(callmethod, 20 * 1000);
            } else {
                clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
                window.location.hash = 'timelapse/completed';
            }
        }
    });

    window.views.TimeLapseCountDownView = window.views.BaseView.extend({
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
            window.running_program = null;
            //window.app.set('start_time', null);
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

    window.views.homeView = new window.views.HomeView({
        model: window.app
    });

    //BULB RAMPING CODE
    window.views.BulbRampingView = window.views.ModalView.extend({
        template: _.template($('#bulbRamping_template').html()),

        events: {
            'click #isBulbRamping': "toggleOn",        },


        toggleOn: function() {
            this.model.set("isBulbRamping", !this.model.get("isBulbRamping"));
        },

                render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.BulbRampStatsBoxView({
                model: this.model
            });
            this.$('#wrapper').append(statsView.render().el);
        }
    });

    window.views.BulbrampingDelay = window.views.ModalView.extend({
        template: _.template($('#bulbRampingDelay_template').html()),

         initialize: function () {
            this.setElement($("#container"));
            this.model.bind('change:delayHours', this.updateDelayHours, this);
            this.model.bind('change:delayMinutes', this.updateDelayMinutes, this);
        },


        updateDelayHours: function () {
            this.$('#delayHours').html(this.model.get('delayHours'));

        },

        updateDelayMinutes: function () {
            this.$('#delayMinutes').html(this.model.get('delayMinutes'));

        },


        render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.BulbRampStatsBoxView({
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
                    window.app.set('delayHours', Number(instance.values[0]));
                    window.app.set('delayMinutes', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(this.model.get('delayHours')), String(this.model.get('delayMinutes'))], false, 0);


            return this;
        }
    });

    window.views.BulbrampingDuration = window.views.ModalView.extend({
        template: _.template($('#bulbRampingDuration_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            this.model.bind('change:durationHours', this.updateDurationHours, this);
            this.model.bind('change:durationMinutes', this.updateDurationMinutes, this);
        },


        updateDurationHours: function () {
            this.$('#durationHours').html(this.model.get('durationHours'));

        },

        updateDurationMinutes: function () {
            this.$('#durationMinutes').html(this.model.get('durationMinutes'));

        },


        render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.BulbRampStatsBoxView({
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

                        window.app.set('durationHours', 0);

                        window.app.set('durationMinutes', 1);
                        return;
                    }
                    window.app.set('durationHours', Number(instance.values[0]));

                    window.app.set('durationMinutes', Number(instance.values[1]));
                },
            }).scroller('setValue', [String(this.model.get('durationHours')), String(this.model.get('durationMinutes'))], false, 0);


            return this;
        }
    });

    window.views.BulbrampingStartShutter = window.views.ModalView.extend({
        template: _.template($('#bulbRampingStartShutter_template').html()),

                initialize: function () {
            this.setElement($("#container"));
            this.model.bind('change:startShutter', this.updateStartShutter, this);
        },


        updateStartShutter: function () {
            this.$('#startShutter').html(this.model.get('startShutter'));

        },

        render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.BulbRampStatsBoxView({
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
                    window.app.set('startShutter', exposures[instance.values[0]]);
                },
            }).scroller('setValue', [exposures.indexOf(this.model.get('startShutter'))], false, 0);


            return this;
        }
    });

    window.views.BulbrampingExposureChange = window.views.ModalView.extend({
        template: _.template($('#bulbRampingExpChange_template').html()),

        initialize: function () {
            this.setElement($("#container"));
            this.model.bind('change:expChange', this.updateExpChange, this);
            this.model.bind('change:expType', this.updateExpType, this);
        },


        updateExpChange: function () {
            this.$('#expChange').html(this.model.get('expChange'));
        },


        updateExpType: function () {
            this.$('#expType').html(this.model.get('expType'));
        },


        render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            var statsView = new window.views.BulbRampStatsBoxView({
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
                    window.app.set('expChange', exp[instance.values[0]]);
                    window.app.set('expType', expType[instance.values[1]]);
                },
            }).scroller('setValue', [exp.indexOf(this.model.get('expChange')), expType.indexOf(this.model.get('expType'))], false, 0);

            console.log(this.model.get('expType'));
            console.log(expType.indexOf(this.model.get('expType')));
            return this;
        }
    });

    // ********************* END OF BULB RAMPING CODE ****************** //


    window.views.TimeLapseQueueView = window.views.ModalView.extend({
        template: _.template($('#timeLapseQueue_template').html()),
    });

    window.views.TimeLapseAdvancedView = window.views.ModalView.extend({
        template: _.template($('#timeLapseAdvanced_template').html()),
    });

     window.views.TimeLapseCompletedView = window.views.BaseView.extend({
        template: _.template($('#timeLapseCompleted_template').html()),

        render: function () {
            this.model = window.running_program;
            this.$el.empty().append(this.template());
            return this;
        },

        events: {
            'click .newTimeLapse': "newTimeLapse",
            'click .restartCounter': "restartCounter"
        },

        newTimeLapse: function () {
            window.running_program = null;
            window.location.hash = 'home';
        },

        restartCounter: function () {
            window.running_program.set('start_time', new Date());
            window.location.hash = 'timelapse/current';
        },
    });


    window.views.Navigation = Backbone.View.extend({
        el: '#navigation',

        hide: function() {
            this.setPrevious(false);
            this.setNext(false);
            this.$el.css("visibility", "hidden");
        },

        unhide: function() {
            this.$el.css("visibility", "visible");
        },

        set: function(element, isVisible, link) {
            element.children().attr("href", "#");

            if(!isVisible) {
                element.css("visibility", "hidden");
                return;
            } 
            
            element.css("visibility", "visible");
            
            if(link) {
                element.children().attr("href", link);
            }    
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
        }

    });
    window.views.navigation = new window.views.Navigation();

    window.views.timeLapseView = new window.views.TimeLapseView({
        model: window.app
    });
    window.views.timeLapsePresetsView = new window.views.TimeLapsePresetsView();
    window.views.timeLapseDegreesView = new window.views.TimeLapseDegreesView({
        model: window.app
    });
    window.views.timeLapseTotalTimeView = new window.views.TimeLapseTotalTimeView({
        model: window.app
    });
    window.views.timeLapseIntervalView = new window.views.TimeLapseIntervalView({
        model: window.app
    });
    window.views.timeLapseUploadView = new window.views.TimeLapseUploadView();
    window.views.timeLapseCountDownView = new window.views.TimeLapseCountDownView();
    window.views.timeLapseCompletedView = new window.views.TimeLapseCompletedView();
    window.views.timeLapseQueueView = new window.views.TimeLapseQueueView();
    window.views.timeLapseAdvancedView = new window.views.TimeLapseAdvancedView({
        model: window.app
    });

    window.views.bulbRampingView =  new window.views.BulbRampingView({
        model: window.app
    });

    window.views.bulbRampingDelay = new window.views.BulbrampingDelay({
        model: window.app
    });

    window.views.bulbRampingDuration = new window.views.BulbrampingDuration({
        model: window.app
    });

    window.views.bulbRampingStartShutter = new window.views.BulbrampingStartShutter({
        model: window.app
    });

    window.views.bulbRampingExposureChange = new window.views.BulbrampingExposureChange({
        model: window.app
    });
});