$().ns('RadianApp.UI');

$(document).ready(function () {

	//Does a depth first search for elements with classes
	//If none are found returns the original element.
	var getElementWithClass = function(elem) {
		var child = elem;
		while(!child.attr('class')) {
			child = elem.children();
			if(child.length === 0) return elem;
			child = $(child[0]);
		}
		console.log(child.attr('class'));
		return child;
	}

	//Centers an element vertically between the prev and next that have
	//a class
	RadianApp.UI.centerVertically = function(selectorToCenter) {
		var itemToCenter = $(selectorToCenter);
		var height = itemToCenter.outerHeight(true);
		var topItem = getElementWithClass(itemToCenter.prev());
		var top = topItem.offset().top + topItem.outerHeight(true);
		var bottom = getElementWithClass(itemToCenter.next()).offset().top;
		var topMarginNeeded = (bottom-top-height)/2;
		itemToCenter.css('margin-top', (parseInt(itemToCenter.css('margin-top'),10)+topMarginNeeded)+'px');
	}

});