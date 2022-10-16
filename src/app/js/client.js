//document.addEventListener('contextmenu', event => event.preventDefault());
var firebaseConfig = {
  apiKey: 'AIzaSyBCHZnGJXiu8l5qNZppgLaoV0p321-dQyg',
  authDomain: 'strategy-battles-fa32d.firebaseapp.com',
  databaseURL: 'https://strategy-battles-fa32d.firebaseio.com',
  projectId: 'strategy-battles-fa32d',
  storageBucket: 'strategy-battles-fa32d.appspot.com',
  messagingSenderId: '703940639443',
  appId: '1:703940639443:web:59220f0dda069a7fe5b226',
};
firebase.initializeApp(firebaseConfig);

// var test = 0;

// var count = 0;
// var lastTimePing = Date.now();

// const ping = firebase.database().ref().child('ping');

///////////////////////////////////////////////////////////////////////

var canvas = document.querySelector('canvas');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
var c = canvas.getContext('2d');

window.WebSocket = window.WebSocket || window.MozWebSocket;
var connection = new WebSocket('ws://' + location.host);

const scaleX = 1;
const scaleY = 1;
const mapTileWidth = 32;
const mapTileHeight = 32;
const tileWidth = 32;
const tileHeight = 32;
const screenWTiles = Math.ceil(canvas.width / (2 * tileWidth));
const screenHTiles = Math.ceil(canvas.height / (2 * tileHeight));

var playerName = 0,
  playerRot = 0,
  playerID = 0,
  isMapLoaded = false,
  isTileLoaded = false,
  isShadowLoaded = false,
  onMouse = false,
  chatting = false;

var map = [],
  mapWidth = 0,
  mapHeight = 0;
mapW = 0;
mapH = 0;

var currentFPS = 0,
  countFPS = 0;
(timeTotal = 0), (lastTime = 0), (currentPing = 0);
(pingTime = 0), (pingSent = false);
tick = 0;
sv_tick = 0;

var keys = [];
var monsters = [];
var clouds = [];

class Player {
  constructor(name, ip) {
    this.name = name;
    this.ip = ip;
    this.x = 0;
    this.y = 0;
    this.rot = 0;
    this.fakerot = 0;
    this.health = 100;
    this.armor = 'None';
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.run = false;
    this.onAttack = false;
    this.attackStage = 0;
    this.attackCount = 0;
    this.knockTime = 0;
    this.knockDir = 0;
    this.knock = {};
    this.botrot = 0;
    this.bot = false;
  }
}

var PLAYERS = {};
for (var i = 0; i < 255; i++) keys[i] = false;

getRelativeToMapWidth = function (x) {
  var mapW = mapWidth * tileWidth;
  return x >= mapW ? x - mapW : x < 0 ? x + mapW : x;
};

getRelativeToMapHeight = function (y) {
  var mapH = mapHeight * tileHeight;
  return y >= mapH ? y - mapH : y < 0 ? y + mapH : y;
};

toTile = function (x) {
  return Math.floor(x / tileWidth);
};

walkable = function (type) {
  if (type >= 1 && type <= 4) return false;
  return true;
};

drawScaleRect = function (x, y, width, height) {
  c.rect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(width * scaleX), Math.ceil(height * scaleY));
};

drawScaleImage = function (img, x, y, width, height) {
  c.drawImage(
    img,
    Math.floor(x * scaleX),
    Math.floor(y * scaleY),
    Math.ceil(width * scaleX),
    Math.ceil(height * scaleY)
  );
};

drawScaleCropImage = function (img, sx, sy, sw, sh, x, y, width, height) {
  c.drawImage(
    img,
    sx,
    sy,
    sw,
    sh,
    Math.floor(x * scaleX),
    Math.floor(y * scaleY),
    Math.ceil(width * scaleX),
    Math.ceil(height * scaleY)
  );
};

var Img = {};
Img.tiles = [];
Img.shadows = [];
Img.tileset = new Image();
Img.tileset.src = '/client/img/default_dust.png';
Img.tileShadow = new Image();
Img.tileShadow.src = '/client/img/tileshadow.png';
Img.cloud = new Image();
Img.cloud.src = '/client/img/cloud.png';
Img.player = new Image();
Img.player.src = '/client/img/player.png';
Img.playerShadow = new Image();
Img.playerShadow.src = '/client/img/playershadow.png';
Img.monster = new Image();
Img.monster.src = '/client/img/monster.png';
Img.mapShadow = new Image();
Img.mapShadow.src = '/client/img/shadowmap.png';

