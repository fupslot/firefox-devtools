function startUp() {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefService);
                prefs = prefs.getBranch("chromedit.");

    var lastTab = prefs.getIntPref("lasttabopen", 1);
    document.getElementById("tabbox").selectedIndex = lastTab - 1;

    var showhidepreftab = prefs.getBoolPref("hideprefstab");
    document.getElementById("prefTab").collapsed = showhidepreftab;

    var styleall = prefs.getCharPref("styles");
    var editStyleOne = document.getElementById("editChrome");
    editStyleOne.setAttribute("style", styleall);
    var editStyleTwo = document.getElementById("editContent");
    editStyleTwo.setAttribute("style", styleall);
    var editStyleThree = document.getElementById("editJs");
    editStyleThree.setAttribute("style", styleall);
    var editStyleFour = document.getElementById("editprefs");
    editStyleFour.setAttribute("style", styleall);

    loadIt('userChrome.css','editChrome');
    loadIt('userContent.css','editContent');
    loadIt('user.js','editJs');
    loadIt('prefs.js','editprefs');

    createCEPChromeFolderTB();

    createCEPChromeFolderMF();

}

function createCEPChromeFolderTB() {
    if(navigator.userAgent.search(/Thunderbird/gi) >= 0) {
    var file = Components.classes["@mozilla.org/file/directory_service;1"].
                     getService(Components.interfaces.nsIProperties).
                     get("ProfD", Components.interfaces.nsIFile);
    file.append("chrome");
    if( !file.exists() || !file.isDirectory() ) {
    file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
     }
   }
}
function createCEPChromeFolderMF() {
    if(navigator.userAgent.search(/Firefox/gi) >= 0) {
    var file = Components.classes["@mozilla.org/file/directory_service;1"].
                     getService(Components.interfaces.nsIProperties).
                     get("ProfD", Components.interfaces.nsIFile);
    file.append("chrome");
    if( !file.exists() || !file.isDirectory() ) {
    file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
     }
   }
}

function getTextareaText(tNodeID) {
    var tat = document.getElementById(tNodeID).value;
    return tat;
}

function setTextareaText(thetext,tNodeID) {
    document.getElementById(tNodeID).value= thetext;
}

  function getChromeDir(fileName) {
    var thisDir;
    var thisPath;
    var dirLocator = Components.classes["@mozilla.org/file/directory_service;1"]
            .getService(Components.interfaces.nsIProperties);
    if (/css$/i.test(fileName))
    {
      thisPath = "UChrm";
    } else {
      thisPath = "ProfD";
    }
    thisDir = dirLocator.get(thisPath, Components.interfaces.nsIFile).path;
    return thisDir;
  }

function loadIt(fileName,targetNodeID) {
    var chromeDir = getChromeDir(fileName);
    var fName = fileName;
    var stuff;
    var fileLocal = Components.classes["@mozilla.org/file/local;1"]
                             .createInstance(Components.interfaces.nsILocalFile);
    fileLocal.initWithPath(chromeDir);
    fileLocal.append(fName);
    var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
        .createInstance( Components.interfaces.nsIFileInputStream );
    var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
      .createInstance( Components.interfaces.nsIScriptableInputStream );
      if (fileLocal.exists()) {
        var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                                  .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
        converter.charset = "UTF-8";
        is.init(fileLocal,0x01, 00004, null);
        sis.init(is);
        stuff = sis.read(sis.available());
        stuff = converter.ConvertToUnicode(stuff);
        setTextareaText(stuff, targetNodeID);
    }
    else if (/css$/i.test(fName) ) {
        fName = fName.replace('.css', '-example.css');
        fileLocal.initWithPath(chromeDir);
        fileLocal.append(fName);
        if (fileLocal.exists()) {
            is.init( fileLocal,0x01, 00004, null);
            sis.init( is );
            var stuff = sis.read( sis.available() );
            setTextareaText(stuff,targetNodeID);
        }
    }
}

