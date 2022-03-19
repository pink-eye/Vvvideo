export const createSuggestionHTML = textContent => `<button class="suggestion">
											<aside class="suggestion__icon">
												<svg width="21px" height="21px">
													<use xlink:href='img/svg/actions.svg#search'></use>
												</svg>
											</aside>
											<span class="suggestion__text">${textContent}</span>
										</button>`

export const createRecentQueryHTML = textContent => `<button class="suggestion">
											<aside class="suggestion__icon">
												<svg width="18px" height="18px">
													<use xlink:href='img/svg/actions.svg#date'></use>
												</svg>
											</aside>
											<span class="suggestion__text">${textContent}</span>
										</button>`