Img.effect = {};
Img.effect.blood = new Image();
Img.effect.blood.src = '/client/img/blood.png';
Img.effect.explosion = new Image();
Img.effect.explosion.src = '/client/img/explosion.png';

Img.tileset.onload = function () {
  loadTiles();
};

Img.mapShadow.onload = function () {
  loadMapShadow();
};

loadTiles = function () {
  tilesW = Img.tileset.width / tileWidth;
  tilesH = Img.tileset.height / tileHeight;
  for (var y = 0; y < tilesH; y++)
    for (var x = 0; x < tilesW; x++) {
      Img.tiles.push({
        x: x * tileWidth,
        y: y * tileHeight,
        w: tileWidth,
        h: tileWidth,
      });
    }
  isTileLoaded = true;
};

loadMapShadow = function () {
  shadowW = Img.mapShadow.width / tileWidth;
  shadowH = Img.mapShadow.height / tileHeight;
  for (var y = 0; y < shadowH; y++)
    for (var x = 0; x < shadowW; x++) {
      Img.shadows.push({
        x: x * tileWidth,
        y: y * tileHeight,
        w: tileWidth,
        h: tileWidth,
      });
    }

  isShadowLoaded = true;
};

loadMap = function () {
  for (var y = 0; y < mapHeight; y++)
    for (var x = 0; x < mapWidth; x++) {
      map[y][x].sd = 0;
      if (map[y][x].type == 1 || map[y][x].type == 5) map[y][x].sd = 2;
      if (map[y][x].type == 2) map[y][x].sd = 1;

      var sd = 0;

      if (map[y][x].sd == 0) {
        if (x - 1 >= 0) sd += map[y][x - 1].sd * 3;
        if (y - 1 >= 0) sd += map[y - 1][x].sd;
        if (x - 1 >= 0 && y - 1 >= 0) sd += map[y - 1][x - 1].sd * 9;

        switch (sd) {
          case 1:
            map[y][x].sdId = 3;
            break;
          case 2:
            map[y][x].sdId = 2;
            break;
          case 3:
            map[y][x].sdId = 9;
            break;
          case 4:
          case 13:
          case 22:
            map[y][x].sdId = 13;
            break;
          case 5:
          case 14:
          case 23:
            map[y][x].sdId = 11;
            break;
          case 6:
            map[y][x].sdId = 8;
            break;
          case 7:
          case 16:
          case 25:
            map[y][x].sdId = 12;
            break;
          case 8:
          case 17:
          case 26:
            map[y][x].sdId = 10;
            break;
          case 9:
            map[y][x].sdId = 5;
            break;
          case 10:
            map[y][x].sdId = 1;
            break;
          case 11:
            map[y][x].sdId = 16;
            break;
          case 12:
            map[y][x].sdId = 7;
            break;
          case 15:
            map[y][x].sdId = 14;
            break;
          case 18:
            map[y][x].sdId = 4;
            break;
          case 19:
            map[y][x].sdId = 17;
            break;
          case 20:
            map[y][x].sdId = 0;
            break;
          case 21:
            map[y][x].sdId = 15;
            break;
          case 24:
            map[y][x].sdId = 6;
            break;
          default:
            map[y][x].sdId = -1;
        }
      } else if (map[y][x].sd == 1) {
        if (x - 1 >= 0) sd += Math.floor(map[y][x - 1].sd / 2) * 2;
        if (y - 1 >= 0) sd += Math.floor(map[y - 1][x].sd / 2);
        if (x - 1 >= 0 && y - 1 >= 0) sd += Math.floor(map[y - 1][x - 1].sd / 2) * 4;

        switch (sd) {
          case 1:
            map[y][x].sdId = 3;
            break;
          case 2:
            map[y][x].sdId = 9;
            break;
          case 3:
          case 7:
            map[y][x].sdId = 13;
            break;
          case 4:
            map[y][x].sdId = 5;
            break;
          case 5:
            map[y][x].sdId = 1;
            break;
          case 6:
            map[y][x].sdId = 7;
            break;
          default:
            map[y][x].sdId = -1;
        }
      }
    }
  isMapLoaded = true;
};