function saveIfChanged() {
     var saveTheChange = Components.classes["@mozilla.org/preferences-service;1"].
                    getService(Components.interfaces.nsIPrefBranch);
     var alwaysDoIt = saveTheChange.getBoolPref("chromedit.saveifchanged");
    if (alwaysDoIt) {
      saveIt('userChrome.css','editChrome');
      saveIt('userContent.css','editContent');
      saveIt('user.js','editJs');
    }
}

function saveIt(fileName,targetNodeID,button) {
    var data = getTextareaText(targetNodeID);
    data = convertUnicodeToUTF8(data);
    var chromeDir = getChromeDir(fileName);
    var fName = fileName;
    try {
        var fileLocal = Components.classes["@mozilla.org/file/local;1"]
                                 .createInstance(Components.interfaces.nsILocalFile);
        fileLocal.initWithPath(chromeDir);
        fileLocal.append(fName);
        var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
            .createInstance( Components.interfaces.nsIFileOutputStream );
        outputStream.init( fileLocal, 0x04 | 0x08 | 0x20, 420, 0 );
        var result = outputStream.write( data, data.length );
        outputStream.close();
        document.getElementById(button).setAttribute("disabled", "true");
    }
    catch (ex) {
    }
}

function openCEPOptions() {
window.openDialog("chrome://chromedit/content/CEPOptions.xul", "_blank","chrome,modal,centerscreen,resizable=no");
}

// create the user.js file on first run
var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
file.append("user.js");
if( !file.exists() ) {
file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
}

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
}

function convertUnicodeToUTF8(thisStr) {
  	var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
  	                  .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  	converter.charset = "UTF-8";
  	var thisUTF = converter.ConvertFromUnicode(thisStr);
  	var fin = converter.Finish();
  	if(fin.length > 0) {
  		return thisUTF + fin;
  	} else {
  		return thisUTF;
  	}
  }

var cepFolders = {
  myLocalFile: Components.interfaces.nsILocalFile,
  loadExternalURL: function(url) {
    if (url) {
      var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                                .getService(Components.interfaces.nsIIOService);
      var uri = ioService.newURI(url, null, null);
      var extProtocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                                     .getService(Components.interfaces.nsIExternalProtocolService);
      extProtocolSvc.loadUrl(uri);
    }
  },
  getURLSpecFromFile: function (file) {
    var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                   .getService(Components.interfaces.nsIIOService);
    var fph = ioServ.getProtocolHandler("file")
                .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
    return fph.getURLSpecFromFile(file);
  },
	getLocalFileInterface: function(filePath) {
		try {
			var localFileInterface = Components.classes["@mozilla.org/file/local;1"].createInstance(cepFolders.myLocalFile);
			localFileInterface.initWithPath(filePath);
			return localFileInterface;
		} catch (ex) {
			return null;
		}
	},
  getSpecialFolder: function(aFolderType) {
		var directoryService = Components.classes['@mozilla.org/file/directory_service;1']
                             .getService(Components.interfaces.nsIProperties);

		var thisDirectory = directoryService.get(aFolderType, Components.interfaces.nsIFile);

		return thisDirectory;
  },
  getSpecialFolderPath: function(aFolder) {
		return cepFolders.getSpecialFolder(aFolder).path;
  },
	openDirectory: function(directory) {
    var iDirectory = this.getLocalFileInterface(directory);
	  try {
		  iDirectory.reveal();
		} catch (ex) {
      //cepFolders.loadExternalURL(directory);
      var uri = Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService)
                          .newFileURI(iDirectory);
      var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                                  .getService(Components.interfaces.nsIExternalProtocolService);
      protocolSvc.loadUrl(uri);

    }
	},
	openSpecialFolder: function(aFolderType) {
    if (!aFolderType) {
       aFolderType = 'ProfD';
    }
    var extDir = cepFolders.getSpecialFolderPath(aFolderType);
    cepFolders.openDirectory(extDir)
	}
}
