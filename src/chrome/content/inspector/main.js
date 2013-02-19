(function () {

			
	function OnMouseOver(e) {
	  element = e.target;   // not IE

	  // set the border around the element
	  element.style.borderWidth = '2px';
	  element.style.borderStyle = 'solid';
	  element.style.borderColor = '#f00';
	}

 
	function OnMouseOut(evt) {
    evt.target.style.borderStyle = 'none';
	}

	function OnClick(e) {
		cancelEvent(e);
	  var selection = e.target.innerHTML;

	  alert('Element is: ' + e.target.toString() + '\n\nSelection is:\n\n' + selection);
	  return false;
	}

	function cancelEvent (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
	}

	document.addEventListener("mouseover", OnMouseOver, true);
	document.addEventListener("mouseout", OnMouseOut, true);
	document.addEventListener("click", OnClick, true);
})();