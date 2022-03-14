export default class HideOnScroll {
	constructor(config) {
		this.config = config || {}

		if (!this.config.selector) {
			console.error('You must pass DOM element!')
			return
		}

		this.isHidden = false
		this.lastScrollValue = 0

		this.init()
	}

	init() {
		if ('minWidth' in this.config && window.innerWidth < this.config.minWidth) return
		if ('maxWidth' in this.config && window.innerWidth > this.config.maxWidth) return

		window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true })
	}

	show() {
		this.config.selector.classList.remove('_hidden')
		this.isHidden = false
	}

	hide() {
		this.config.selector.classList.add('_hidden')
		this.isHidden = true
	}

	handleScroll() {
		if (this.config?.conditionShow) {
			this.show()
			return
		}

		let scrollDistance = window.scrollY

		if (scrollDistance === 0) this.hide()

		if (scrollDistance > this.lastScrollValue) {
			!this.isHidden && this.hide()
		} else {
			this.isHidden && this.show()
		}

		this.lastScrollValue = scrollDistance
	}
}
