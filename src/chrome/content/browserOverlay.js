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


// writes a selected profile name on a top orange button
(function(){
	var profiles = Cc["@mozilla.org/toolkit/profile-service;1"]
    .createInstance(Ci.nsIToolkitProfileService);

	var profileName = profiles.selectedProfile.name;

	var appButton = document.getElementById("appmenu-button");
	appButton.setAttribute("label", "FireFox [" + profileName+"]");
})();