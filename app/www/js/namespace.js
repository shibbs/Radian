			(function( $ ){
			  	$.fn.ns = function(namespace){
				    return namespace.split('.').reduce(function(holder, name){
				        holder[name] = holder[name] || {};
				        return holder[name];
				    }, window);
				};
			})( jQuery );