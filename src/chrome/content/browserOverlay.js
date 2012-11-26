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


var addonInstallListener = {
	onNewInstall: function(aAddon) { Cu.reportError(aAddon.name); },
	onDownloadStarted: function(aAddon) { Cu.reportError(aAddon.name); },
	onDownloadProgress: function(aAddon) { Cu.reportError(aAddon.name); },
	onDownloadEnded: function(aAddon) { Cu.reportError(aAddon.name); },
	onDownloadCancelled: function(aAddon) { Cu.reportError(aAddon.name); },
	onDownloadFailed: function(aAddon) { Cu.reportError(aAddon.name); },
	onInstallStarted: function(aAddon) { Cu.reportError(aAddon.name); },
	onInstallEnded: function(aAddonInstall, aAddon) { Cu.reportError(aAddon.name); },
	onInstallCancelled: function(aAddon) { Cu.reportError(aAddon.name); },
	onInstallFailed: function(aAddon) { Cu.reportError(aAddon.name); },
	onExternalInstall: function(aAddonInstall, aAddon, aNeedRestart) {}
};


var addonListerner1 = {
	onEnabling: function(aAddon, aNeedRestart) { Cu.reportError(aAddon.name); },
	onEnabled: function(aAddon) { Cu.reportError(aAddon.name); },
	onDisabling: function(aAddon, aNeedRestart) { Cu.reportError(aAddon.name); },
	onDisabled: function(aAddon) { Cu.reportError(aAddon.name); },
	onInstalling: function(aAddon, aNeedRestart) { 
		Cu.reportError(aAddon.name); 
	},
	onInstalled: function(aAddon) {
		// for boostrap only 
		Cu.reportError(aAddon.name);
	},
	onUninstalling: function(aAddon, aNeedRestart) { Cu.reportError(aAddon.name); },
	onUninstalled: function(aAddon) { Cu.reportError(aAddon.name); },
	onOperationCancelled: function(aAddon) { Cu.reportError(aAddon.name); },
	onPropertyChanged: function(aAddon, aProperties) { Cu.reportError(aAddon.name); }
};

window.addEventListener("load",   function(){ 
	AddonManager.addAddonListener(addonListerner1);
	AddonManager.addInstallListener(addonInstallListener);
}, false); 
window.addEventListener("unload", function(){
	AddonManager.removeAddonListener(addonListerner1); 
	AddonManager.removeInstallListener(addonInstallListener);
}, false);