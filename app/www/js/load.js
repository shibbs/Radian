						window.addEventListener('load', function() {
    			new FastClick(document.body);
			}, false);

			(function( $ ){
			  	$.fn.ns = function(namespace){
				    return namespace.split('.').reduce(function(holder, name){
				        holder[name] = holder[name] || {};
				        return holder[name];
				    }, window);
				};
			})( jQuery );
			(function() {
				try {
					var array = new Uint8Array(10);
				} catch(e) {
					Uint8Array = function (length) {
						var array = [];
						for (var i = 0; i < length; i++) {
							array.push(0);
						};
						return array
					}
				}
			})();


			$("body").hammer({
					'drag': false,
					'tap': false,
					'hold': false,
					'transform':false,
			    	'swipe_time':400,
			    	'swipe_min_distance': 260
			   })
			   .bind("swipe", function(ev) {
			        var link;
			        if(!RadianApp.Views.navigation.isModal) {
			        	if(ev.direction==='left') {
			        		link = $('.next-holder .next').attr('href');
			        	} else if(ev.direction==='right') {
			        		link = $('.prev-holder .prev').attr('href');
			        	}
			        } else {
			        	if(ev.direction === 'right') {
			        		link = $('.btn-back').attr('href');
			        	}
			        }
			        if(link) {
			        	window.location.hash = link.substring(1);
			        }
			   });
			   
			$(document).ready(function() {
				    if(!isRadianWeb) {
				    	onBackKeyDown = function() {
					        if($('#simplemodal-data') && $('#simplemodal-data').length > 0) {
					        	$.modal.close();
					        } else {
					        	window.location.hash = RadianApp.app.backButton;
					        }
					        return false;
					    }
					    document.addEventListener("backbutton", onBackKeyDown, false);
				    }
				    window.location.hash = 'home';
			});