connection.onopen = function () {
  console.log('Open:');
};

connection.onerror = function (error) {
  console.log('Error:');
};

connection.addEventListener('message', event => {
  var msg = JSON.parse(event.data);
  var header = msg.header;
  var data = msg.data;

  if (header === 'load') {
    map = data.map;
    tick = data.sv_tick;
    mapWidth = map[0].length;
    mapHeight = map.length;
    mapW = mapWidth * tileWidth;
    mapH = mapHeight * tileHeight;
    playerID = data.id;
    loadMap();
    var name = playerID.replace(/\./g, '-');
    test = firebase
      .database()
      .ref()
      .child(name + '/rot');
  } else if (header === 'chatUpdate') {
    var chatBox = document.getElementById('chatBox');
    chatBox.innerHTML =
      chatBox.innerHTML +
      '<div style="color:#ff0000"><b>' +
      data.name +
      ': <span style="color:#000000">' +
      data.msg +
      '</span></b></div>';
    chatBox.scrollTop = chatBox.scrollHeight;
  } else if (header === 'p') {
    pingSent = false;
    currentPing = Date.now() - pingTime;
  } else if (header === 'newPlayer') {
    for (i in data) {
      delete PLAYERS[data[i].ip];
      PLAYERS[data[i].ip] = new Player(data[i].name, data[i].ip);
      PLAYERS[data[i].ip].name = data[i].name;
      PLAYERS[data[i].ip].ip = data[i].ip;
      PLAYERS[data[i].ip].x = data[i].x;
      PLAYERS[data[i].ip].y = data[i].y;
      PLAYERS[data[i].ip].rot = data[i].rot;
      PLAYERS[data[i].ip].fakerot = data[i].fakerot;
      PLAYERS[data[i].ip].health = data[i].health;
      PLAYERS[data[i].ip].armor = data[i].armor;
      PLAYERS[data[i].ip].moveLeft = data[i].moveLeft;
      PLAYERS[data[i].ip].moveRight = data[i].moveRight;
      PLAYERS[data[i].ip].moveUp = data[i].moveUp;
      PLAYERS[data[i].ip].moveDown = data[i].moveDown;
      PLAYERS[data[i].ip].run = data[i].run;
      PLAYERS[data[i].ip].onAttack = data[i].onAttack;
      PLAYERS[data[i].ip].attackStage = data[i].attackStage;
      PLAYERS[data[i].ip].attackCount = data[i].attackCount;
      PLAYERS[data[i].ip].knockTime = data[i].knockTime;
      PLAYERS[data[i].ip].knockDir = data[i].knockDir;
      PLAYERS[data[i].ip].knock = data[i].knock;
      PLAYERS[data[i].ip].botrot = data[i].botrot;
      PLAYERS[data[i].ip].bot = data[i].bot;
    }
  } else if (header === 'deletePlayer') {
    delete PLAYERS[data];
  } else if (header === 'updateMovement') {
    if (playerID != data.ip && PLAYERS[data.ip] != undefined) {
      PLAYERS[data.ip].x = data.x;
      PLAYERS[data.ip].y = data.y;
      PLAYERS[data.ip].moveLeft = data.moveLeft;
      PLAYERS[data.ip].moveRight = data.moveRight;
      PLAYERS[data.ip].moveUp = data.moveUp;
      PLAYERS[data.ip].moveDown = data.moveDown;
      PLAYERS[data.ip].run = data.run;
    }
    //console.log(PLAYERS[data.ip]);
  } else if (header === 'updateSpawn') {
    if (PLAYERS[data.ip] != undefined) {
      PLAYERS[data.ip].x = data.x;
      PLAYERS[data.ip].y = data.y;
    }
  } else if (header === 'updateAttack') {
    PLAYERS[data.ip].onAttack = data.onAttack;
    PLAYERS[data.ip].attackStage = data.attackStage;
    PLAYERS[data.ip].attackCount = data.attackCount;
    PLAYERS[data.ip].knock = data.knock;
  } else if (header === 'updateRot') {
    PLAYERS[data.ip].rot = data.rot;
    //console.log(data);
  } else if (header === 'updateInfo') {
    PLAYERS[data.ip].health = data.health;
    PLAYERS[data.ip].armor = data.armor;
    PLAYERS[data.ip].knockTime = data.knockTime;
    PLAYERS[data.ip].knockDir = data.knockDir;
    //console.log(data);
  } else if (header === 'requestUpdate') {
    for (i in data.data) {
      PLAYERS[data.data[i].ip].x = data.data[i].x;
      PLAYERS[data.data[i].ip].y = data.data[i].y;
    }
  } else if (header === 'update') {
    sv_tick = data.sv_tick + Math.floor((currentPing * 30) / 1000);
    //console.log("sv_tick: " + sv_tick + "          tick:" + tick);
    //console.log(Math.floor(currentPing*30/1000));
    for (i in data.data) {
      PLAYERS[data.data[i].ip].rot = data.data[i].rot;
    }
  }
});

