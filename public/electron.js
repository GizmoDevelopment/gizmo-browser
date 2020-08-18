// Modules
const { app, BrowserWindow, BrowserView, ipcMain, Notification } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const isDev = require("electron-is-dev");

// Variables
var win;
const settings = {
    themeColor: "#a31ffc"
};

function createWindow () { 

    autoUpdater.checkForUpdatesAndNotify();

    win = new BrowserWindow({
        title: "Gizmo Browser",
        width: 1000,
        height: 600,
        minWidth: 600,
        minHeight: 400,
        useContentSize: true,
        frame: false,
        backgroundColor: "#222222",
        webPreferences: {
            nodeIntegration: true
        }
    });

    if (isDev) {
        win.loadURL("http://localhost:3000");
    } else {
        win.loadFile(path.join(__dirname, "../", "build", "index.html"));
    }

    win.on("maximize", () => {
        win.webContents.send("windowRenderer", { type: "maximize" });
    });

    win.on("unmaximize", () => {
        win.webContents.send("windowRenderer", { type: "unmaximize" });
    });

}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on("pageManager", (event, data) => {
    switch (data.type) {
        case "query": // Pings TabManager to get focused tab

            event.reply("tabRenderer", { ...data, type: "getFocusedTabForQuery" });

            break;
        case "finalQuery": // Ping from Tab Manager with focused tab to continue querying

            if (data.hasOwnProperty("tabId") && data.hasOwnProperty("query")) {
                BrowserView.fromId(data.tabId).webContents.loadURL(data.query);
            }

            break;
        default:
    }
});

ipcMain.on("windowManager", (event, data) => {
    switch (data.type) {
        case "minimize":

            win.minimize();

            break;
        case "maximize":

            win.maximize();

            break;
        case "unmaximize":

            win.unmaximize();

            break;
        case "close":

            win.close();

            break;
        default:
    }
})

ipcMain.on("tabManager", (event, data) => {

    /**
     * TabManager will always only receive the tab ID,
     * unless it's getting created
     */

    switch (data.type) {
        case "reload":
            
            for (const view of BrowserView.getAllViews()) {
                view.destroy();
            }
        
            break;
        case "create":

            const [ w, h ] = win.getSize(),
                view = new BrowserView();

            view.setBounds({
                x: 0,
                y: 72,
                width: w + 2,
                height: h - 71
            });

            view.setAutoResize({
                width: true,
                height: true,
                horizontal: true
            });

            view.webContents.on("page-title-updated", (_, title) => {

                // Return basic metadata to tab
                event.reply("tabRenderer", {
                    type: "tabMetadata",
                    tabId: view.id,
                    metadata: {
                        title: title,
                        url: view.webContents.getURL()
                    },
                });

                // Send full URL to searchbar
                event.reply("searchbarRenderer", {
                    type: "setQuery",
                    query: view.webContents.getURL()
                });

                // Toggle back/forward navigation buttons
                event.reply("navigationRenderer", { type: "refresh", data: {
                    canGoBack: view.webContents.canGoBack(),
                    canGoForward: view.webContents.canGoForward()
                } });

            });

            view.webContents.on("did-stop-loading", () => {

                // Toggle back/forward navigation buttons
                event.reply("navigationRenderer", { type: "refresh", data: {
                    canGoBack: view.webContents.canGoBack(),
                    canGoForward: view.webContents.canGoForward()
                } });

            });

            /*
                view.webContents.on("did-change-theme-color", (_, color) => {
                    event.reply("settingsRenderer", { type: "themeColor", color: color || "#a31ffc", tabId: view.id });
                });
            */

            view.webContents.on("page-favicon-updated", (_, favicons) => {
                event.reply("tabRenderer", { type: "tabMetadata", tabId: view.id, metadata: {
                    favicon: favicons[0]
                } });
            });

            view.webContents.on("new-window", (event) => {
                event.preventDefault(); // Prevent pop-up windows
            });

            win.addBrowserView(view);   
            event.reply("tabRenderer", { type: "create", tabId: view.id });

            if (typeof data === "object") {
                if (data.query) {
                    view.webContents.loadURL(data.query);
                }
            }

            if (win.getBrowserViews().length === 1) {
                event.reply("tabRenderer", { type: "bounceBack", msg: "tabManager", _type: "focus", tabId: view.id });
            }

            break;
        case "remove":
        
            if (data.hasOwnProperty("tabId")) {

                const view = BrowserView.fromId(data.tabId);

                if (view instanceof BrowserView) {

                    win.removeBrowserView(view); // Prevents random crashes (?)
                    view.destroy();
                
                    event.reply("tabRenderer", { type: "remove", tabId: data.tabId });
                }

                /*
                    if (win.getBrowserViews().length === 0) {
                        event.reply("settingsRenderer", { type: "themeColor", color: "#a31ffc" });
                    }
                */
            }

            break;
        case "focus":

            if (data.hasOwnProperty("tabId")) {

                const view = BrowserView.fromId(data.tabId);

                if (view instanceof BrowserView) {

                    win.setBrowserView(view);
                    event.reply("tabRenderer", {
                        type: "focus",
                        tabId: data.tabId
                    });

                    // Send full URL back to searchbar
                    event.reply("searchbarRenderer", {
                        type: "setQuery",
                        query: view.webContents.getURL() || ""
                    });

                    // Toggle back/forward navigation buttons
                    event.reply("navigationRenderer", { type: "refresh", data: {
                        canGoBack: view.webContents.canGoBack(),
                        canGoForward: view.webContents.canGoForward()
                    } });

                    /*
                        // Aply page theme color
                        event.reply("settingsRenderer", { type: "themeColor", color: (
                            data.hasOwnProperty("data") ? data.data.themeColor : "#a31ffc"
                        ), tabId: view.id });
                    */
                }
            }

            break;
        default:
    }
})

ipcMain.on("navigationManager", (event, data) => {

    const view = win.getBrowserView();

    if (view instanceof BrowserView) {
        switch (data.type) {
            case "goBack":

                view.webContents.goBack();

                break;
            case "reload":

                view.webContents.reload();

                break;
            case "goForward":

                view.webContents.goForward();

                break;
            default:
        }
    }
});

ipcMain.on("settingManager", (event, data) => {
    switch (data.type) {
        case "themeColor":

            settings.themeColor = data.value;
            event.reply("settingsRenderer", { type: "themeColor", value: data.value || "#a31ffc" });

            break;
        default:
    }
});

function sendToast (title, body) {

    const toast = new Notification({
        title,
        body,
        icon: path.join(__dirname, "../", "assets", "icons", "png", "icon_installer.png")
    });

    toast.show();
}

autoUpdater.on("update-available", () => {
    sendToast("New update available!", "Gizmo Browser will automatically download it in the background.");
});

autoUpdater.on("download-progress", ({ percent }) => {
    if (win && win instanceof BrowserWindow) {
        win.setProgressBar(percent / 100);
    }
});

autoUpdater.on("error", (err) => {
    sendToast("An error has occurred!", "Please check the DevConsole (Ctrl+Shift+I) for any errors.");
    throw Error(err);
});

autoUpdater.on("update-downloaded", () => {

    sendToast("Update is ready!", "The application will automatically restart in 10 seconds to apply the update.");
    
    if (win && win instanceof BrowserWindow) {
        win.setProgressBar(0);
    }

    setTimeout(() => {
        autoUpdater.quitAndInstall();
    }, 10000);
});