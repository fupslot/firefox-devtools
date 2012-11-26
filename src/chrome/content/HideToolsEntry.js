var chromedit = {
	init:function(e){
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		if (prefs.getBoolPref('chromedit.hidetoolsmenu')){
			document.getElementById("chromeditplus-menu").hidden = true;
		}
		chromeditPrefObserver.register();
	},
}

var chromeditPrefObserver = {
	register: function(){
		var prefService = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
		this._branch = prefService.getBranch("chromedit.");
		this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this._branch.addObserver("", this, false);
	},

	unregister: function(){
		if(!this._branch) return;
		this._branch.removeObserver("", this);
	},

	observe: function(aSubject, aTopic, aData){
		if(aTopic != "nsPref:changed") return;
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		switch (aData) {
			case "hidetoolsmenu":
	document.getElementById("chromeditplus-menu").hidden=(prefs.getBoolPref('chromedit.hidetoolsmenu'))?true:"";
				break;
		}
	} 
}
window.addEventListener("load", chromedit.init, false);