mapUpdate = function (style) {
  if (PLAYERS[playerID] != undefined) {
    var startX = Math.max(0, Math.floor(PLAYERS[playerID].x / tileWidth) - screenWTiles);
    var startY = Math.max(0, Math.floor(PLAYERS[playerID].y / tileHeight) - screenHTiles);
    var endX = Math.min(mapWidth, Math.ceil(PLAYERS[playerID].x / tileWidth) + screenWTiles);
    var endY = Math.min(mapHeight, Math.ceil(PLAYERS[playerID].y / tileHeight) + screenHTiles);

    for (var y = startY; y < endY; y++)
      for (var x = startX; x < endX; x++) {
        c.beginPath();
        var tileId = map[y][x].id;
        var tileType = map[y][x].type;

        if (style === 'tileshadow_obstacle' && map[y][x].type == 2)
          drawScaleImage(
            Img.tileShadow,
            x * mapTileWidth - PLAYERS[playerID].x + canvas.width / 2 - 2,
            y * mapTileHeight - PLAYERS[playerID].y + canvas.height / 2 - 2,
            36,
            36
          );
        else if (style === 'tileshadow_wall' && map[y][x].type == 1)
          drawScaleImage(
            Img.tileShadow,
            x * mapTileWidth - PLAYERS[playerID].x + canvas.width / 2 - 2,
            y * mapTileHeight - PLAYERS[playerID].y + canvas.height / 2 - 2,
            36,
            36
          );
        else if (style === 'floor' && (map[y][x].type == 0 || map[y][x].type >= 10))
          drawScaleCropImage(
            Img.tileset,
            Img.tiles[tileId].x,
            Img.tiles[tileId].y,
            Img.tiles[tileId].w,
            Img.tiles[tileId].h,
            x * mapTileWidth - PLAYERS[playerID].x + canvas.width / 2,
            y * mapTileHeight - PLAYERS[playerID].y + canvas.height / 2,
            mapTileWidth,
            mapTileHeight
          );
        else if (style === 'obstacle' && map[y][x].type == 2)
          drawScaleCropImage(
            Img.tileset,
            Img.tiles[tileId].x,
            Img.tiles[tileId].y,
            Img.tiles[tileId].w,
            Img.tiles[tileId].h,
            x * mapTileWidth - PLAYERS[playerID].x + canvas.width / 2,
            y * mapTileHeight - PLAYERS[playerID].y + canvas.height / 2,
            mapTileWidth,
            mapTileHeight
          );
        else if (style === 'wall' && map[y][x].type == 1)
          drawScaleCropImage(
            Img.tileset,
            Img.tiles[tileId].x,
            Img.tiles[tileId].y,
            Img.tiles[tileId].w,
            Img.tiles[tileId].h,
            x * mapTileWidth - PLAYERS[playerID].x + canvas.width / 2,
            y * mapTileHeight - PLAYERS[playerID].y + canvas.height / 2,
            mapTileWidth,
            mapTileHeight
          );
        c.closePath();
      }
  }
};

