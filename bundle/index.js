require("v8-compile-cache");const{app:app,BrowserWindow:BrowserWindow,globalShortcut:globalShortcut}=require("electron"),path=require("path"),fs=require("fs");require("electron-squirrel-startup")&&app.quit();let mainWindow=null;const STORAGE_PATH=path.resolve(__dirname,"storage.json"),getIconByPlatform=()=>{switch(process.platform){case"win32":return path.resolve(__dirname,"..","assets","icons","icon.ico");case"darwin":return path.resolve(__dirname,"..","assets","icons","icon.icns");case"linux":return path.resolve(__dirname,"..","assets","icons","icon.png")}},handleReadyToShow=()=>{mainWindow.show(),mainWindow.focus()},createWindow=()=>{const e=getIconByPlatform();mainWindow=new BrowserWindow({icon:e,frame:!1,fullscreen:!0,offscreen:!1,show:!1,backgroundColor:"#16161d",minWidth:320,webPreferences:{preload:path.join(__dirname,"preload.js")}}),mainWindow.loadFile(path.join(__dirname,"index.html")),mainWindow.once("ready-to-show",handleReadyToShow),globalShortcut.register("CmdOrCtrl + Alt + Y",(()=>mainWindow.isMinimized()?mainWindow.show():mainWindow.minimize())),mainWindow.on("close",(()=>mainWindow.destroy()))},checkProxy=()=>{fs.readFile(STORAGE_PATH,"utf-8",((e,o)=>{if(e)throw e;const{enableProxy:n,proxy:i}=JSON.parse(o).settings;if(!n)return;const{protocol:r,host:a,port:t}=i;app.commandLine.appendSwitch("proxy-server",`${r}://${a}:${t}`)}))};app.on("will-finish-launching",checkProxy),app.whenReady().then((()=>{createWindow(),app.on("activate",(()=>{0===BrowserWindow.getAllWindows().length&&createWindow()}))})),app.on("window-all-closed",(()=>{"darwin"!==process.platform&&app.quit()}));