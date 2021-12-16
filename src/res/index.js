require('v8-compile-cache')
const { app, BrowserWindow } = require('electron')
const path = require('path')
const electron = require('electron')
const globalShortcut = electron.globalShortcut
const fs = require('fs')

if (require('electron-squirrel-startup')) return app.quit()

let win = null
let icon = null

const STORAGE_PATH = path.resolve(__dirname, 'storage.json')

switch (process.platform) {
	case 'win32':
		icon = path.resolve(__dirname, 'assets', 'icons', 'icon.ico')
		break
	case 'darwin':
		icon = path.resolve(__dirname, 'assets', 'icons', 'icon.icns')
		break
	case 'linux':
		icon = path.resolve(__dirname, 'assets', 'icons', 'icon.png')
		break
}

const createWindow = _ => {
	win = new BrowserWindow({
		icon,
		frame: false,
		fullscreen: true,
		offscreen: false,
		backgroundColor: '#16161d',
		minWidth: 320,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	win.loadFile(path.join(__dirname, 'index.html'))

	win.once('ready-to-show', _ => {
		win.show()
	})

	globalShortcut.register('CmdOrCtrl + Alt + Y', _ => {
		win.isMinimized() ? win.show() : win.minimize()
	})

	win.on('close', _ => {
		win.destroy()
	})
}

const checkProxy = _ => {
	fs.readFile(STORAGE_PATH, 'utf-8', (error, data) => {
		if (error) throw error

		let { enableProxy, proxy } = JSON.parse(data).settings

		if (enableProxy) {
			let { protocol, host, port } = proxy
			app.commandLine.appendSwitch('proxy-server', `${protocol}://${host}:${port}`)
		}
	})
}

app.on('will-finish-launching', checkProxy)

app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
