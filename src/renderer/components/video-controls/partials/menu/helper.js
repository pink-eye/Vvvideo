export const qualityItemHTML = quality => `<li class="panel__item">
										<button class="panel__btn btn-reset" data-quality="${quality}">
											${quality}
										</button>
									</li>`

export const captionItemHTML = ({ simpleText, srclang, src }) => `<li class="panel__item">
															<button
															class="panel__btn btn-reset"
															data-label="${simpleText}"
															data-srclang="${srclang}"
															data-src="${src}">
																${simpleText}
															</button>
														</li>`

export const captionItemDefaultHTML = () => `<li class="panel__item">
										<button
										class="panel__btn btn-reset"
										data-label="No captions">
											No captions
										</button>
									</li>`
