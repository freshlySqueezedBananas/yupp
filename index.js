var express = require('express');
var app = require('express')();
var http = require('http').Server(app);


var io = require('socket.io')(http);


var _ = require('underscore');
var randomString = require("randomstring");

var Color = {
	palette: {
		red: {
			name: 'red',
			active: false,
			hex: "#fe0000",
			image: 'superb.png'
		},
		orange: {
			name: 'orange',
			active: false,
			hex: "#ffb938",
			image: 'mega.png'
		},
		yellow: {
			name: 'yellow',
			active: false,
			hex: "#f0ff00",
			image: 'moche.png'
		},
		green: {
			name: 'green',
			active: false,
			hex: "#09ff00",
			image: 'sicr.png'
		},
		blue: {
			name: 'blue',
			active: false,
			hex: "#011efe",
			image: 'redb.png'
		},
		purple: {
			name: 'purple',
			active: false,
			hex: "#ff00db",
			image: 'mnc.png'
		},
		cyan: {
			name: 'cyan',
			active: false,
			hex: "#00ecff",
			image: 'meo.png'
		}
	},
	pick: function() {
		var available = _.where(Color.palette, {active: false});
		var pick;

		if (available.length > 0) {
			pick = _.shuffle(available)[0];

			Color.palette[pick.name].active = true;
		}

		return pick;
	}
}

var Room = {
	join: function(socket, room) {
		// Sair de todas as salas e juntar-se à nova sala
		socket.leaveAll();

		console.log('--> leave room :::: [ socket id: '+socket.id+' | room: *');
		socket.join(room);
		console.log('--> join room ::::: [ socket id: '+socket.id+' | room: '+room);
		// Voltar a entrar na sala do socket id
		//socket.join(socket.id);
		//console.log('--> join room ::::: [ socket id: '+socket.id+' | room: '+socket.id);
		// Variável globalizada no socket para referência no evento de disconnect
		socket.room = room;

		console.log();
	},
	leave: function(socket, room) {
		socket.leave(room);
		console.log(socket.id+' left room '+room);
	},
	connections: function(room) {
		// Retorna 0 se a sala não existir e o número de ligações à sala se existir
		return _.isUndefined(io.sockets.adapter.rooms[room]) ? 0:io.sockets.adapter.rooms[room].length;
	},
	exists: function(room) {
		// Deprecated | pode ainda vir a ser usado
		return _.has(Room.rooms, room);
	},
	check: function(socket, room) {
		// O método connections retorna 0 se a sala não existir
		if (Room.connections(room) > 1) {
			// Se estiverem 2+ ligações estabelecidas, verifica se o yupp está inactivo
			if (_.isUndefined(io.sockets.adapter.rooms[room].status)) {
				//Activação de estado e selecção de cor
				io.sockets.adapter.rooms[room].status = true;
				io.sockets.adapter.rooms[room].color = Color.pick();

				//Emissão de evento de activação para a sala com o objecto de cor
				io.to(room).emit('yupp live', io.sockets.adapter.rooms[room].color);
			}
			// Caso esteja activo emite apenas para o socket a juntar-se à sala
			else {
				io.to(socket.id).emit('yupp live', io.sockets.adapter.rooms[room].color);
			}
		}
		else {
			// Se tiver apenas uma ligação verifica se o canal existe e se o yupp está activo
			if (!_.isUndefined(io.sockets.adapter.rooms[room]) && !_.isUndefined(io.sockets.adapter.rooms[room].status)) {
				io.sockets.adapter.rooms[room].status = undefined;
				var colorName = io.sockets.adapter.rooms[room].color.name;
				Color.palette[colorName].active = false;
				io.to(room).emit('yupp halt');
			}
		}
	},
	rooms: []

}

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile('public/index.htm', { root: __dirname });
});
app.get('/:room', function(req, res){
  res.sendFile('public/index.htm', { root: __dirname });
});

var Users = {}

io.on('connection', function(socket) {
	console.log('--> connection :::: [ socket id: '+socket.id);

	// Emissão de evento de boas-vindas ao socket que se ligou ao servidor
	io.to(socket.id).emit('welcome');

    socket.on('handshake', function(fingerprint)  {
		// Variável globalizada no socket para referência no evento de disconnect
		socket.fingerprint = fingerprint;
    	//Se ainda não existir uma ligação com a mesma fingerprint
    	if (_.isUndefined(Users[fingerprint])) {
    		Users[fingerprint] = {
    			sockets: []
    		}
    	}
    	else {
    		_.each(Users[fingerprint].sockets, function(id) {
    			io.to(id).emit('yupp pause');
				io.sockets.sockets[id].disconnect();
    		});
    	}

    	//Adiciona o id do socket ao array para fazer tracking
		Users[fingerprint].sockets.push(socket.id);

		console.log('--> handshake ::::: [ socket id: '+socket.id+' | fingerprint: '+fingerprint);

    });

	socket.on('join room', function(room) {
		Room.join(socket, room);
		Room.check(socket, room);
	});

	socket.on('leave room', function(room) {
		Room.leave(socket, room);
	});

	socket.on('create room', function(){
		var roomName = randomString.generate({length: 6, readable: true, charset: 'alphanumeric'});
		while(!_.isUndefined(io.sockets.adapter.rooms[roomName])) {
			roomName = randomString.generate({length: 6, readable: true, charset: 'alphanumeric'});
		}
		console.log('--> handshake ::::: [ socket id: '+socket.id+' | fingerprint: '+fingerprint);
		console.log('--> create room ::: [ socket id: '+socket.id+' | fingerprint: '+fingerprint);

		Room.join(socket, roomName);

		io.to(socket.id).emit('room created', {name: roomName});
	});

	socket.on('pulse out', function(position) {
		socket.broadcast.to(socket.room).emit('pulse in', position);
		console.log('--> pulse ::::::::: [ socket id: '+socket.id+' | room: '+socket.room);
	});

	socket.on('disconnect', function () {
		console.log('<-- disconnection : [ socket id: '+socket.id+' | fingerprint: '+socket.fingerprint);

		if (Room.connections(socket.room) < 2) {
			Room.check(socket, socket.room);
		}


		var index = _.indexOf(Users[socket.fingerprint].sockets, socket.id);
		Users[socket.fingerprint].sockets.splice(index, 1);

		if (!_.isUndefined(Users[socket.fingerprint]) && Users[socket.fingerprint].sockets.length === 0) {
			//delete Users[socket.fingerprint];
		}
    });
});

http.listen(3000, function(){
	console.log('××× server :::::::: [ up and running on *:3000');
});