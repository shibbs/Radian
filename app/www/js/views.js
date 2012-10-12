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
            this.$el.empty().append(this.template(this.model.getTemplateJSON()));
            // If we are currently running one don't simulate upload
            if (window.running_program) {
                $('#thirdstep').attr('href', '#timelapse/current');
            }
            return this;
        }
    });

    window.views.TimeLapsePresetsView = window.views.BaseView.extend({
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

        updateTotalTimeHours: function () {
            this.$('#hours').html(this.model.get('totalTimeHours'));

        },

        updateTotalTimeMinutes: function () {
            this.$('#totalTimeMinutes').html(this.model.get('totalTimeMinutes'));

        },

        render: function () {
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
            this.$el.empty().append(this.template());
            return this;
        }
    });

    window.views.TimeLapseUploadInProgressView = window.views.BaseView.extend({
        template: _.template($('#timeLapseUploadInProgress_template').html()),

        render: function () {
            this.$el.empty().append(this.template());
            window.running_program = window.app.clone();
            this.percent = 0;
            send_data(window.running_program);
            //DataTransmission.send(function () {}, function () {}, [window.app.get('intervalMinutes'), window.app.get('intervalSeconds'), window.app.get('totalTimeHours'), window.app.get('totalTimeMinutes'), window.app.get('degrees')]);
            this.advanceProgressBar();
            return this;
        },

        events: {
            'click .cancel': "cancel"
        },



        cancel: function () {
            clearTimeout(window.timeLapseLoadingBarTimeout);
            window.running_program = null;
            //window.app.set('start_time', null);
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
            this.model = window.running_program;
            this.$el.empty().append(this.template(this.model.toJSON()));
            this.percent = 0;
            if (!this.model.get('start_time')) {
                this.model.set('start_time', new Date());
            }
            this.advanceProgressBar();
            return this;
        },

        events: {
            'click .cancel': "cancel",
            'click .prev': "prev"

        },

        prev: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
        },

        cancel: function () {
            clearTimeout(window.timeLapseCurrentLoadingBarTimeout);
            window.running_program = null;
            //window.app.set('start_time', null);
        },


        advanceProgressBar: function () {
            var that = this;
            var callmethod = function () {
                that.advanceProgressBar()
            }
            var totalSeconds = that.model.get('totalTimeHours') * 3600 + that.model.get('totalTimeMinutes') * 60;
            var timePassed = ((new Date()).getTime() - that.model.get('start_time').getTime()) / 1000;
            that.percent = timePassed / totalSeconds;

            hours = parseInt(timePassed / 3600) % 24;
            minutes = parseInt(timePassed / 60) % 60;

            that.$('#loading').css('width', Math.round(that.percent * 100) + '%');
            that.$('#hours').html(hours);
            that.$('#minutes').html(minutes);
            that.$('#degrees').html(_.round(that.percent * that.model.get('degrees'), 2) + '&deg;');
            if (that.percent <= 100) {
                window.timeLapseCurrentLoadingBarTimeout = setTimeout(callmethod, 20 * 1000);
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
            'click .cancel': "cancel",
            'click .prev': "prev"
        },

        cancel: function () {
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
                that.$('.mark').html(that.count);
                window.timeLapseCountDownTimeout = setTimeout(callmethod, 1000);
            }
            else {
                window.location.hash = 'timelapse/current';
            }
        }
    });

    window.views.TimeLapseQueueView = window.views.BaseView.extend({
        template: _.template($('#timeLapseQueue_template').html()),
    });

    window.views.TimeLapseAdvancedView = window.views.BaseView.extend({
        template: _.template($('#timeLapseAdvanced_template').html()),
    });


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
    window.views.timeLapseUploadInProgressView = new window.views.TimeLapseUploadInProgressView();
    window.views.timeLapseCountDownView = new window.views.TimeLapseCountDownView();
    window.views.timeLapseQueueView = new window.views.TimeLapseQueueView();
    window.views.timeLapseAdvancedView = new window.views.TimeLapseAdvancedView();
});