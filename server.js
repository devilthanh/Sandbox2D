var WebSocketServer = require('websocket').server;
var express = require('express');
var app = express();
var serv = require('http').Server(app);

wsServer = new WebSocketServer({
  httpServer: serv
});

const port = 8080;
serv.listen(port);
console.log("Server started at port: " + port);
// SERVER CONFIG

app.get('/',function(req, res){
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

// GAME CONFIG
const tileWidth = 32;
const tileHeight = 32;
const velX = 3.0;
const velY = 13.0;
const friction = 0.85;

getRelativeToMapWidth = function(x){
	var mapW = mapWidth*tileWidth;
	return (x>=mapW)?(x-mapW):((x<0)?(x+mapW):x);
}

getRelativeToMapHeight = function(y){
	var mapH = mapHeight*tileHeight;
	return (y>=mapH)?(y-mapH):((y<0)?(y+mapH):y);
}

toTile = function(x){
	return Math.floor(x/tileWidth);
}

walkable = function(type){
	if(type>=1 && type<=4) return false;
	return true;
}

map = [
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:46,type:14},{id:46,type:14},{id:46,type:14},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:20,type:1},{id:21,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:22,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:46,type:14},{id:46,type:14},{id:46,type:14},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:25,type:1},{id:26,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:31,type:2},{id:33,type:2},{id:37,type:12},{id:37,type:12},{id:31,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:33,type:2},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:27,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:22,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:31,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:36,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:5,type:1},{id:18,type:1},{id:7,type:1},{id:7,type:1},{id:18,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:18,type:1},{id:5,type:1},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:31,type:2},{id:32,type:2},{id:32,type:2},{id:33,type:2},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:38,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:27,type:1},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:16,type:1},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:18,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:38,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:4,type:12},{id:4,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:38,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:27,type:1},{id:27,type:1},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:4,type:12},{id:4,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:38,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:35,type:2},{id:41,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:6,type:1},{id:8,type:1},{id:3,type:12},{id:3,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:20,type:1},{id:21,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:27,type:1},{id:39,type:2},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:25,type:1},{id:26,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:20,type:1},{id:21,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:45,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:25,type:1},{id:26,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:19,type:1},{id:23,type:1},{id:24,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:19,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:11,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:28,type:1},{id:29,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:44,type:2},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:40,type:2},{id:36,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:6,type:1},{id:8,type:1},{id:2,type:12},{id:2,type:12},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:9,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:9,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:34,type:2},{id:22,type:1},{id:2,type:12},{id:2,type:12},{id:34,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:17,type:1},{id:7,type:1},{id:7,type:1},{id:18,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:20,type:1},{id:21,type:1},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:40,type:2},{id:32,type:2},{id:33,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:25,type:1},{id:26,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:4,type:12},{id:4,type:12},{id:4,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:44,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:44,type:2},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:4,type:12},{id:4,type:12},{id:4,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:12,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:8,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:22,type:1},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:34,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:23,type:1},{id:24,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:27,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:28,type:1},{id:29,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:12,type:1},{id:7,type:1},{id:8,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:18,type:1},{id:31,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:33,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:19,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:20,type:1},{id:21,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:27,type:1},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:25,type:1},{id:26,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:9,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:44,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:17,type:1},{id:13,type:1},{id:8,type:1},{id:43,type:12},{id:43,type:12},{id:6,type:1},{id:13,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:27,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:27,type:1},{id:27,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:23,type:1},{id:24,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:27,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:28,type:1},{id:29,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:17,type:1},{id:8,type:1},{id:1,type:10},{id:1,type:10},{id:6,type:1},{id:7,type:1},{id:7,type:1},{id:18,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:20,type:1},{id:21,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:20,type:1},{id:21,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:25,type:1},{id:26,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:25,type:1},{id:26,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:4,type:12},{id:4,type:12},{id:4,type:12},{id:2,type:12},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:20,type:1},{id:21,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:4,type:12},{id:4,type:12},{id:4,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:25,type:1},{id:26,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:9,type:1},{id:31,type:2},{id:36,type:2},{id:3,type:12},{id:3,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:12,type:1},{id:8,type:1},{id:1,type:10},{id:6,type:1},{id:7,type:1},{id:7,type:1},{id:8,type:1},{id:1,type:10},{id:1,type:10},{id:6,type:1},{id:7,type:1},{id:17,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:18,type:1},{id:22,type:1},{id:44,type:2},{id:3,type:12},{id:3,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:16,type:1},{id:1,type:10},{id:27,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:27,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:22,type:1},{id:34,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:15,type:1},{id:7,type:1},{id:16,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:20,type:1},{id:21,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:27,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:16,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:39,type:2},{id:25,type:1},{id:26,type:1},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:27,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:40,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:33,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:31,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:32,type:2},{id:36,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:10,type:1},{id:7,type:1},{id:11,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:44,type:2},{id:22,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:22,type:1},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:14,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:22,type:1},{id:20,type:1},{id:21,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:11,type:1},{id:20,type:1},{id:21,type:1},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:14,type:1},{id:22,type:1},{id:22,type:1},{id:25,type:1},{id:26,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:38,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:25,type:1},{id:26,type:1},{id:42,type:12},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:15,type:1},{id:11,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:14,type:1},{id:20,type:1},{id:21,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:22,type:1},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:34,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:38,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:31,type:2},{id:32,type:2},{id:33,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:14,type:1},{id:25,type:1},{id:26,type:1},{id:22,type:1},{id:2,type:12},{id:2,type:12},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:2,type:12},{id:22,type:1},{id:44,type:2},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:10,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:11,type:1},{id:23,type:1},{id:24,type:1},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:11,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:28,type:1},{id:29,type:1},{id:2,type:12},{id:2,type:12},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:14,type:1},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:1,type:10},{id:14,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:15,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:7,type:1},{id:16,type:1},{id:0,type:0},{id:0,type:0},{id:0,type:0}],
	[{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0},{id:0,type:0}]
];