playersUpdate = function () {
  for (i in PLAYERS) {
    var rot;
    if (!PLAYERS[i].onAttack) rot = PLAYERS[i].id == playerID ? playerRot : PLAYERS[i].rot;
    else rot = PLAYERS[i].fakerot;
    c.beginPath();
    c.save();

    c.drawImage(
      Img.playerShadow,
      PLAYERS[i].x - PLAYERS[playerID].x + canvas.width / 2 - Img.playerShadow.width / 2,
      PLAYERS[i].y - PLAYERS[playerID].y + canvas.height / 2 - Img.playerShadow.height / 2,
      Img.playerShadow.width,
      Img.playerShadow.height
    );
    c.translate(
      PLAYERS[i].x - PLAYERS[playerID].x + canvas.width / 2,
      PLAYERS[i].y - PLAYERS[playerID].y + canvas.height / 2
    );
    c.rotate(rot);
    c.drawImage(Img.player, -Img.player.width / 2, -Img.player.height / 2, Img.player.width, Img.player.height);
    c.restore();
    c.closePath();
  }
};

shadowUpdate = function () {
  if (PLAYERS[playerID] != undefined) {
    var startX = Math.max(0, Math.floor(PLAYERS[playerID].x / tileWidth) - screenWTiles);
    var startY = Math.max(0, Math.floor(PLAYERS[playerID].y / tileHeight) - screenHTiles);
    var endX = Math.min(mapWidth, Math.ceil(PLAYERS[playerID].x / tileWidth) + screenWTiles);
    var endY = Math.min(mapHeight, Math.ceil(PLAYERS[playerID].y / tileHeight) + screenHTiles);

    for (var y = startY; y < endY; y++)
      for (var x = startX; x < endX; x++) {
        c.beginPath();
        if (map[y][x].sd == 0 && map[y][x].sdId >= 0) {
          drawScaleCropImage(
            Img.mapShadow,
            Img.shadows[map[y][x].sdId].x,
            Img.shadows[map[y][x].sdId].y,
            Img.shadows[map[y][x].sdId].w,
            Img.shadows[map[y][x].sdId].h,
            x * mapTileWidth - PLAYERS[playerID].x + canvas.width / 2,
            y * mapTileHeight - PLAYERS[playerID].y + canvas.height / 2,
            mapTileWidth,
            mapTileHeight
          );
        } else if (map[y][x].sd == 1 && map[y][x].sdId >= 0) {
          drawScaleCropImage(
            Img.mapShadow,
            Img.shadows[map[y][x].sdId].x,
            Img.shadows[map[y][x].sdId].y,
            Img.shadows[map[y][x].sdId].w,
            Img.shadows[map[y][x].sdId].h,
            x * mapTileWidth - PLAYERS[playerID].x + canvas.width / 2,
            y * mapTileHeight - PLAYERS[playerID].y + canvas.height / 2,
            mapTileWidth,
            mapTileHeight
          );
        }

        c.closePath();
      }
  }
};

statsUpdate = function () {
  c.beginPath();
  c.font = '9pt Arial';
  c.fillStyle = 'white';
  c.textAlign = 'right';
  c.fillText('Ping: ' + currentPing + ' ms   ' + currentFPS + ' fps', canvas.width - 10, 20);

  for (i in PLAYERS) {
    c.fillStyle = 'blue';
    c.textAlign = 'center';
    c.font = 'bold 9pt Arial';
    c.fillText(
      PLAYERS[i].name,
      PLAYERS[i].x - PLAYERS[playerID].x + canvas.width / 2,
      PLAYERS[i].y - PLAYERS[playerID].y + canvas.height / 2 + 30
    );
  }

  c.textAlign = 'right';
  c.fillStyle = 'rgba(255, 255, 255, 0.8)';
  c.fillText('Armor', canvas.width - 25, canvas.height - 120);
  c.font = 'bold 12pt Arial';
  c.fillText('Health', canvas.width - 25, canvas.height - 60);
  c.fillText(PLAYERS[playerID].armor, canvas.width - 20, canvas.height - 100);

  c.font = 'bold 30pt Arial';
  c.fillText(PLAYERS[playerID].health, canvas.width - 20, canvas.height - 20);

  c.closePath();
};

lastTime = Date.now();

