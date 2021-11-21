const { app, BrowserWindow } = require('electron'),
	path = require('path'),
	electron = require('electron'),
	globalShortcut = electron.globalShortcut,
	fs = require('fs')

if (require('electron-squirrel-startup')) app.quit()

let win = null

const STORAGE_PATH = `${__dirname}\\storage.json`
const ICONS_PATH = `assets\\icons`

let icon = null
switch (process.platform) {
	case 'win32':
		icon = path.resolve(__dirname, ICONS_PATH, 'icon.ico')
		break
	case 'darwin':
		icon = path.resolve(__dirname, ICONS_PATH, 'icon.icns')
		break
	case 'linux':
		icon = path.resolve(__dirname, ICONS_PATH, 'icon.png')
		break
}

const createWindow = _ => {
	win = new BrowserWindow({
		icon,
		frame: false,
		fullscreen: true,
		offscreen: false,
		contextIsolation: true,
		enableRemoteModule: false,
		backgroundColor: '#d0257a',
		minWidth: 320,
		webPreferences: {
			preload: `${__dirname}\\preload.js`,
			show: false,
			devTools: true,
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
	try {
		let data = fs.readFileSync(STORAGE_PATH, 'utf-8')
		let storage = JSON.parse(data)

		if (storage.settings.enableProxy) {
			let proxy = storage.settings.proxy
			app.commandLine.appendSwitch('proxy-server', `${proxy.protocol}://${proxy.host}:${proxy.port}`)
		}
	} catch (error) {
		console.log(error)
	}
}

app.on('will-finish-launching', checkProxy)

app.on('ready', createWindow)
