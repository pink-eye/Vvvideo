require('v8-compile-cache')
const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const fs = require('fs')

if (require('electron-squirrel-startup')) app.quit()

let mainWindow = null

const STORAGE_PATH = path.resolve(__dirname, 'storage.json')

const getIconByPlatform = () => {
	switch (process.platform) {
		case 'win32':
			return path.resolve(__dirname, '..', 'assets', 'icons', 'icon.ico')

		case 'darwin':
			return path.resolve(__dirname, '..', 'assets', 'icons', 'icon.icns')

		case 'linux':
			return path.resolve(__dirname, '..', 'assets', 'icons', 'icon.png')
	}
}

const handleReadyToShow = () => {
	mainWindow.show()
	mainWindow.focus()
}

const createWindow = _ => {
	const icon = getIconByPlatform()

	mainWindow = new BrowserWindow({
		icon,
		frame: false,
		fullscreen: true,
		offscreen: false,
		show: false,
		backgroundColor: '#16161d',
		minWidth: 320,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	mainWindow.loadFile(path.join(__dirname, 'index.html'))

	mainWindow.once('ready-to-show', handleReadyToShow)

	globalShortcut.register('CmdOrCtrl + Alt + Y', _ =>
		mainWindow.isMinimized() ? mainWindow.show() : mainWindow.minimize()
	)

	mainWindow.on('close', _ => mainWindow.destroy())
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
