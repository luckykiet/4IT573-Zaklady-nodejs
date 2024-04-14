import { db, getAllTodos, getTodoById } from './db.js';

import { WebSocketServer } from 'ws';
import ejs from 'ejs';

const connections = new Set();

export const createWebSocketServer = (server) => {
	const wss = new WebSocketServer({ server });

	wss.on('connection', (socket) => {
		connections.add(socket);

		console.log('New connection', connections.size);

		socket.on('close', () => {
			connections.delete(socket);

			console.log('Closed connection', connections.size);
		});
	});
};

export const sendTodoListToAllConnections = async () => {
	const todoList = await ejs.renderFile('views/_todos.ejs', {
		todos: await getAllTodos(),
	});

	for (const connection of connections) {
		connection.send(
			JSON.stringify({
				type: 'todoList',
				html: todoList,
			})
		);
	}
};

export const sendUpdatedTodoListToAllConnections = async (id) => {
	try {
		const todo = await getTodoById(id);
		if (todo) {
			const todoPage = await ejs.renderFile('views/_todo.ejs', {
				todo,
			});

			for (const connection of connections) {
				connection.send(JSON.stringify({ type: 'todo', html: todoPage, todo }));
			}
		}
	} catch (error) {
		console.error('Error rendering and sending updated todo:', error);
	}
};

export const sendDeletedTodoAlertToAllConnections = async (title) => {
	try {
		const deleteAlert = await ejs.renderFile('views/_alert.ejs', { title });

		for (const connection of connections) {
			connection.send(
				JSON.stringify({ type: 'todoDelete', html: deleteAlert })
			);
		}
	} catch (error) {
		console.error('Error rendering and sending delete todo:', error);
	}
};
