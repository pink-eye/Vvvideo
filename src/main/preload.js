const { contextBridge, shell, ipcRenderer } = require('electron')
const ytch = require('yt-channel-info')
const ytpl = require('ytpl')
const ytsr = require('ytsr')
const ytdl = require('ytdl-core')
const youtubeSuggest = require('youtube-suggest')
const ytrend = require('@freetube/yt-trending-scraper')
const { SponsorBlock } = require('sponsorblock-api')
const SocksProxyAgent = require('socks-proxy-agent')
const HttpProxyAgent = require('http-proxy-agent')
const HttpsProxyAgent = require('https-proxy-agent')
const fs = require('fs')
const path = require('path')
const https = require('https')

const STORAGE_PATH = path.resolve(__dirname, 'storage.json')

const makeAgent = obj => {
	switch (obj.protocol) {
		case 'http':
			return new HttpProxyAgent({
				host: obj.host,
				port: obj.port,
			})

		case 'https':
			return new HttpsProxyAgent({
				host: obj.host,
				port: obj.port,
			})

		case 'socks4':
			return new SocksProxyAgent({
				host: obj.host,
				port: obj.port,
				type: 4,
			})

		case 'socks5':
			return new SocksProxyAgent({
				host: obj.host,
				port: obj.port,
				type: 5,
			})
	}
}

contextBridge.exposeInMainWorld('API', {
	scrapeVideo: videoId => ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`),

	scrapeVideoProxy: (videoId, obj) =>
		ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`, {
			requestOptions: { agent: makeAgent(obj) },
		}),

	scrapeChannelInfo: channelId => ytch.getChannelInfo(channelId, 0),

	scrapeChannelVideos: channelId => ytch.getChannelVideos(channelId, 'latest', 0),

	scrapeChannelPlaylists: channelId => ytch.getChannelPlaylistInfo(channelId, 'last', 0),

	scrapeVideosMore: continuation => ytch.getChannelVideosMore(continuation),

	scrapePlaylistsMore: continuation => ytch.getChannelPlaylistsMore(continuation),

	scrapePlaylistVideos: playlistId => ytpl(playlistId),

	scrapePlaylistVideosProxy: (playlistId, obj) =>
		ytpl(playlistId, { requestOptions: { agent: makeAgent(obj) } }),

	scrapeSearchResults: (q, options) => ytsr(`${q}`, options),

	scrapeSearchResultsProxy: (q, obj) =>
		ytsr(`${q}`, { requestOptions: { agent: makeAgent(obj) } }),

	scrapeSearchResultsMore: continuation => ytsr.continueReq(continuation),

	scrapeSuggests: q => youtubeSuggest(q),

	scrapeSuggestsProxy: (q, obj) => youtubeSuggest(q, makeAgent(obj)),

	scrapeTrending: parameters => ytrend.scrape_trending_page(parameters),

	isYTVideoURL: str => ytdl.validateURL(str),

	getVideoId: str => ytdl.getVideoID(str),

	YTDLChooseFormat: (formats, quality) => ytdl.chooseFormat(formats, { quality }),

	getSponsorblockInfo: (videoId, uuidv4) =>
		new SponsorBlock(uuidv4).getSegmentsPrivately(videoId, [
			'sponsor',
			'intro',
			'outro',
			'interaction',
			'selfpromo',
			'music_offtopic',
			'preview',
		]),

	postSponsorblockInfo: (videoId, uuidv4, segment) =>
		new SponsorBlock(uuidv4).postSegments(videoId, segment),

	readStorage: () =>
		new Promise(resolve => {
			let readerStream = fs.createReadStream(STORAGE_PATH)

			readerStream.setEncoding('UTF8')
			readerStream.on('data', resolve)
		}),

	writeStorage: data => {
		let writerStream = fs.createWriteStream(STORAGE_PATH)

		writerStream.write(JSON.stringify(data))
		writerStream.end()
	},

	openExternalLink: url => shell.openExternal(url),

	getCaption: async (info, requiredLanguage) => {
		const format = 'vtt'
		const tracks = info.player_response.captions.playerCaptionsTracklistRenderer.captionTracks

		if (tracks && tracks.length) {
			const track = tracks.find(item => item.languageCode === requiredLanguage)

			const outputFolder = 'temp'
			const absolutePathOutputFolder = path.resolve(__dirname, outputFolder)
			const outputFile = `${info.videoDetails.videoId}.${track.languageCode}.${format}`

			if (!fs.existsSync(absolutePathOutputFolder)) fs.mkdirSync(absolutePathOutputFolder)

			return new Promise(resolve =>
				https.get(`${track.baseUrl}&fmt=${format}`, res => {
					res.pipe(
						fs.createWriteStream(path.resolve(__dirname, outputFolder, outputFile))
					)

					res.on('end', () => {
						resolve({
							videoId: info.videoDetails.videoId,
							languageCode: track.languageCode,
							simpleText: track.name.simpleText,
						})
					})
				})
			)
		}
	},

	clearTempFolder: () => {
		const folder = path.resolve(__dirname, 'temp')

		fs.readdir(folder, (err, files) => {
			if (err) throw err

			for (const file of files) {
				fs.unlink(path.join(folder, file), err => {
					if (err) throw err
				})
			}
		})
	},

	makeRequest: url => new Promise(resolve => https.get(url, resolve)),

	getAppVersion: () => ipcRenderer.invoke('app-version'),
})
