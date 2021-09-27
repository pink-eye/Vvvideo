const initSpoiler = spoiler => {

	const toggleSpoiler = spoiler => {
		if (spoiler.classList.contains("_opened"))
			spoiler.removeAttribute('style')
		else {
			let heightContent = spoiler.querySelector('.spoiler__content').offsetHeight;

			spoiler.style.setProperty("--height-content", `${heightContent}px`);

			heightContent = null
		}

		spoiler.classList.toggle("_opened")
	};

	const spoilerHead = spoiler.querySelector('.spoiler__head')

	spoilerHead.addEventListener("click", _ => { toggleSpoiler(spoiler) })
}
