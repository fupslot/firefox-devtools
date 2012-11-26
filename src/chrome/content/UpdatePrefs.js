var ChromEditPlus_PrefObserver =
{
  register: function()
  {
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService);
    this._branch = prefService.getBranch("chromedit.");
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
    this._branch.addObserver("", this, false);
  },
  unregister: function()
  {
    if(!this._branch) return;
    this._branch.removeObserver("", this);
  },
  observe: function(aSubject, aTopic, aData)
  {
    if(aTopic != "nsPref:changed") return;
    switch (aData) {
      case "styles":
    var styleall = getPref("chromedit.styles");
    var editStyleOne = document.getElementById("editChrome");
    editStyleOne.setAttribute("style", styleall);
    var editStyleTwo = document.getElementById("editContent");
    editStyleTwo.setAttribute("style", styleall);
    var editStyleThree = document.getElementById("editJs");
    editStyleThree.setAttribute("style", styleall);
    var editStyleFour = document.getElementById("editprefs");
    editStyleFour.setAttribute("style", styleall);
        break;
    }
  }
}
ChromEditPlus_PrefObserver.register();
