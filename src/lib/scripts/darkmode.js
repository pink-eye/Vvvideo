/*! DarkModeJS by nickdeny (v1.2): https://github.com/nickdeny/darkmode-js */ !(function (e, t) {
	var o = 'DarkMode'
	'function' == typeof define && define.amd
		? define([], t(o))
		: 'object' == typeof exports
		? (module.exports = t(o))
		: (e.DarkMode = t(o))
})(this, function (e) {
	'use strict'
	var t = { light: !1, dark: !1, startAt: '21:00', endAt: '06:00', checkSystemScheme: !0, saveOnToggle: !0 },
		o = document.getElementsByTagName('head')[0],
		n = document.getElementsByTagName('body')[0],
		i = function (e) {
			var t = new Date(),
				o = e.split(':')
			return t.setHours(o[0], o[1], 0, 0)
		},
		s = function (e) {
			return 'light' === e ? 'dark' : 'light'
		}
	function r(e) {
		;(this.options = (function (e, o) {
			var n,
				i = {}
			for (n in t) Object.prototype.hasOwnProperty.call(t, n) && (i[n] = t[n])
			for (n in o) Object.prototype.hasOwnProperty.call(o, n) && (i[n] = o[n])
			return i
		})(0, e)),
			this.init()
	}
	return (
		(r.prototype = {
			init: function () {
				if (
					(this.options.saveOnToggle || localStorage.removeItem('dm-mode'),
					window.matchMedia && this.options.checkSystemScheme)
				) {
					var e = this
					function t(t) {
						window.matchMedia('(prefers-color-scheme: ' + t + ')').addListener(function (o) {
							return o.matches && e.setMode(t)
						})
					}
					t('light'), t('dark')
				}
				return this.setMode(this.getMode())
			},
			getMode: function () {
				if (this.mode) return this.mode
				var e = localStorage.getItem('dm-mode')
				if (e) return e
				if (window.matchMedia && this.options.checkSystemScheme) return this.getSystemScheme()
				var t = i(this.options.startAt),
					o = i(this.options.endAt),
					n = new Date().getTime()
				return (o < n && n > t) || (t > n && n < o) ? 'dark' : 'light'
			},
			setMode: function (e) {
				if ('light' !== e && 'dark' !== e) return !1
				this.mode = e
				var t,
					i,
					r,
					d = s(e)
				if (this.options[e]) {
					var a = document.getElementById('dm-' + e),
						m = document.getElementById('dm-' + d)
					a
						? a && a.removeAttribute('disabled')
						: ((t = 'dm-' + e),
						  (i = this.options[e]),
						  ((r = document.createElement('link')).id = t),
						  (r.rel = 'stylesheet'),
						  (r.type = 'text/css'),
						  (r.href = i),
						  o.getElementsByTagName('link')[0]
								? o.insertBefore(r, o.getElementsByTagName('link')[0])
								: o.appendChild(r)),
						m && m.setAttribute('disabled', !0)
				}
				return n.classList.add('dm-' + e), n.classList.remove('dm-' + d), !0
			},
			isModeSaved: function () {
				return Boolean(localStorage.getItem('dm-mode'))
			},
			clearSavedMode: function () {
				return localStorage.removeItem('dm-mode'), (this.mode = null), this.setMode(this.getMode()), !0
			},
			toggleMode: function () {
				var e = s(this.mode)
				return this.setMode(e), this.options.saveOnToggle && localStorage.setItem('dm-mode', e), e
			},
			getSystemScheme: function () {
				return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
			},
		}),
		r
	)
})
let options = {
		light: 'css/themes/lightmode.css',
		dark: 'css/themes/darkmode.css',
		checkSystemScheme: !0,
		saveOnToggle: !1,
	},
	theme = new DarkMode(options)
