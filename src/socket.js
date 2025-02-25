const { io } = require('socket.io-client');

const URL = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "https://mukund-drawing-board-server.onrender.com";
export const socket = io(URL);
