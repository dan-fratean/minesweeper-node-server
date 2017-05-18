'use strict'

class Board {
	constructor (x, y, mines) {
		var shortid = require('shortid')

		this._boardId = shortid.generate()
		this._exploded = false
		this._created = Math.round(new Date().getTime()/1000)
		this._lastMove = 0

		this._x = x
		this._y = y
		this._mines = mines
	}

	getId () {
		return this._boardId
	}

	getX () {
		return this._x
	}

	getY () {
		return this._y
	}

	getMines () {
		return this._mines
	}

	getBoard () {
		var board = {}
		board.board = []

		for (var i = 0; i < this._x; i++) {
			board.board[i] = []
			for (var j = 0; j < this._y; j++) {
				board.board[i][j] = {
					visited: this._board[i][j].visited,
					surroundingMines: this._board[i][j].surroundingMines
				}
			}
		}

		board.finished = this._finished
		return board
	}

	generate () {
		var ok, mX, mY

		this._board = []

		for (var i = 0; i < this._x; i++) {
			this._board[i] = []
			for (var j = 0; j < this._y; j++) {
				this._board[i][j] = {
					visited: false,
					mine: false,
					surroundingMines: 0
				}
			}
		}

		for (i = 0; i < this._mines; i++) {
			ok = false
			while (!ok) {
				mX = Math.floor(Math.random() * this._x)
				mY = Math.floor(Math.random() * this._y)
				if (!this._board[mX][mY].mine) {
					this._board[mX][mY].mine = ok = true
				}
			}
		}
	}

	move (x, y) {
		x = isNaN(parseInt(x)) ? -1 : parseInt(x)
		y = isNaN(parseInt(y)) ? -1 : parseInt(y)

		if (x < 0 || y < 0 || x >= this._x || y >= this._y) {
			return { finished: false }
		}

		if (this._board[x][y].visited) {
			return { finished: false }
		}

		if (this._board[x][y].mine) {
			if (this._lastMove == 0)
			{
				var ok = false
				while (!ok) {
					this.generate()
					if (!this._board[x][y].mine) {
						ok = true
					}
				}
			}
			else {
				return { blown: true }
			}
		}

		this.inspect(x, y)
		this._lastMove = Math.round(new Date().getTime()/1000)

		if (this.finishedBoard()) {
			return { finished: true }
		}
		else {
			return { finished: false }
		}
	}

	finishedBoard () {
		var remainingCells = 0
		for (var i = 0; i < this._x; i++) {
			for (var j = 0; j < this._y; j++) {
				if (!this._board[i][j].visited) {
					remainingCells++
				}
			}
		}
		if (remainingCells == this._mines) {
			return true
		}
		return false
	}

	inspect (x, y) {
		var self = this
		var surroundingMines = 0
		var neighbours = []

		this._board[x][y].visited = true

		for (var i = x - 1; i <= x + 1; i++) {
			for (var j = y - 1; j <= y + 1; j++) {
				if (i < 0 || i >= this._x || j < 0 || j >= this._y) {
					continue
		  		}

		  		if (this._board[i][j].mine) {
		  			surroundingMines++
		  		}
		  		else if (!this._board[i][j].visited) {
		  			neighbours.push({
		  				x: i,
		  				y: j
		  			})
		  		}
		  	}
		}

		this._board[x][y].surroundingMines = surroundingMines

		if (!surroundingMines) {
			neighbours.forEach(function(neighbour) {
				self.inspect(neighbour.x, neighbour.y)
			})
		}
	}
}

module.exports = Board
