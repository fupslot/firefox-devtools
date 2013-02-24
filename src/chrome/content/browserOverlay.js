

function restartFireFox() {
	const nsIAppStartup = Components.interfaces.nsIAppStartup;
  var os = Components.classes["@mozilla.org/observer-service;1"]
                     .getService(Components.interfaces.nsIObserverService);
  var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"]
                             .createInstance(Components.interfaces.nsISupportsPRBool);
  os.notifyObservers(cancelQuit, "quit-application-requested", null);
  if (cancelQuit.data)
    return;
  os.notifyObservers(null, "quit-application-granted", null);
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var windows = wm.getEnumerator(null);
  while (windows.hasMoreElements()) {
    var win = windows.getNext();
    if (("tryToClose" in win) && !win.tryToClose())
      return;
  }
  Components.classes["@mozilla.org/toolkit/app-startup;1"].getService(nsIAppStartup)
            .quit(nsIAppStartup.eRestart | nsIAppStartup.eAttemptQuit);	
};

function inspector_splash_screen(doc) {
  var el = doc.createElement("div");
  el.setAttribute("id", "2A-splash-screen");

  var body = doc.getElementsByTagName("body")[0];
  if ( body ) {
    body.appendChild(el);
  }
}

function embedScripts () {
  var prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefBranch);
  var host = prefs.getCharPref("firefox-devtools.inspector.host");

  var doc = top.window.content.document;
  // prevent double code injection
  if ( doc.getElementById("dom-inspector") !== null ) { return; }

  var css = $element(doc, {
    "tagName": "style",
    "id": "dom-inspector-css",
    "content": loadFile("main.css")
  });
  injectScript(doc, css);
  css = null;

  var script = $element(doc, {
    "tagName": "script",
    "id": "dom-inspector",
    "content": loadFile("main.js")
  });
  injectScript(doc, script);
  script = null;

  top.window.content.addEventListener("message", OnMessage, false);
};


function OnMessage (e) {
	if (e.data.action == "takeScreenshot") {
		cropArea(e.data.rect);
	}
	
	if (e.data.action == "sendData") {
		sendData(e.data.data);
	}

	if (e.data.action == "searchByImage") {
		searchByImage(e.data.data);
	}
}

function cropArea (rect) {
		// var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
		var win = gBrowser.contentWindow;
		// var doc = Services.appShell.hiddenDOMWindow.document;

		var canvas = createCanvas();
		canvas.width = win.outerWidth;
		canvas.height = win.outerHeight;

		// Cu.reportError(JSON.stringify(rect));
		// var canvas = top.window.content.createElement("canvas");
		var ctx = canvas.getContext("2d");
		ctx.drawWindow(win, 0, 0, win.outerWidth, win.outerHeight, "transparent");

		// prevent border collisions
		if (rect.x + rect.width > win.outerWidth) {rect.width = win.outerWidth - rect.x;}
		if (rect.y + rect.height > win.outerHeight) {rect.height = win.outerHeight - rect.y;}

		var imageData = ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
		ctx = null;

		canvas.width = rect.width;
		canvas.height = rect.height;
		
		var ctx = canvas.getContext("2d");
		ctx.putImageData(imageData, 0, 0);
		ctx = null;
		// ctx.drawWindow(top.window.content, 0, 0, area.width, area.height, 0, 0, area.width, area.height);
		
		var o = {};
		o.img = canvas.toDataURL();
		o.size = {"width": rect.width, "height": rect.height};

		// Cu.reportError(canvas.toDataURL());
		// send image data back to a page
		top.window.content.postMessage({"action":"showScreenshot", "image":o}, "*");
}

function sendData (data) {
	var sendRequest = function(requestData) {
	  var xhr = new  XMLHttpRequest();
	  xhr.open("POST", "http://localhost:8080/inspector/");
	  xhr.send(requestData);
	};

	var formData = function (data) {
		var formData = new FormData();
		formData.append("title", data.title);
		formData.append("url", data.url);
		formData.append("color", data.color)
		formData.append("image", data.img);
		return formData;
	};
	if ( ! isDataUrl( data.img ) ) {
		getDataUrl(data, function (dataUrl) {
			data.img = dataUrl;

			sendRequest( formData( data ) );
		});
	}
	else {
		sendRequest( formData( data ) );
	}
}

function searchByImage (data) {
	var _searchByImage = function (data) {
		var formData = new FormData();
		formData.append("image_content", data.img);
		formData.append("filename", "");
		formData.append("image_url", "")

	  var xhr = new  XMLHttpRequest();
	  xhr.open("POST", "http://www.google.com/searchbyimage/upload/");
	  xhr.onreadystatechange = function () {
	  	Cu.reportError(xhr.status);
	  	Cu.reportError(xhr.getAllResponseHeaders());
	  }
	  xhr.send(formData);
	}

	if ( ! isDataUrl( data.img ) ) {
		getDataUrl(data.img, function (dataUrl) {
			data.img = dataUrl;
			_searchByImage( data );
		});
	}
	else {
		_searchByImage( data );
	}
}

function getDataUrl (o, callback) {
	var img = createImage();
	img.onload = img.onerror = function (e) {
		if ( e.type === "load") {
			var c = createCanvas();

			if ( o.sprite ) {
				c.width  = o.sprite.width;
				c.height = o.sprite.height;
			}
			else {
				c.width  = o.size.width;
				c.height = o.size.height;
			}

			var ctx = c.getContext("2d");
			if ( ! o.sprite ) {
				ctx.drawImage(this, 0, 0, this.width, this.height);
			}
			else {
				var s = o.sprite;
				ctx.drawImage(this, s.x, s.y, s.width, s.height, 0, 0, s.width, s.height);
			}
			callback(c.toDataURL());
		}
	};
	img.src = o.img;
}


function createCanvas() {
	var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
	var doc = Services.appShell.hiddenDOMWindow.document;

	return doc.createElementNS(HTML_NAMESPACE, "canvas");
}

function createImage() {
	var HTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
	var doc = Services.appShell.hiddenDOMWindow.document;

	return doc.createElementNS(HTML_NAMESPACE, "img");
}

function loadFile (fileName) {
  var xhr = new  XMLHttpRequest();
  xhr.open("GET", "chrome://devtools/content/inspector/" + fileName, false);
  xhr.send();
  return xhr.responseText;
}

function isDataUrl(data) {
	return /^data:image\/([a-z]{3,4})\;base64\,/.test(data);
}

function injectScript (doc, el) {
  var head = doc.getElementsByTagName("head")[0];
  if ( head ) {
    head.appendChild(el);
  }
  else {
    doc.appendChild(el);
  }
}

function $element (doc, attrs) {
  var el = doc.createElement(attrs.tagName);
  el.id = attrs.id;

  if ( attrs.tagName === "script") {
    el.setAttribute("type", "text/javascript");
  }
  if ( attrs.tagName === "style") {
    el.setAttribute("type", "text/css");
    // el.setAttribute("rel", "stylesheet");
  }
  el.innerHTML = attrs.content;
  return el;
}


// writes a selected profile name on a top orange button
(function(){
	var profiles = Cc["@mozilla.org/toolkit/profile-service;1"]
    .createInstance(Ci.nsIToolkitProfileService);

	var profileName = profiles.selectedProfile.name;

	var appButton = document.getElementById("appmenu-button");
	appButton.setAttribute("label", "FireFox [" + profileName+"]");
})();