var mapWidth = map[0].length;
var mapHeight = map.length;
var mapW = mapWidth*tileWidth;
var mapH = mapHeight*tileHeight;
var tick = 0;

// CLASSES

class Player {
	constructor(name, ip) {
		this.name = name;				//info
		this.ip = ip;					//info
		this.x = 0;						//movement
		this.y = 0;						//movement
		this.rot = 0;					//rot
		this.fakerot = 0;				//rot
		this.health = 100;				//info
		this.armor = "None";			//info
		this.moveLeft = false;			//movement
		this.moveRight = false;			//movement
		this.moveUp = false;			//movement
		this.moveDown = false;			//movement
		this.run = false;				//movement
		this.onAttack = false;			//attack
		this.attackStage = 0;			//attack
		this.attackCount = 0;			//attack
		this.knockTime = 0;				//info
		this.knockDir = 0;				//info
		this.knock = {};				//attack
		this.botrot = 0;				
		this.bot = false;
		
		this.spawn();
	}
	
	botUpdate(){
		this.moveLeft = Math.floor(Math.random()*100)<30;
		this.moveRight = (this.moveLeft==true)?false:Math.floor(Math.random()*70)<30;
		this.moveUp = Math.floor(Math.random()*100)<30;
		this.moveDown = (this.moveUp==true)?false:Math.floor(Math.random()*70)<30;
		this.run = Math.floor(Math.random()*100)<30;
		
		var v=0, h=0;
		if(this.moveLeft) h = -1;
		if(this.moveRight) h = 1;
		if(this.moveUp) v = -1;
		if(this.moveDown) v = 1;
		
		this.rot = -Math.atan2(0-h, 0-v);
		
		broadCast(JSON.stringify({	
			header: "updateMovement",
			data:{
				ip:this.ip,
				x:this.x,
				y:this.y,
				moveLeft:this.moveLeft,
				moveRight:this.moveRight,
				moveUp:this.moveUp,
				moveDown:this.moveDown,
				run:this.run
			}
		}));
		
		this.onAttack = Math.floor(Math.random()*2)==1;
		if(this.onAttack){
			this.attackStage = 3;
			this.attackCount = 5;
			for(var i in PLAYERS)
				this.knock[i] = false;
			
			broadCast(JSON.stringify({	
				header: "updateAttack",
				data:{
					ip:this.ip,
					attackStage:this.attackStage,
					attackCount:this.attackCount,
					knock:this.knock
				}
			}));
		}
		setTimeout(this.botUpdate.bind(this), Math.floor(Math.random()*3000)+500);
	}
	
