
var existingPlayers = [];


// Get current player id
var currentPlayerId = new Date().valueOf().toString(36) + Math.random().toString(36).substr(2);


// Initialize Firebase

var firebaseConfig = {
  apiKey: "REPLACE WITH YOUR FIREBASE PROJECT API KEY",
  authDomain: "REPLACE WITH YOUR FIREBASE PROJECT URL",
  databaseURL: "REPLACE WITH YOUR FIREBASE PROJECT DB",
  projectId: "REPLACE WITH YOUR FIREBASE PROJECT ID"
};

firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
var database = firebase.database();

// Write data to database
function writePlayerData(playerId, x, y) {
  database.ref('players/' + playerId).set({
    id: playerId,
    x: x,
    y: y
  });
}

var writePlayerDataThrottled = _.throttle(writePlayerData, 10);

database.ref('players/' + currentPlayerId).onDisconnect().remove();



// init game

kontra.init();

// load assets

kontra.assets.imagePath = 'images/';

kontra.assets.load('mapPack_tilesheet.png', 'sprites.png', 'mapTile_104.png')
.then(function() {


  var spriteSheet = kontra.spriteSheet({
    image: kontra.assets.images.sprites,
    frameWidth: 70,
    frameHeight: 97,
    animations: {
      walk: {
        frames: "0..1",
        frameRate: 5
      }
    }
  });

  // Read data from database
  var playersRef = firebase.database().ref('players/');
  playersRef.on('value', function(snapshot) {
    var playersObj = snapshot.val();

    if (playersObj) {
      var playersArray = _.values(playersObj);
      var otherPlayers = playersArray.filter(function (player) {
        return player.id != currentPlayerId;
      });

      otherPlayers.forEach(function (otherPlayer) {
        var otherPlayerSprite = _.findWhere(existingPlayers, {id: otherPlayer.id});

        if (otherPlayerSprite) {
          otherPlayerSprite.x = otherPlayer.x;
          otherPlayerSprite.y = otherPlayer.y;
        } else {
          var newSprite = createSprite(otherPlayer.id, otherPlayer.x, otherPlayer.y);
          existingPlayers.push(newSprite);
        }
      });

      console.log(otherPlayers);
    }
  });


  // PLAYERS

  window.sprite = kontra.sprite({
    x: getRandomCoordinateInBounds(),
    y: getRandomCoordinateInBounds(),
    width: 64,
    height: 64,
    animations: {
      walk: spriteSheet.animations.walk.clone()
    },
    update: function () {
      if (kontra.keys.pressed('left') && this.x >= 60){
        this.x -= 2;
        writePlayerDataThrottled(currentPlayerId, this.x, this.y);
      }
      else if (kontra.keys.pressed('right') && this.x <= 766) {
        this.x += 2;
        writePlayerDataThrottled(currentPlayerId, this.x, this.y);
      }

      if (kontra.keys.pressed('up') && this.y >= -2) {
        this.y -= 2;
        writePlayerDataThrottled(currentPlayerId, this.x, this.y);
      }
      else if (kontra.keys.pressed('down') && this.y <= 704) {
        this.y += 2;
        writePlayerDataThrottled(currentPlayerId, this.x, this.y);
      }
    }
  });

  // prevent default key behavior
  kontra.keys.bind(['up', 'down', 'left', 'right'], function(e) {
    e.preventDefault();
  });


  // create mushroom
  var mushroomSprite = createMushroomAndSave();

  var mushroomRef = firebase.database().ref('mushroom');
  mushroomRef.on('value', function(snapshot) {
    var mushroomData = snapshot.val();

    if (mushroomData) {
      mushroomSprite.x = mushroomData.x;
      mushroomSprite.y = mushroomData.y;
    }
  });


  // MAP

  window.tileEngine = kontra.tileEngine({
    // tile size
    tileWidth: 64,
    tileHeight: 64,
    // map size in tiles
    width: 14,
    height: 14
  });

  tileEngine.addTilesets({
    image: kontra.assets.images.mapPack_tilesheet
  });

  tileEngine.addLayers({
    name: 'water',
    data: [ 203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,
            203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203,  203
          ]
  });

  tileEngine.addLayers({
    name: 'ground',
    data: [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
            0,  6,  7,  7,  7,  7,  7,  7,  7,  7,  7,  7,  8,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25,  0,
            0, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 42,  0,
            0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
          ]
  });

  tileEngine.render();


  // GAME LOOP

  var points = 0;
  var pointsElem = document.getElementById("points");

  var loop = kontra.gameLoop({
    update: function () {
      sprite.update();
      sprite.animations.walk.update();
      mushroomSprite.update();

      existingPlayers.forEach(function (existingPlayer) {
        existingPlayer.update();
      });

      if (sprite.collidesWith(mushroomSprite)) {
        pointsElem.innerText = ++points;

        repositionMushroomAndSave();
      }
    },
    render: function () {
      tileEngine.render();
      mushroomSprite.render();
      sprite.animations.walk.render();
      sprite.render();

      existingPlayers.forEach(function (existingPlayer) {
        existingPlayer.render();
      });
    }
  });

  loop.start();


  function createSprite (id, x, y) {
    return kontra.sprite({
      id: id,
      x: x,
      y: y,
      width: 64,
      height: 64,
      animations: {
        walk: spriteSheet.animations.walk.clone()
      }
    });
  }

  function createMushroomAndSave () {
    var mushroomSprite = kontra.sprite({
      x: getRandomCoordinateInBounds(),
      y: getRandomCoordinateInBounds(),
      width: 64,
      height: 64,
      image: kontra.assets.images.mapTile_104
    });

    database.ref('mushroom').set({
      x: mushroomSprite.x,
      y: mushroomSprite.y
    });

    return mushroomSprite;
  }

  function repositionMushroomAndSave () {
    mushroomSprite.x = getRandomCoordinateInBounds();
    mushroomSprite.y = getRandomCoordinateInBounds();

    database.ref('mushroom').set({
      x: mushroomSprite.x,
      y: mushroomSprite.y
    });
  }

}).catch(function(err) {
  console.log("load assets error:", err);
});



function getRandomCoordinateInBounds () {
  return Math.floor((896-64-64-64)*Math.random()) + 64;
}






