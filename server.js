'use strict'

var express = require('express')
var app = express()

app.config = require('./config')
app.Boards = require('./classes/boards')
app.Board = require('./classes/board')

app.boards = new app.Boards(app.config.boards.expireDelta, app.config.boards.idleDelta, app.config.boards.maxBoards)

require('./middlewares/access-control')(app)
require('./controllers/board')(app)

app.use(express.static(__dirname + '/public'));

app.listen(app.config.port, function () {
	console.log('Example app listening on port ' + app.config.port)
})
