var express = require('express')
var shortid = require('shortid')

var app = express()

var boards = {} //all the boards...
var collector = [] //garbage collecinting data
var expiring = 60*60*24 // boards expiring 1 day after creation
var idle = 60 * 60 // boards expire 1fter being idle for 1h

var defaultX = 20 //default with
var defaultY = 20 //default height
var maxMines = 40 // default # of mines/board
var maxBoards = 10 //maximum amount of board stored serverside

var port = 7778

//middleware for access control origin for testing purposes
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:7779');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//create a new board with default dimensions and mine count
app.post('/new', function (req, res) {
	if (Object.keys(boards).length >= maxBoards) {
		res.status(422).send({
			'prettyError': 'I am overloaded... I migth step on a mine if you push me any further, let me cool down a bit, come back to a later time please! Thank you!',
			'error': 'Server memory full, try again later please!'
		})
		console.log('I am overloaded! If I am not under attack, scale me horizontally or vertically!')
		return
	}

	var boardId = shortid.generate()
	boards[boardId] = newBoard()
    res.status(201).send({
    	boardId: boardId,
    	x: boards[boardId].board.length,
    	y: boards[boardId].board[0].length,
    	mines: boards[boardId].mines
    })
    collector.push([boardId, Math.round(new Date().getTime()/1000)])
    console.log('New standard board created. I have named it \'' + boardId + '\'. Pretty name, isn\'t it?')
})

app.post('/boardId/:boardId/x/:x/y/:y', function (req, res) {
	board = boards[req.params.boardId]
	if (board === undefined) {
		console.log('Someone tried to access an unborn child named \'' + req.params.boardId + '\'')
		res.status(404).send({
			'prettyError': 'I am sorry but I don\'t know who ' + req.params.boardId + ' is!',
			'error': 'Unknown id ' + req.params.boardId
		})
		return
	}

	console.log('OK!!! Lets step on \'' + req.params.boardId + '\' at ' + req.params.x + '/' + req.params.y)
	res.status(200).send(move(req.params.boardId, req.params.x, req.params.y))
})

app.get('/boardId/:boardId', function(req, res) {
	board = boards[req.params.boardId]
	if (board === undefined) {
		console.log('Someone tried to access an unborn child named \'' + req.params.boardId + '\'')
		res.status(404).send({
			'prettyError': 'I am sorry but I don\'t know who ' + req.params.boardId + ' is!',
			'error': 'Unknown id ' + req.params.boardId
		})
		return
	}

	console.log('OK!!! We have a request to show \'' + req.params.boardId + '\'')
	res.status(200).send(board)
})

app.delete('/boardId/:boardId', function(req, res) {
	board = boards[req.params.boardId]
	if (board === undefined) {
		console.log('Someone tried to access an unborn child named \'' + req.params.boardId + '\'')
		res.status(404).send({
			'prettyError': 'I am sorry but I don\'t know who ' + req.params.boardId + ' is!',
			'error': 'Unknown id ' + req.params.boardId
		})
		return
	}

	removeBoard(req.params.boardId)
	console.log('OK!!! We have a request to terminate \'' + req.params.boardId + '\'')
	res.status(200).send({reposne: 'Ok!'})
})

app.listen(port, function () {
	console.log('Example app listening on port ' + port)
})

function newBoard(x = 0, y = 0, mines = 0) {
	x = x !== 0 ? x : defaultX
	y = y !== 0 ? y : defaultY
	mines = mines !== 0 ? mines : maxMines

	var board = []
	for (var i = 0; i < x; i++) {
		board[i] = []
		for (var j = 0; j < y; j++) {
			board[i][j] = {
				visited: false,
				mine: false,
				surroundingMines: 0
			}
		}
	}

	for (i = 0; i < mines; i++) {
		ok = false
		while (!ok) {
			mX = Math.floor(Math.random() * x)
			mY = Math.floor(Math.random() * y)
			if (!board[mX][mY].mine) {
				board[mX][mY].mine = ok = true
			}
		}
	}

	return {
		board: board,
		mines: mines,
		exploded: false,
		created: Math.round(new Date().getTime()/1000),
		lastMove: 0,
	}
}

function move(boardId, x, y) {
	x = isNaN(parseInt(x)) ? -1 : parseInt(x)
	y = isNaN(parseInt(y)) ? -1 : parseInt(y)

	if (x < 0 || y < 0 || x >= boards[boardId].board.length || y >= boards[boardId].board[0].length) {
		console.log('Hrm... Are those valid coordinates?!')
		return {
			response: 'Hrm... Are those valid coordinates?!',
			finished: false
		}
	}

	if (boards[boardId].board[x][y].visited) {
		console.log('Hrm... Already been there...')
		return {
			response: 'Hrm... Already been there...',
			finished: false
		}
	}

	if (boards[boardId].board[x][y].mine) {
		if (boards[boardId].lastMove == 0)
		{
			console.log('Tough luck... First step on a mine... Ok... I will give you a new board!')
			ok = false
			while (!ok) {
				boards[boardId] = newBoard(boards[boardId].board.length, boards[boardId].board[0].length, boards[boardId].board.mines)
				if (!boards[boardId].board[x][y].mine) {
					ok = true
				}
			}
		}
		else {
			console.log('OH NO! \'' + boardId + '\' is blown to pieces!')
			removeBoard(boardId)
			return {
				response: 'Kaboom!!!',
				blown: true,
				finished: true
			}
		}
	}

	boards[boardId] = inspect(boards[boardId], x, y)
	boards[boardId].lastMove = Math.round(new Date().getTime()/1000)

	if (finishedBoard(boards[boardId])) {
		return {
			response: 'Ok! All clear!',
			finished: true,
		}
	}
	else {
		return {
			response: 'Phew... Another step, another day to live...',
			finished: false,
		}
	}
}

function finishedBoard(board) {
	var remainingCells = 0
	for (var i = 0; i < board.board.length; i++) {
		for (var j = 0; j < board.board[i].length; j++) {
			if (!board.board[i][j].visited) {
				remainingCells++
			}
		}
	}

	if (remainingCells == board.mines) {
		return true
	}
	else {
		return false
	}
}

function inspect(board, x, y) {
	board.board[x][y].visited = true

	var surroundingMines = 0
	var neighbours = []
	for (var i = x - 1; i <= x + 1; i++) {
    	for (var j = y - 1; j <= y + 1; j++) {
      		if (i < 0 || i >= board.board.length || j < 0 || j >= board.board[i].length) {
      			continue
      		}

      		neighbour = board.board[i][j]
      		if (neighbour.mine) {
      			surroundingMines++
      		}
      		else if (!neighbour.visited) {
      			neighbours.push({
      				x: i,
      				y: j
      			})
      		}
      	}
    }

    board.board[x][y].surroundingMines = surroundingMines

    if (!surroundingMines) {
    	neighbours.forEach(function(neighbour) {
    		board = inspect(board, neighbour.x, neighbour.y)
    	})
    }
    return board
}

function removeBoard(boardId) {
	collector.forEach(function(item, index, object){
		if (item[1] === boardId) {
			object.splice(index, 1)
		}
	})

	delete boards[boardId]
}
