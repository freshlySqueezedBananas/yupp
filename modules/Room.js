var _ = require('underscore');

var Room = {
	join: function(socket, room) {
		// Sair de todas as salas e juntar-se à nova sala
		socket.leaveAll();
		socket.join(room);
		// Voltar a entrar na sala do socket id
		socket.join(socket.id);
		// Variável globalizada no socket para referência no evento de disconnect
		socket.room = room;
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

module.exports = Room;