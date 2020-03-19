var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var redis = require("redis");
require('dotenv').config({path: __dirname + '/../.env'});

var sub = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	no_ready_check: true,
	auth_pass: process.env.REDIS_PASSWORD,
	db: process.env.REDIS_DB
});

app.listen(8443);

sub.on("subscribe", function (channel, count) {
	console.log("subscription complete on channel:" + channel);
});

sub.on("message", function (channel, message) {
	console.log("sub-message from channel " + channel);
	var pubMessage = JSON.parse(message);
	var data = pubMessage.data;
	var searchResults = data.results;

	console.log("socket-id:" + data.socket_id);
	console.log("timestamp:" + data.timestamp);
	searchResults = JSON.parse(searchResults);
	io.sockets.in(data.socket_id).emit(channel, {data: searchResults, timestamp: data.timestamp});
});

sub.subscribe("search-results");
sub.subscribe("flexible-search-results");

function handler(req, res) {
}


io.on('connect', function (socket) {
	console.log("client connected:" + socket.id);
	socket.on('join', function (data) {
		socket.join(data.id);
	});
});


