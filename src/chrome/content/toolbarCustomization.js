(function () {
	// =========================
	// = TOOLBAR CUSTOMIZATION =
	// =========================
	var prefs = Components.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefBranch);

	if ( ! prefs.getBoolPref("firefox-devtools.toolbarCustomizationDone") ) {
		prefs.setBoolPref("firefox-devtools.toolbarCustomizationDone", true);
		// =======================
		// = NAV-BAR DEFAULT SET =
		// =======================
		var insertBefore = "";
		var btnId = "browser-restart-button";
		var navBar = document.getElementById("nav-bar");
		var dset = navBar.getAttribute("defaultset").split(",");

		var at = dset.indexOf(insertBefore);
		at = at == -1 ? at = dset.length : at;

		dset.splice(at, 0, btnId);

		navBar.setAttribute("defaultset", dset.join(","));
		// =======================

		// =======================
		// = NAV-BAR CURRENT SET =
		// =======================
		if ( navBar.hasAttribute("currentset") ) {
			var cset = navBar.getAttribute("currentset").split(",");

			at = cset.indexOf(insertBefore);
			at = at == -1 ? at = cset.length : at;
			cset.splice(at, 0, btnId);

			navBar.setAttribute("currentset", cset.join(","));
		}
		else {
			// add 'currentset' attribute, if it's not exist
			navBar.setAttribute("currentset", dset.join(","));
			navBar.ownerDocument.persist("nav-bar", "currentset");
		}
		// =======================
	}
})();