	spawn(){
		var xx, yy;
		do{
			xx = Math.floor(Math.random()*mapWidth);
			yy = Math.floor(Math.random()*mapHeight);
		}while(!walkable(map[yy][xx].type) || map[yy][xx].id==0);	
		this.x = xx*tileWidth + 16;
		this.y = yy*tileHeight + 16;
				
		broadCast(JSON.stringify({	
			header: "updateSpawn",
			data:{
				ip:this.ip,
				x:this.x,
				y:this.y,
			}
		}));
	}
	

	hit(src, dir){
		this.knockTime = 20;
		this.knockDir = dir;
		this.health -= Math.floor(Math.random()*30);
		if(this.health <=0){
			this.health = 100;
			this.spawn();
			broadCast(JSON.stringify({header: "chatUpdate", data: {"name":"[System]", "msg": "<span style=\"color:blue\">" + src.name + " </span>" + "<span style=\"color:#dd0000\"> killed </span>" + "<span style=\"color:blue\">" + this.name + " </span>"}}));
		}
		
		broadCast(JSON.stringify({	
			header: "updateInfo",
			data:{
				ip:this.ip,
				health:this.health,
				armor:this.armor,
				knockTime:this.knockTime,
				knockDir:this.knockDir
			}
		}));
	}
}


// GAME SETUP
var PLAYERS = {};

gameSetup = function(){
	for (var i = 0; i < 20; i++) {
		PLAYERS["Bot " + i] = new Player("Bot " + i, "Bot" + i)
		PLAYERS["Bot " + i].bot = true;
		PLAYERS["Bot " + i].botUpdate();
	}
}

// NETWORKING-----------------------------------------------------------------
broadCast = function(msg){
	for(i in PLAYERS){
		if(!PLAYERS[i].bot)
			PLAYERS[i].socket.send(msg);
	}
}

