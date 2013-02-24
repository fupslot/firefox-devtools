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

	function isPreviewBox(el) {
		return el.hasAttribute("data-r2d2c3p0");
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
	  if ( isPreviewBox(el) ) { return; }
	  // set the border around the element
		highlightBorder(el);
	}
 
	function OnMouseOut(e) {
	  if ( isPreviewBox(e.target) ) { return; }
    removeBorder(e.target);
	}

	function OnClick(e) {
	  if ( isPreviewBox(e.target) ) { return; }
		cancelEvent(e);
	  // if ( isRightClick(e) ) {}

	  if ( isLeftClick(e) ) {
	  	var el = e.target;
	  	// takes a snapshot of selected element
	  	if ( e.ctrlKey || e.altKey) {
	  		getScreenshot(el);
	  		return;
	  	}

	  	// for image
	  	if ( el.tagName === "IMG" ) {
	  		if ( imageAsSprite().checked ) {
					getBackground(el, function (bg) {
						if ( bg.error ) {
							getScreenshot( el );
						}
						else {
							doPreview( bg );
						}
					});
	  		}
	  		else {
					getImage(el, function (image) {
						// console.dir(image);
						doPreview( image );
					});
	  		}
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

		var query = {
			"prop": "backgroundImage",
			"onlyOneParent": parentLevel().checked,
			"except": ["none", "inherit", ""],
			"default": ""
		};

		var url = scanForProp(el, query);
		// console.log(url);
		if ( url == "" ) {
			if ( callback ) {
				callback({"error": "No image or sprite found"});
			}
			return;
		}

		if ( ! isDataUrl(url) ) {
			previewObject.img = normalizeUrl(extractCssStyledUrl(url));
		}
		else {
			previewObject.img = extractCssStyledUrl(url);
		}

		// seek a background-color starting from 'query._el' element
		previewObject.color = rgbToHex(scanForProp(query._el, {
			"prop": "backgroundColor",
			"onlyOneParent": false,
			"except": ["transparent", "inherit", "none", ""],
			"default": "transparent"
		}));
		
		var style = window.getComputedStyle(query._el, null);
		var arrPos = style.backgroundPosition.split(" ");
		var posX = arrPos[0];
		var posY = arrPos[1];
		var spriteWidth = parseInt(style.width);
		var spriteHeight = parseInt(style.height);

		// console.dir([posX, posY, spriteWidth, spriteHeight ]);

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
					console.log("@");
				}
			}
			console.log("#");

			previewObject.sprite = sprite;

			if ( callback ) {
				callback( previewObject );
			}
		}
		img.src = previewObject.img;
		// console.log(previewObject.img);
	}

	function getImage (el, callback) {
		previewObject = new PreviewObject();

		var src = el.getAttribute("src");
		if ( ! isDataUrl(src) ) {
			previewObject.img = normalizeUrl(src);
		}
		else {
			previewObject.img = src;
		}

		// previewObject.title = el.getAttribute("title") || el.getAttribute("alt") || "";

		previewObject.color = rgbToHex(scanForProp(el, {
			"prop": "backgroundColor",
			"onlyOneParent": parentLevel().checked,
			"except": ["transparent", "none", "inherit", ""],
			"default": "transparent"
		}));

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
		
		var paddingWidth = parseInt(style.paddingLeft) + parseInt(style.paddingRight);
		var paddingHeight = parseInt(style.paddingTop) + parseInt(style.paddingBottom);

		var coords = {
			"x": Math.abs(offset.left - window.scrollX),
			"y": Math.abs(offset.top - window.scrollY),
			"width": parseInt(style.width) + paddingWidth || null,
			"height": parseInt(style.height) + paddingHeight || null
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
		canvas.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		canvas.style.backgroundColor = o.color;

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

				var el = document.querySelector("#R2D2C3P0 #preview");
				empty(el).appendChild(canvas);
				sendButton().disabled = false;
				getColorBox().value = o.color;
			}
		}
		img.src = o.img;

	}

	window.searchByImage = function () {
		if ( previewObject ) {
			window.postMessage({
				"action": "searchByImage",
				"data": previewObject
			}, "*");
		}
	}

	// window.searchByImage = function () {

	// 	var form = document.createElement("form");
	// 	form.setAttribute("method", "POST");
	// 	form.setAttribute("action", "http://www.google.com/searchbyimage");
	// 	form.setAttribute('enctype', 'multipart/form-data');
	// 	form.setAttribute('target', '_blank');
	// 	document.body.appendChild(form);
	// 	form.submit();
	// 	document.body.removeChild(form);

	// }
	

	window.sendData = function () {
		if ( previewObject ) {
			window.postMessage({
				"action": "sendData",
				"data": previewObject
			}, "*");
			sendButton().disabled = true;
		}
		else {
			alert("Select image first");
		}
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
		// var regexp = /url\([\"|\']*(.*)[\"|\']*\)/;
		url = url.replace(/[\"|\']/g, "");
		var result = /url\((.*)\)/.exec(url);
		return result ? result[1] || "" : "";
	}

	window.rgbToHex = function (color) {
		if (color.indexOf("transparent") == 0 || color.indexOf("#") == 0) {
			return color;
		}

		var arr = /\((.*)\)/.exec(color)[1].split(",");
		var r = parseInt(arr[0])
			, g = parseInt(arr[1])
			, b = parseInt(arr[2]);

		return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}

	function parseBase64(url) {
		return url.substr(url.indexOf(","));
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

	function isDataUrl(data) {
		return /^data:image\/([a-z]{3,4})\;base64\,/.test(data);
	}

	function cancelEvent (e) {
		e.stopImmediatePropagation();
		e.preventDefault();
		e.stopPropagation();
	}

	// ===============
	// = PREVIEW BOX =
	// ===============
	function previewBox () {
		var el = document.createElement("div");
		el.setAttribute("id", "R2D2C3P0");
		el.setAttribute("data-r2d2c3p0", "r2d2c3p0");

		var preview = document.createElement("div");
		preview.id = "preview";
		preview.setAttribute("data-r2d2c3p0", "r2d2c3p0");

		var toolBar = document.createElement("div");
		toolBar.id = "toolbar";
		toolBar.setAttribute("data-r2d2c3p0", "r2d2c3p0");

		var cb1 = document.createElement("input");
		cb1.id = "imageAsSprite";
		cb1.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		cb1.setAttribute("type", "checkbox");

		var cb_label1 = document.createElement("span");
		cb_label1.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		cb_label1.innerHTML = "RIS";

		var cb = document.createElement("input");
		cb.id = "parentLevel";
		cb.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		cb.setAttribute("type", "checkbox");
		cb.setAttribute("checked", "checked");

		var cb_label = document.createElement("span");
		cb_label.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		cb_label.innerHTML = "1 level";

		var colorBox = document.createElement("input");
		colorBox.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		colorBox.setAttribute("type", "text");
		colorBox.addEventListener("change", function(e) {
			changeBgColor(e.currentTarget.value);
		}, false);

		var btn = document.createElement("input");
		btn.setAttribute("id", "r2d2c3p0-send");
		btn.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		btn.setAttribute("type", "button");
		btn.setAttribute("value", "Save");
		btn.disabled = true;
		btn.addEventListener("click", function () {
			sendData();
		}, false);

		var btn1 = document.createElement("input");
		btn1.id = "r2d2c3p0-activate";
		btn1.setAttribute("data-r2d2c3p0", "r2d2c3p0");
		btn1.setAttribute("type", "button");
		btn1.setAttribute("value", "A");
		btn1.style.backgroundColor = "blue";
		
		btn1.addEventListener("click", function(e){
			if ( activated ) {
				deactivate();
				e.currentTarget.value = "D";
				btn1.style.backgroundColor = "red";
			}
			else {
				activate();
				e.currentTarget.value = "A";
				btn1.style.backgroundColor = "blue";
			}
			console.log(activated);
			activated = !activated;
		}, false);

		toolBar.appendChild(cb1);
		toolBar.appendChild(cb_label1);
		toolBar.appendChild(cb);
		toolBar.appendChild(cb_label);
		toolBar.appendChild(colorBox);
		toolBar.appendChild(btn);
		toolBar.appendChild(btn1);

		el.appendChild(preview);
		el.appendChild(toolBar);
		document.body.appendChild(el);
	}

	function changeBgColor(color) {
		if ( color.indexOf("#") == 0 ) {
			if ( previewObject ) {
				previewObject.color = color;
				var canvas = getCanvas();
				if ( canvas ) {
					canvas.style.backgroundColor = color;
				}
			}
		}
	}

	function getColorBox() {
		return document.querySelector("#R2D2C3P0 input[type=\"text\"]");
	}
		

	function getCanvas() {
		return document.querySelector("#R2D2C3P0 canvas");
	}

	function sendButton() {
		return document.querySelector("#R2D2C3P0 #r2d2c3p0-send");
	}

	function parentLevel() {
		return document.querySelector("#R2D2C3P0 #parentLevel");
	}

	function imageAsSprite() {
		return document.querySelector("#R2D2C3P0 #imageAsSprite");
	}
	// ===============

	window.addEventListener("message", OnMessage, true);

	var activated = true;

	function activate() {
		document.addEventListener("mouseover", OnMouseOver, true);
		document.addEventListener("mouseout", OnMouseOut, true);
		document.addEventListener("click", OnClick, true);
	}

	function deactivate() {
		document.removeEventListener("mouseover", OnMouseOver, true);
		document.removeEventListener("mouseout", OnMouseOut, true);
		document.removeEventListener("click", OnClick, true);
	}

	activate();
	previewBox();
})();