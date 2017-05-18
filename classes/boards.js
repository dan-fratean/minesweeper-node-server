'use strict';

class Boards {
	constructor (expireDelta, idleDelta, maxBoards) {
		this._expireDelta = expireDelta
		this._idleDelta = idleDelta
		this._maxBoards = maxBoards
		this._boards = {}
	}

	add (board) {
		this._boards[board.getId()] = board
	}

	delete (board) {
		delete this._boards[board.getId()]
	}

	get (boardId) {
		return this._boards[boardId]
	}

	canIAddNewBoard() {
		this.collectGarbage()

		if (Object.keys(this._boards).length >= this._maxBoards) {
			return false
		}
		else {
			return true
		}
	}

	collectGarbage () {
		var self = this
		var now = Math.round(new Date().getTime()/1000)
		var expired = []

		for (var boardId in this._boards) {
    		if (this._boards.hasOwnProperty(boardId)) {
        		if (this._boards[boardId]._created < now - this._expireDelta) {
        			expired.push(boardId)
        		}
        		if (this._boards[boardId]._lastMove < now - this._idleDelta) {
        			expired.push(boardId)
        		}
	    	}
		}

		expired.forEach(function (boardId) {
			delete self._boards[boardId]
		})
	}
}

module.exports = Boards