(gameDrawLoop = function () {
  if (isMapLoaded && isTileLoaded && isShadowLoaded) {
    c.clearRect(0, 0, canvas.width, canvas.height);
    mapUpdate('floor');
    mapUpdate('tileshadow_obstacle');
    mapUpdate('obstacle');
    shadowUpdate();
    playersUpdate();
    mapUpdate('tileshadow_wall');
    mapUpdate('wall');
    statsUpdate();

    var now = Date.now();
    var delta = now - lastTime;
    timeTotal += delta;
    countFPS++;
    lastTime = now;
    if (timeTotal >= 1000) {
      timeTotal -= 1000;
      currentFPS = countFPS;
      countFPS = 0;

      if (!pingSent) {
        pingSent = true;
        pingTime = Date.now();
        if (connection.readyState == connection.OPEN) connection.send(JSON.stringify({ header: 'p', data: '' }));
      }

      // ping.set(count);
      // lastTimePing = Date.now();
      // count++;
    }
  }

  window.requestAnimationFrame(gameDrawLoop);
}),
  (gameLoop = function () {
    while (tick <= sv_tick) {
      for (var i in PLAYERS) {
        var v = 0;
        var h = 0;

        if (PLAYERS[i].knockTime > 0) PLAYERS[i].knockTime -= 1;

        if (PLAYERS[i].knockTime == 0) {
          if (PLAYERS[i].moveLeft) {
            h -= 3 - 1.5 * PLAYERS[i].run;
          }
          if (PLAYERS[i].moveRight) {
            h += 3 - 1.5 * PLAYERS[i].run;
          }
          if (PLAYERS[i].moveUp) {
            v -= 3 - 1.5 * PLAYERS[i].run;
          }
          if (PLAYERS[i].moveDown) {
            v += 3 - 1.5 * PLAYERS[i].run;
          }

          if (v != 0 && h != 0) {
            v = v / Math.sqrt(2);
            h = h / Math.sqrt(2);
          }
        } else {
          h = Math.sin(PLAYERS[i].knockDir) * 7;
          v = -Math.cos(PLAYERS[i].knockDir) * 7;
        }

        var ox = h == 0 ? 0 : h < 0 ? -12 : 12;
        var oy = v == 0 ? 0 : v < 0 ? -12 : 12;
        var x = toTile(PLAYERS[i].x);
        var x1 = toTile(PLAYERS[i].x - 12);
        var x2 = toTile(PLAYERS[i].x + 12);
        var xh = toTile(PLAYERS[i].x + h + ox);
        var y = toTile(PLAYERS[i].y);
        var y1 = toTile(PLAYERS[i].y - 12);
        var y2 = toTile(PLAYERS[i].y + 12);
        var yv = toTile(PLAYERS[i].y + v + oy);

        if (PLAYERS[i].x + h - 32 < 0 || PLAYERS[i].x + h + 32 >= mapW) h = 0;
        if (PLAYERS[i].y + v - 32 < 0 || PLAYERS[i].y + v + 32 >= mapH) v = 0;

        if (v != 0 || h != 0) {
          if (!walkable(map[y1][xh].type) || !walkable(map[y2][xh].type)) h = 0;
          if (!walkable(map[yv][x1].type) || !walkable(map[yv][x2].type)) v = 0;
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

        PLAYERS[i].fakerot = PLAYERS[i].rot;

        if (PLAYERS[i].onAttack) {
          if (PLAYERS[i].attackStage == 3) {
            PLAYERS[i].fakerot += 0.2 * (5 - PLAYERS[i].attackCount);
          } else if (PLAYERS[i].attackStage == 2) {
            PLAYERS[i].fakerot -= 0.4 * (5 - PLAYERS[i].attackCount) - 0.2 * 5;
          } else if (PLAYERS[i].attackStage == 1) {
            PLAYERS[i].fakerot += 0.1 * (10 - PLAYERS[i].attackCount) - 0.1 * 10;
          }

          if (PLAYERS[i].fakerot > Math.PI) PLAYERS[i].fakerot = PLAYERS[i].fakerot - 2 * Math.PI;

          if (PLAYERS[i].fakerot < -Math.PI) PLAYERS[i].fakerot = 2 * Math.PI + PLAYERS[i].fakerot;

          PLAYERS[i].attackCount -= 1;
          if (PLAYERS[i].attackCount < 0) {
            PLAYERS[i].attackStage -= 1;
            if (PLAYERS[i].attackStage == 2) PLAYERS[i].attackCount = 5;
            else if (PLAYERS[i].attackStage == 1) PLAYERS[i].attackCount = 10;
          }

          if (PLAYERS[i].attackStage == 0) {
            PLAYERS[i].onAttack = false;
            PLAYERS[i].attackStage = 0;
            PLAYERS[i].attackCount = 0;
          }
        }
      }
      tick = tick + 1;
    }

    if (connection.readyState == connection.OPEN && PLAYERS[playerID] != undefined) {
      connection.send(
        JSON.stringify({ header: 'rot', data: { rot: playerRot, x: PLAYERS[playerID].x, y: PLAYERS[playerID].y } })
      );
      test.set(playerRot);
    }
    if (PLAYERS[playerID] != undefined)
      if (!PLAYERS[playerID].onAttack && onMouse)
        if (connection.readyState == connection.OPEN)
          connection.send(JSON.stringify({ header: 'sendMouse', data: '' }));
  }),
  (window.onkeydown = window.onkeyup =
    function (event) {
      event = event || window.event;
      var target = event.target || event.srcElement;
      var targetTagName = target.nodeType == 1 ? target.nodeName.toUpperCase() : '';
      keys[event.keyCode] = event.type == 'keydown';
      var code = event.keyCode;
      if (
        !chatting &&
        (code == 65 ||
          code == 37 ||
          code == 68 ||
          code == 39 ||
          code == 87 ||
          code == 38 ||
          code == 83 ||
          code == 40 ||
          code == 16)
      ) {
        connection.send(
          JSON.stringify({
            header: 'sendKey',
            data: {
              code: code,
              status: keys[code],
            },
          })
        );
        if (PLAYERS[playerID] != undefined) {
          if (code == 65 || code == 37) {
            PLAYERS[playerID].moveLeft = keys[code];
          }
          if (code == 68 || code == 39) {
            PLAYERS[playerID].moveRight = keys[code];
          } else if (code == 87 || code == 38) {
            PLAYERS[playerID].moveUp = keys[code];
          } else if (code == 83 || code == 40) {
            PLAYERS[playerID].moveDown = keys[code];
          } else if (code == 16) {
            PLAYERS[playerID].run = keys[code];
          }
        }
      }

      if (event.keyCode == 13) {
        if (keys[event.keyCode]) {
          if (!chatting) {
            document.getElementById('chatMsg').focus();
            chatting = true;
            connection.send(JSON.stringify({ header: 'chatting', data: '' }));
          } else {
            var chatMsg = document.getElementById('chatMsg').value;
            if (!(chatMsg === '')) {
              document.getElementById('chatMsg').value = '';
              connection.send(JSON.stringify({ header: 'chat', data: chatMsg }));
            }
            chatting = false;
            document.getElementById('chatMsg').blur();
          }
        }
      } else if (event.keyCode == 27) {
        chatting = false;
        document.getElementById('chatMsg').blur();
        document.getElementById('chatMsg').value = '';
      }
    });

chatFocus = function () {
  chatting = true;
  if (connection.readyState == connection.OPEN) connection.send(JSON.stringify({ header: 'chatting', data: '' }));
};

chatUnFocus = function () {
  chatting = false;
};

requestUpdate = function () {
  if (connection.readyState == connection.OPEN)
    connection.send(
      JSON.stringify({
        header: 'requestUpdate',
        data: '',
      })
    );
};

window.onmousedown = function (event) {
  onMouse = true;
};

window.onmouseup = function (event) {
  onMouse = false;
};

window.onmousemove = function (e) {
  var gameScreen = document.getElementById('gameScreen');
  var x = e.pageX - $('#gameScreen').offset().left;
  var y = e.pageY - $('#gameScreen').offset().top;
  playerRot = -Math.atan2(gameScreen.offsetWidth / 2 - x, gameScreen.offsetHeight / 2 - y);
};

window.requestAnimationFrame(gameDrawLoop);
setInterval(gameLoop, 1000 / 60);
setInterval(requestUpdate, 1000);

///////////////////////////////////////////////

///////////////////////////////////////////////////////////

// ping.on('value', snap => {
// console.log(Date.now()-lastTime);
// });