wsServer.on('request', function(request) {

	var connection = request.accept(null, request.origin);
	var clientIp = connection.remoteAddress.split(':')[3];
		
	delete PLAYERS[clientIp];

	PLAYERS[clientIp] = new Player(clientIp, clientIp);
	PLAYERS[clientIp].socket = connection;
	
	console.log("Player at " + PLAYERS[clientIp].name + " connected.");
	broadCast(JSON.stringify({header: "chatUpdate", data: {"name":"[System]", "msg":"Player at " + PLAYERS[clientIp].name + " connected."}}));

	connection.send(JSON.stringify(
		{	
			header: "load",
			data:{
				id:clientIp,
				sv_tick:tick,
				map:map
			}
		}
	));	
	
	var sendData = [];
	for(var i in PLAYERS){
			sendData.push({	
				name:PLAYERS[i].name,
				ip:PLAYERS[i].ip,
				x:PLAYERS[i].x,
				y:PLAYERS[i].y,
				rot:PLAYERS[i].rot,
				fakerot:PLAYERS[i].fakerot,
				health:PLAYERS[i].health,
				armor:PLAYERS[i].armor,
				moveLeft:PLAYERS[i].moveLeft,
				moveRight:PLAYERS[i].moveRight,
				moveUp:PLAYERS[i].moveUp,
				moveDown:PLAYERS[i].moveDown,
				run:PLAYERS[i].run,
				onAttack:PLAYERS[i].onAttack,
				attackStage:PLAYERS[i].attackStage,
				attackCount:PLAYERS[i].attackCount,
				knockTime:PLAYERS[i].knockTime,
				knockDir:PLAYERS[i].knockDir,
				knock:PLAYERS[i].knock,
				botrot:PLAYERS[i].botrot,
				bot:PLAYERS[i].bot		
			});
	}
	
	broadCast(JSON.stringify(
		{	
			header: "newPlayer",
			data:sendData
		}
	));	

	connection.on('close', function(data) {
		if(PLAYERS[clientIp] != undefined){
			console.log("Player at " + PLAYERS[clientIp].name + " disconnected.");
			broadCast(JSON.stringify({header: "chatUpdate", data: {"name":"[System]", "msg":"Player at " + PLAYERS[clientIp].name + " disconnected."}}));
			delete PLAYERS[clientIp];
			broadCast(JSON.stringify({header: "deletePlayer", data:clientIp}));
		}
	});

	connection.on('message', function(event) {
		var msg = JSON.parse(event.utf8Data);
		var header = msg.header;
		var data = msg.data;
		
		if(header==="sendMouse"){
			PLAYERS[clientIp].onAttack = true;
			PLAYERS[clientIp].attackStage = 3;
			PLAYERS[clientIp].attackCount = 5;
			for(var j in PLAYERS[clientIp].knock)
				PLAYERS[clientIp].knock[j] = false;
			
			broadCast(JSON.stringify({	
				header: "updateAttack",
				data:{
					ip:clientIp,
					onAttack:PLAYERS[clientIp].onAttack,
					attackStage:PLAYERS[clientIp].attackStage,
					attackCount:PLAYERS[clientIp].attackCount,
					knock:PLAYERS[clientIp].knock
				}
			}));
		}else if(header==="sendKey"){
			var code = data.code;
			var status = data.status;
			if(code==65 || code==37){
				PLAYERS[clientIp].moveLeft = status;
			}if(code==68 || code==39){
				PLAYERS[clientIp].moveRight = status;
			}else if(code==87 || code==38){
				PLAYERS[clientIp].moveUp = status;
			}else if(code==83 || code==40){
				PLAYERS[clientIp].moveDown = status;
			}else if(code==16){
				PLAYERS[clientIp].run = status; 
			}	
			
			broadCast(JSON.stringify({	
				header: "updateMovement",
				data:{
					ip:clientIp,				
					x:PLAYERS[clientIp].x,
					y:PLAYERS[clientIp].y,
					moveLeft:PLAYERS[clientIp].moveLeft,
					moveRight:PLAYERS[clientIp].moveRight,
					moveUp:PLAYERS[clientIp].moveUp,
					moveDown:PLAYERS[clientIp].moveDown,
					run:PLAYERS[clientIp].run
				}
			}));
			
			
			
		}else if(header==="rot"){
			PLAYERS[clientIp].rot = data.rot;
			PLAYERS[clientIp].x = data.x;
			PLAYERS[clientIp].y = data.y;
			broadCast(JSON.stringify({header:"updateRot", data:{ip:clientIp,rot:PLAYERS[clientIp].rot}}));
		}else if(header==="p"){
			connection.send(JSON.stringify({header:"p", data:""}));
		}else if(header==="chat"){
			broadCast(JSON.stringify({header:"chatUpdate", data:{"name":PLAYERS[clientIp].name, "msg":data}}));
		}else if(header==="requestUpdate"){
			var sendData2 = [];
			for(var i in PLAYERS){
					sendData2.push({	
						ip:PLAYERS[i].ip,
						x:PLAYERS[i].x,
						y:PLAYERS[i].y,
					});
			}
			connection.send(JSON.stringify({header:"requestUpdate", data:sendData2}));
		}else if(header==="chatting"){
			PLAYERS[clientIp].moveLeft = false;
			PLAYERS[clientIp].moveRight = false;
			PLAYERS[clientIp].moveUp = false;
			PLAYERS[clientIp].moveDown = false;
			PLAYERS[clientIp].run = false;
			
			broadCast(JSON.stringify({	
				header: "updateMovement",
				data:{
					ip:clientIp,	
					x:PLAYERS[clientIp].x,
					y:PLAYERS[clientIp].y,
					moveLeft:PLAYERS[clientIp].moveLeft,
					moveRight:PLAYERS[clientIp].moveRight,
					moveUp:PLAYERS[clientIp].moveUp,
					moveDown:PLAYERS[clientIp].moveDown,
					run:PLAYERS[clientIp].run
				}
			}));
		}
	});
});


