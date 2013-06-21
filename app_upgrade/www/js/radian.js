// RadianApp is the base namespace
$().ns('RadianApp');
$().ns('RadianApp.app');

$(document).ready(function() {

	RadianApp.app = new RadianApp.Models.App();
	RadianApp.router= new RadianApp.Router();
    Backbone.history.start();

});