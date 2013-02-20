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
};

function loadFile (fileName) {
  var xhr = new  XMLHttpRequest();
  xhr.open("GET", "chrome://devtools/content/inspector/" + fileName, false);
  xhr.send();
  return xhr.responseText;
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