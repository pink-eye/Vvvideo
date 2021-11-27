export class YoutubeHelper {
	hasBaseDomain(url) {
		const regExp = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/
		return url.match(regExp) && url.match(regExp).length > 0
	}

	isChannel(url) {
		return this.hasBaseDomain(url) && (url.includes('/user/') || url.includes('/channel/') || url.includes('/c/'))
	}

	isPlaylist(url) {
		return this.hasBaseDomain(url) && url.includes('playlist?list=')
	}

	getChannelId(url) {
		const regExpUser = /(channel|user|c)\/([a-zA-Z0-9\-_]*.)/.exec(url)

		if (regExpUser)
			return regExpUser[2].endsWith('/') ? regExpUser[2].substring(0, regExpUser[2].length - 1) : regExpUser[2]

		return undefined
	}

	getPlaylistId(url) {
		const regExp = /[&?]list=([a-z0-9_]+)/i
		const match = regExp.exec(url)

		if (match && match[1].length > 0) return match[1]

		return undefined
	}
}
