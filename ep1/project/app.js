// express
const express = require('express')
const app = express()

// nodejs
const http = require('http').createServer(app)

// socket
const io = require('socket.io')(http, {})

// Маршрутизация
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html')
})

// Встроенная функция промежуточной обработки
app.use('/client', express.static(__dirname + '/client'))

http.listen(2000, function () {
  console.log('server started.')
})

const SOCKET_LIST = {}

io.sockets.on('connection', function (socket) {
  // при соединение клиента генерируется случайное число, это число условно является именем клиента.
  socket.id = Math.random()
  socket.x = 0
  socket.y = 0

  //
  socket.number = '' + Math.floor(10 * Math.random())

  // Видимо объект socket хранит соединение клиента.
  SOCKET_LIST[socket.id] = socket

  // Удаление клиента из списка. событие disconnect происходит автоматически.
  socket.on('disconnect', function () {
    delete SOCKET_LIST[socket.id]
  })
})

// Планирование вызова.
setInterval(function () {
  let pack = []
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i]
    socket.x++
    socket.y++
    pack.push({
      x: socket.x,
      y: socket.y,
      number:socket.number
    })
  }

  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i]
    socket.emit('newPositions', pack)
  }
}, 1000 / 25)
