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
            this.$el.empty().append(this.template());
            return this;
        }
    });

    window.views.ModalView = Backbone.View.extend({

        initialize: function () {
            this.setElement($("#container"));
        },

        render: function () {
            window.views.navigation.hide();
            this.$el.empty().append(this.template());
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
            //DataTransmission.send(function () {}, function () {}, [window.app.get('intervalMinutes'), window.app.get('intervalSeconds'), window.app.get('totalTimeHours'), window.app.get('totalTimeMinutes'), window.app.get('degrees')]);
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
    window.views.timeLapseAdvancedView = new window.views.TimeLapseAdvancedView();
});