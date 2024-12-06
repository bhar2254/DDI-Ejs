

const titleToRanking = (title) => {
	const titles = [
		'pre',
		'vic',
		'v. ',
		'tre',
		'sen',
		'sec'
	]
	title = title.substring(0, 3).toLowerCase().padEnd(3, ' ')
	const position = titles.indexOf(title)
	return position >= 0 ? position : titles.length
}

module.exports = {
    titleToRanking
}