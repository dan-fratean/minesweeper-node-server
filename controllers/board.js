
module.exports = function(app) {
	app.post('/new', function (req, res) {
		if (!app.boards.canIAddNewBoard()) {
			var error = 'server memory full'
			res.status(422).send({'error': error})
			console.log(error)
		}
		else {
			var board = new app.Board(app.config.board.defaultX, app.config.board.defaultY, app.config.board.maxMines)
			board.generate()
			app.boards.add(board)

			res.status(201).send({
				boardId: board.getId(),
				x: board.getX(),
				y: board.getY(),
				mines: board.getMines()
			})
		}
	})

	//posting a move
	app.post('/boardId/:boardId/x/:x/y/:y', function (req, res) {
		if (app.boards.get(req.params.boardId) === undefined) {
			res.status(404).send({'error': 'unknown id'})
		}
		else {
			res.status(200).send(app.boards.get(req.params.boardId).move(req.params.x, req.params.y))
		}
	})

	//get data for a specific board
	app.get('/boardId/:boardId', function(req, res) {
		if (app.boards.get(req.params.boardId) === undefined) {
			res.status(404).send({'error': 'unknown id'})
		}
		else {
			res.status(200).send(app.boards.get(req.params.boardId).getBoard())
		}
	})

	//delete a board
	app.delete('/boardId/:boardId', function(req, res) {
		if (app.boards.get(req.params.boardId) === undefined) {
			res.status(404).send({'error': 'unknown id'})
		}
		else {
			app.boards.delete(app.boards.get(req.params.boardId))
			res.status(200).send({deleted: req.params.boardId})
		}
	})
}
