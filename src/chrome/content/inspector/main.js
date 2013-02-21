(function () {
	window.previewObject = null;
	var copyBorder = {"width": "", "style": "", "color": ""};

	function highlightBorder (el) {
		copyBorder.width = el.style.borderWidth;
		copyBorder.style = el.style.borderStyle;
		copyBorder.color = el.style.borderColor;

	  el.style.borderWidth = "2px";
	  el.style.borderStyle = "solid";
	  el.style.borderColor = "#f00";
	}

	function removeBorder (el) {
	  el.style.borderWidth = copyBorder.width;
	  el.style.borderStyle = copyBorder.style;
	  el.style.borderColor = copyBorder.color;

		copyBorder.width = "";
		copyBorder.style = "";
		copyBorder.color = "";
	}

	function PreviewObject() {
		this.img = "";
		this.title = document.title;
		this.url =  parseUrl(document.URL).fullhostname;
		this.size = null;
		this.color = "transparent";
		this.sprite = null;
	}

	function OnMessage (e) {
		if ( e.data.action == "showScreenshot" ) {

			previewObject = new PreviewObject();
			previewObject.img = e.data.image.img;
			previewObject.size = {
				"width": e.data.image.size.width,
				"height": e.data.image.size.height
			};

			doPreview (previewObject);
		}
	}
			
	function OnMouseOver(e) {
	  el = e.target;   // not IE

	  // not for preview box
	  if ( el.id === "R2D2C3P0" ) { return; }
	  // set the border around the element
		highlightBorder(el);
	}
 
	function OnMouseOut(e) {
    removeBorder(e.target);
	}

	function OnClick(e) {
		cancelEvent(e);
	  // if ( isRightClick(e) ) {}

	  if ( isLeftClick(e) ) {
	  	var el = e.target;
	  	// takes a snapshot of selected element
	  	if ( e.ctrlKey ) {
	  		getScreenshot(el);
	  		return;
	  	}

	  	// for image
	  	if ( el.tagName === "IMG" ) {
				getImage(el, function (image) {
					console.dir(image);
					doPreview( image );
				});
	  	}
	  	else {
	  		getBackground(el, function (bg) {
		  		if ( bg.error ) {
			  		getScreenshot( el );
		  		}
		  		else {
		  			doPreview( bg );
		  		}
	  		});
	  	}
	  }
	  return false;
	}

	function getBackground (el, callback) {
		previewObject = new PreviewObject();

		window.query = {
			"prop": "backgroundImage",
			"onlyOneParent": true,
			"except": ["none", "inherit", ""],
			"default": ""
		};

		var url = scanForProp(el, query);

		if ( url == "" ) {
			if ( callback ) {
				callback({"error": "No image or sprite found"});
			}
			return;
		}

		previewObject.img = normalizeUrl(extractCssStyledUrl(url));

		// seek a background-color starting from 'query._el' element
		previewObject.color = scanForProp(query._el, {
			"prop": "backgroundColor",
			"onlyOneParent": false,
			"except": ["transparent", "inherit", "none", ""],
			"default": "transparent"
		});
		
		var style = window.getComputedStyle(query._el, null);
		var arrPos = style.backgroundPosition.split(" ");
		var posX = arrPos[0];
		var posY = arrPos[1];
		var spriteWidth = parseInt(style.width);
		var spriteHeight = parseInt(style.height);

		// compare size of an image with dimention of an element
		// if bg image is a part of a sprite image
		var img = document.createElement("img");
		img.onload = img.onerror = function (e) {
			var sprite = null;

			// actuall image dimentions 
			previewObject.size = {
				"width": this.width,
				"height": this.height
			};

			if ( e.type === "load" ) {
				if ( this.width > spriteWidth || this.height > spriteHeight ) {
					// handles percents
					if ( posX.indexOf("%") !== -1 ) {
						posX = this.width * (Math.abs(parseInt(posX)) / 100);
					}
					else {
						posX = Math.abs(parseInt(posX));
					}

					if ( posY.indexOf("%") !== -1 ) {
						posY = this.height * (Math.abs(parseInt(posY)) / 100);
					}
					else {
						posY = Math.abs(parseInt(posY));
					}

					// sprite size cannot be bigger than source image
					if ( (posX + spriteWidth) > this.width ) { spriteWidth = this.width; }
					if ( (posY + spriteHeight) > this.height ) { spriteHeight = this.height; }

					// if dimentions of a potential image are bigger than element's dimentions
					// guess it's a sprite!!!
					sprite = {
						"x": posX,
						"y": posY,
						"width": spriteWidth,
						"height": spriteHeight
					};
				}
			}

			previewObject.sprite = sprite;

			if ( callback ) {
				callback( previewObject );
			}
		}
		img.src = previewObject.img;
	}

	function getImage (el, callback) {
		previewObject = new PreviewObject();

		previewObject.img = normalizeUrl(el.getAttribute("src"));
		// previewObject.title = el.getAttribute("title") || el.getAttribute("alt") || "";

		previewObject.color = scanForProp(el, {
			"prop": "backgroundColor",
			"onlyOneParent": true,
			"except": ["transparent", "none", "inherit", ""],
			"default": "transparent"
		});

		var img = document.createElement("img");
		img.onload = img.onerror = function ( e ) {
			var size = null;
			if ( e.type == "load" ) {
				size = { "width":this.width, "height":this.height };
			}
			
			previewObject.size = size;

			if ( callback ) {
				callback ( previewObject );
			}
		};

		img.src = previewObject.img;
	}

	function getScreenshot (el) {
		el.style.borderStyle = 'none';

		var offset = getOffset(el);
		
		// if ( offset.top == 0 || offset.left == 0) { return; }
		var style = window.getComputedStyle(el, null);

		var coords = {
			"x": Math.abs(offset.left - window.scrollX),
			"y": Math.abs(offset.top - window.scrollY),
			"width": parseInt(style.width) || null,
			"height": parseInt(style.height) || null
		};

		if ( coords.width == null || coords.height == null ) { return; }
		// send the coords of the area to extension for making a screenshot
		window.postMessage({
		"action":"takeScreenshot",
			"rect":coords
		}, "*");
	}

	function getOffset (el, offset) {

		if ( ! el ) { return offset; }

		if ( ! offset ) { 
			var offset = {"top":el.offsetTop, "left":el.offsetLeft}; 
		}
		else {
			offset.top  += el.offsetTop;
			offset.left += el.offsetLeft;
		}
		// console.log(offset);	
		return getOffset(el.offsetParent, offset);
	}


	// prop, except, onlyOneParent, default
	function scanForProp(el, attrs) {
		var iteration = 0;

		attrs.except = attrs.except || [];

		if ( attrs.onlyOneParent === undefined ) { 
			attrs.onlyOneParent = false;
		}

		var _scanForProp = function (el) {
			if ( ! el ) { return; }

			var style = window.getComputedStyle(el, null);
			if ( attrs.except.indexOf( style[attrs.prop] ) === -1 ) {
				attrs["_el"] = el;
				return style[attrs.prop];
			}
			
			if ( attrs.onlyOneParent && iteration == 1 ) { return; }

			iteration++;
			return _scanForProp(el.parentElement);
		}

		return _scanForProp(el) || attrs.default;
	}

	function doPreview (o) {
		if ( ! o.img ) { return; /*no preview*/}
		
		var canvas = document.createElement("canvas");
		canvas.style.backgroundColor = "transparent";

		var img = document.createElement("img");

		if ( o.sprite ) {
			canvas.width  = o.sprite.width;
			canvas.height = o.sprite.height;
		}
		else {
			canvas.width  = o.size.width;
			canvas.height = o.size.height;
		}

		img.onload = img.onerror = function (e) {
			if ( e.type == "load" ) {
				var ctx = canvas.getContext("2d");
				if ( ! o.sprite ) {
					ctx.drawImage(this, 0, 0, this.width, this.height);
				}
				else {
					var s = o.sprite;
					ctx.drawImage(this, s.x, s.y, s.width, s.height, 0, 0, s.width, s.height);
				}

				var el = document.getElementById("R2D2C3P0");
				// el.style.backgroundColor = o.color;
				empty(el).appendChild(canvas);
			}
		}
		img.src = o.img;

	}

	window.sendData = function () {
		if ( previewObject ) {
			window.postMessage({
				"action": "sendData",
				"data": previewObject
			}, "*");
		}

		// var canvas = document.querySelector("#R2D2C3P0 > canvas");
		// if ( canvas == null )  { return; }

		// var dataURL = canvas.toDataURL("image/png");
		// var fr = new FileReader();
		// fr.onloadend = function (e) {
		// 	console("read!!!");
		// }
		// fr.readAsDataURL(dataURL);

	}

	function empty (el) {
		if ( el.hasChildNodes() ) {
			for (var i = el.childNodes.length - 1; i >= 0; i--) {
				el.removeChild(el.childNodes[i]);
			}
		}
		return el;
	}

	function normalizeUrl (url) {
		var normalizedUrl = "";
		
		if ( ! url ) { return normalizedUrl; }

		if ( ! isUrlAbsolute(url) ) {
			var docUrl = parseUrl(document.URL);

			// relative path with lead '/'
			if ( url.indexOf("/") === 0 ) {
				normalizedUrl = docUrl.fullhostname + url;
			}
			else {
				// relative path without lead '/'
				var docPathName = docUrl.pathname;
				var finishSlashIdx = docPathName.lastIndexOf("/");
				// cut off '/fileName.*'
				if ( (finishSlashIdx + 1) !== docPathName.length ) {
					docPathName = docPathName.substr(0, finishSlashIdx + 1);
				}
				normalizedUrl = docUrl.fullhostname + docPathName + url;
			}
		}
		else {
			normalizedUrl = url;
		}

		return normalizedUrl;
	}

	function parseUrl (url) {
		var a = document.createElement("a");
		a.href = url;

		return {
			"protocol": a.protocol,
			"host": a.host,
			"fullhostname": a.protocol + "//" + a.host,
			"pathname": a.pathname
		};
	}

	function isUrlAbsolute (url) {
		return /^(http|https|ftp):\/\//.test(url);
	}

	function extractCssStyledUrl (url) {
		var regexp = /url\([\"{0,1}|\'{0,1}](.*)[\"{0,1}|\'{0,1}]\)/;
		var result = regexp.exec(url);
		return result ? result[1] || "" : "";
	}

	function getImgUrl (el) {
		return normalizeUrl(el.getAttribute("src"));
	}

	function getImgTitle (el) {
		return el.getAttribute("title") || el.getAttribute("alt") || "";
	}

	function isLeftClick(e) {
		return e.button === 0;
	}

	function isRightClick(e) {
		return e.button === 2;
	}

	function cancelEvent (e) {
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
	}

	// ===============
	// = PREVIEW BOX =
	// ===============
	function previewBox () {
		var el = document.createElement("div");
		el.setAttribute("id", "R2D2C3P0");
		document.body.appendChild(el);
	}
	// ===============

	document.addEventListener("mouseover", OnMouseOver, true);
	document.addEventListener("mouseout", OnMouseOut, true);
	document.addEventListener("click", OnClick, true);
	window.addEventListener("message", OnMessage, true);

	previewBox();
})();