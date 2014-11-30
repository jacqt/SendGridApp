socket = io.connect("/")

socket.on("connect", function () {
	gameModel.start();
});

socket.on("welcome", function (data) {
	console.log(data.message)
});

socket.on("data", function (data) {
	gameModel.message(data);
});



var gameModel = {
	fireBullet : null,
	asteroids : [],
	enemy_ships : [],
	bullets : [],
	control_center : null,
	ticks: 0,
	playerList : [],
    explodingObjects : [],
	gameOverTicks: 0,
    gameWidth: 1024,
    width: 1224,
    height : 1024,
    drawString : null
};


(function(){
	"use strict";
	var gamewidth = 1024;
	var width = 1224;
	var height = 1024;
	var serverUrl = "";
	var BULLETSPEED = 5;
	var ASTEROIDSPEED = 0.3;
	var ASTEROIDPERIOD = 250; //lower = more frequent

	gameModel.control_center = {
		radius: 30,
		loc : {
			x : gamewidth/2,
			y : height/2
		}
	};

	gameModel.fireBullet = function(angle, name, color){
		var radians = angle * (Math.PI/180.0);
		var newBullet = {
			loc : { x: gamewidth/2 , y : height/2 },
			direction : { x : Math.cos(radians) * BULLETSPEED, y : Math.sin(radians) * BULLETSPEED },
			radius : 5,
			angle: radians % Math.PI,
			name: name,
			color: color
		};
		gameModel.bullets.push(newBullet);
        gameModel.playBulletSound = true;
	}
    gameModel.drawString = drawString;

	var gameCanvas = document.querySelector('#gameCanvas');
	var gameContext = gameCanvas.getContext('2d');
	gameContext.font="15px Verdana";

  var body = document.querySelector('body');
  body.addEventListener('keydown', function(event) {
    if (event.keyCode == 65) {
      spawnAsteroid();
    }
  }, false);

	gameModel.start = function(event){
		gameLoop();
	}

	function playerColor(name) {
		var n = gameModel.playerList.length;
		for (var i = 0; i < n; i++) {
			if (gameModel.playerList[i].name === name) {
				return gameModel.playerList[i].color;
			}
		}
		return null;
	}

	function addPlayer(name, color) {
		gameModel.playerList.unshift({name: name, color: color});
		if(gameModel.playerList.length > 10)
			gameModel.playerList.pop();
	}

	function arraymove(arr, fromIndex, toIndex) {
		var element = arr[fromIndex]
		arr.splice(fromIndex, 1);
		arr.splice(toIndex, 0, element);
	}

	function updatePlayer(name) {
		var n = gameModel.playerList.n;
		for (var i = 0; i < n; i++) {
			if (gameModel.playerList[i].name == name) {
				arraymove(gameModel.playerList, i, 0);
				return;
			}
		}
	}

	gameModel.message = function(data){
		var serverSentModel = data;
		var angle = data[0] - 90;
		var name = data[1];

		var color = playerColor(name);
		if (color) {
			updatePlayer(name);
		} else {
			color = randomColor({luminosity: 'light', hue: 'random'});
			addPlayer(name, color);
		}

		gameModel.fireBullet(angle, name, color);
	}

	function drawModel(){
		if (gameModel.gameOverTicks > 0) {
			gameContext.save();
			gameContext.fillStyle = "rgba(0,0,0,0.1)";
			gameContext.fillRect(0, 0, width, height);
			gameContext.restore();
			drawString("GAME OVER", gamewidth / 2, height / 2, 0, "center", "white", false);
			return;
		}
		gameModel.gameIsOver = false;
		gameContext.clearRect(0, 0, width, height);
        Utils.drawBackground(gameContext);
		drawString("Send email to a@oxteroids.me with subject '0' to '360'", gamewidth / 2, 35, 0, "center", "white", false);
    drawString("...or Yo oxplays{up,down,left,right}", gamewidth / 2, 70, 0, "center", "white", false);

    //Draw the control center
    drawCircle(gameModel.control_center.loc.x,
    	gameModel.control_center.loc.y,
    	gameModel.control_center.radius,
    	'rgba(255,255,255,1)')

    //draw the exploding objects
    gameModel.explodingObjects.map(function(obj){
        obj.fragments.map(function(fragment){
            gameContext.save();
            gameContext.beginPath();
            gameContext.lineWidth = 3;
            gameContext.strokeStyle = 'rgba(255,0,0,1)';

            gameContext.beginPath();
            gameContext.arc(fragment.loc.x, fragment.loc.y, 15,  1.5*Math.PI + fragment.rotation, 1.7*Math.PI + fragment.rotation);
            gameContext.stroke();

            gameContext.closePath();
            gameContext.restore();
            
        });
    });

    //Draw the asteroids
    gameModel.asteroids.map(function(asteroid){
        //gameContext.strokeStyle = "rgba(0,0,0,0.1)";
    	drawCircle(asteroid.loc.x, asteroid.loc.y, asteroid.radius, 'rgba(255,0,0,1)', true)
    });

    //Draw the bullets
    gameModel.bullets.map(function(bullet){
    	drawCircle(bullet.loc.x, bullet.loc.y, bullet.radius, bullet.color);
    });

    var n = gameModel.playerList.length;
    for (var i = 0; i < n; i++) {
    	drawString(gameModel.playerList[i].name, width - 20, 120 + 35 * i, 0, "right", gameModel.playerList[i].color, true);
    }
  }

  function drawString(text, x, y, angle, textAlign, color, shorten, font) {
  	if (shorten && text.length > 12)
  		text = text.substring(0,10) + "...";

  	gameContext.save();
  	gameContext.translate(x, y);
  	gameContext.rotate(angle);
  	gameContext.textAlign = textAlign;
    gameContext.font="30px Verdana";
    if (font){
        gameContext.font = font;
    }
  	gameContext.fillStyle = color;
  	gameContext.fillText(text, 0, 0);
  	gameContext.restore();
  }

  function getRnd(min, max) {
  	return Math.random() * (max - min) + min;
  }

  function spawnAsteroid() {
      var radians = getRnd(0,Math.PI * 2);
      var mult = 1 + gameModel.ticks / 400;
      var dir = { x : -Math.cos(radians) * ASTEROIDSPEED * mult, y : -Math.sin(radians) * ASTEROIDSPEED * mult };
      var x = (gamewidth / 2) * (1 + Math.cos(radians))
      var y = (height / 2) * (1 + Math.sin(radians))
      var loc = { x : x, y : y};
      gameModel.asteroids.push({ 
        loc : loc,
        direction : dir,
        radius : 15
      });
  }

  function updateModel(){
  	if (gameModel.gameOverTicks > 0) {
  		gameModel.gameOverTicks -= 1;
      gameModel.ticks = 0;
  		return;
  	}

    //Move the asteroid
    if (gameModel.ticks % ASTEROIDPERIOD == 0) {
      spawnAsteroid();
    }

    gameModel.ticks += 1;

    gameModel.asteroids.map(function(asteroid){
    	asteroid.loc.x += asteroid.direction.x;
    	asteroid.loc.y += asteroid.direction.y;
    });

    //Move the bullets
    gameModel.bullets.map(function(bullet){
    	bullet.loc.x += bullet.direction.x;
    	bullet.loc.y += bullet.direction.y;
    });

    gameModel.explodingObjects.map(function(obj){
        obj.age += 1;
        obj.fragments.map(function(fragment){
            fragment.loc.x += fragment.direction.x;
            fragment.loc.y += fragment.direction.y;
            fragment.rotation += fragment.rotation_change;
        })
    })
    gameModel.explodingObjects = gameModel.explodingObjects.filter(function(obj){
        return obj.age < 25;
    });



    //Detect collisions and out of bounds
    var gameIsOver = false;
    var newAsteroids = [];
    var newBullets = [];
    var blownUpBullets = [];
    gameModel.asteroids.map(function(asteroid){
    	if (doesOverlap(asteroid, gameModel.control_center)){
    		gameModel.gameOverTicks = 100;
    		gameModel.gameIsOver = true;
            var sound = new Audio("js/assets/gameover.mp3");
            sound.play();
    	}

    	var asteroidBlownUp = false;

    	if (isOutOfBounds(asteroid)){
    		return;
    	}

    	for (var j = 0; j != gameModel.bullets.length; ++j){
    		var bullet = gameModel.bullets[j];
    		if (doesOverlap(asteroid, bullet)){
    			asteroidBlownUp = true;
    			gameModel.bullets.splice(j, 1);
                gameModel.playAsteroidExplosionSound = true;
                var _x = asteroid.loc.x;
                var _y = asteroid.loc.y;
                var newExplodingObject = {
                    age : 0,
                    fragments : []
                };
                for (var i = 0; i < 15; ++i){
                    newExplodingObject.fragments.push({
                        rotation : getRnd(0, 1.75 * Math.PI),
                        rotation_change : getRnd(-.05, 0.05),
                        loc : {
                            x : getRnd(_x, _x),
                            y : getRnd(_y, _y),
                        },
                        direction : {
                            x : getRnd(-1, 1),
                            y : getRnd(-1, 1),
                        }
                    });
                }
                gameModel.explodingObjects.push(newExplodingObject);
    			break;
    		};
    	}

    	if (!asteroidBlownUp){
    		newAsteroids.push(asteroid);
    	}
    });

    if (gameModel.gameIsOver) {
    	gameModel.bullets = [];
    	gameModel.playerList = [];
    	gameModel.asteroids = [];
    	return;
    }

    for (var j = 0; j != gameModel.bullets.length; ++j){
    	var bullet = gameModel.bullets[j];
    	if (isOutOfBounds(bullet)){
    		gameModel.bullets.splice(j, 1);
    		j += -1;
    	};
    }

    gameModel.asteroids = newAsteroids;
    if (gameModel.playBulletSound){
        var sound = new Audio("js/assets/phaser.wav");
        sound.play();
        gameModel.playBulletSound = false;
    }

    if (gameModel.playAsteroidExplosionSound){
        var sound = new Audio("js/assets/8bitexplosion.mp3");
        sound.play();
        gameModel.playAsteroidExplosionSound = false;
    }
    return gameIsOver;
  }

  function drawCircle(x, y, radius, strokeStyle, notFill){
  	gameContext.beginPath();
  	gameContext.fillStyle = strokeStyle;
    gameContext.lineWidth = 3;
    gameContext.strokeStyle = strokeStyle;
  	gameContext.arc(x, y, radius, 0, 2 * Math.PI );
    if (notFill){
        gameContext.stroke();
    } else {
        gameContext.fill();

    }
  	gameContext.closePath();
  }

  function isOutOfBounds(object){
  	if (object.loc.x < 0 || object.loc.x > gamewidth){
  		return true;
  	}
  	if (object.loc.y < 0 || object.loc.y > height){
  		return true;
  	}
  	return false;
  }


  function doesOverlap(object1, object2){
  	var loc1 = object1.loc;
  	var loc2 = object2.loc;

  	var minDistForCollision = object1.radius + object2.radius;
  	var dist = Math.sqrt(Math.pow(loc1.x - loc2.x, 2) + Math.pow(loc1.y - loc2.y, 2));
  	return (dist < minDistForCollision);
  }

  function gameLoop(){
  	drawModel();
  	updateModel();
  	setTimeout(gameLoop, 30);
  }
})();