gameUpdate = function(){
	for(var i in PLAYERS){
		if(PLAYERS[i].bot){
			var v = 0;
			var h = 0;	
			
			if(PLAYERS[i].knockTime>0)
				PLAYERS[i].knockTime -= 1;

			
			if(PLAYERS[i].knockTime==0){
				if(PLAYERS[i].moveLeft){
					h -= 3 - 1.5*PLAYERS[i].run;
				}
				if(PLAYERS[i].moveRight){
					h += 3 - 1.5*PLAYERS[i].run;
				}
				if(PLAYERS[i].moveUp){
					v -= 3 - 1.5*PLAYERS[i].run;
				}
				if(PLAYERS[i].moveDown){
					v += 3 - 1.5*PLAYERS[i].run;
				}
				
				if((v!=0) && (h!=0)){
					v = v/Math.sqrt(2);
					h = h/Math.sqrt(2);
				}
				
			}else{
				h = Math.sin(PLAYERS[i].knockDir)*7;
				v = -Math.cos(PLAYERS[i].knockDir)*7;
			}
			
			var ox = h==0?0:(h<0?-12:12);
			var oy = v==0?0:(v<0?-12:12);
			var x = toTile(PLAYERS[i].x);
			var x1 = toTile(PLAYERS[i].x-12);
			var x2= toTile(PLAYERS[i].x+12);
			var xh = toTile(PLAYERS[i].x+h+ox);
			var y = toTile(PLAYERS[i].y);
			var y1 = toTile(PLAYERS[i].y-12);
			var y2= toTile(PLAYERS[i].y+12);
			var yv = toTile(PLAYERS[i].y+v+oy);
			
			
			if((PLAYERS[i].x+h-32 < 0) || (PLAYERS[i].x+h +32 >= mapW))
				h = 0;
			if((PLAYERS[i].y+v-32 < 0) || (PLAYERS[i].y+v +32 >= mapH))
				v = 0;

			if(v != 0 || h!=0){
				if(!walkable(map[y1][xh].type) || !walkable(map[y2][xh].type))
					h = 0;
				if(!walkable(map[yv][x1].type) || !walkable(map[yv][x2].type))
					v = 0;	
			}
			
			PLAYERS[i].x += h;
			PLAYERS[i].y += v;
		
			
			/*if(PLAYERS[i].bot){
				if(Math.abs(PLAYERS[i].rot - PLAYERS[i].botrot) < 0.09)
					PLAYERS[i].rot = PLAYERS[i].botrot;
				else if(PLAYERS[i].rot > PLAYERS[i].botrot)
					;
				else;
			}*/
			
		}
		
		PLAYERS[i].fakerot = PLAYERS[i].rot;
		
		if(PLAYERS[i].onAttack){
			if(PLAYERS[i].attackStage==3){
				PLAYERS[i].fakerot += 0.2*(5-PLAYERS[i].attackCount);
			}else if(PLAYERS[i].attackStage==2){
				PLAYERS[i].fakerot -= 0.4*(5-PLAYERS[i].attackCount) - 0.2*5; 
				
				for(var j in PLAYERS){	
					if(i != j){
						var dt = (PLAYERS[i].x - PLAYERS[j].x)*(PLAYERS[i].x - PLAYERS[j].x) + (PLAYERS[i].y - PLAYERS[j].y)*(PLAYERS[i].y - PLAYERS[j].y);
						var dir = -Math.atan2(PLAYERS[i].x - PLAYERS[j].x, PLAYERS[i].y - PLAYERS[j].y);

						if((dt <= 35*35) && (!PLAYERS[i].knock[PLAYERS[j].ip]))
							if((Math.abs(PLAYERS[i].rot - dir) <= 0.8) || (Math.abs(PLAYERS[i].rot + 2*Math.PI - dir) <= 0.8) || (Math.abs(PLAYERS[i].rot - 2*Math.PI - dir) <= 0.8)) {
								PLAYERS[j].hit(PLAYERS[i], dir);
								PLAYERS[i].knock[PLAYERS[j].ip] = true;
							}
						
					}
				}

			}else if(PLAYERS[i].attackStage==1){
				PLAYERS[i].fakerot += 0.1*(10-PLAYERS[i].attackCount) - 0.1*10;
			}
					
			if(PLAYERS[i].fakerot > Math.PI)
				PLAYERS[i].fakerot = PLAYERS[i].fakerot - 2*Math.PI;
			
			if(PLAYERS[i].fakerot < -Math.PI)
				PLAYERS[i].fakerot = 2*Math.PI + PLAYERS[i].fakerot;
			
			PLAYERS[i].attackCount -= 1;
			if(PLAYERS[i].attackCount < 0){
				PLAYERS[i].attackStage -= 1;
				if(PLAYERS[i].attackStage==2)
					PLAYERS[i].attackCount = 5;
				else if(PLAYERS[i].attackStage==1)
					PLAYERS[i].attackCount = 10;
			}
			
			if(PLAYERS[i].attackStage == 0){
				PLAYERS[i].onAttack = false;
				PLAYERS[i].attackStage = 0;			
				PLAYERS[i].attackCount = 0;	
			}
		}
	}

	var sendData = [];
	for(var i in PLAYERS){
		sendData.push({
			ip:PLAYERS[i].ip,
			rot:PLAYERS[i].rot
		});
	}	
	
	broadCast(JSON.stringify({	
		header: "update",
		data:{
			sv_tick:tick,
			data:sendData
		}
	}));
	
	tick = tick + 1;
},

gameSetup();

setInterval(gameUpdate, 1000/60);