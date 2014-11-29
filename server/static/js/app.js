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
    asteroids : [
    /*,
    { 
        loc : { x: 150, y:150 },
        direction : { x: 2, y : 2 },
        radius : 15
    }*/
    ],
    enemy_ships : [],
    bullets : [],
    control_center : null,
    ticks: 0
};


(function(){
    "use strict";
    var width = 1024;
    var height = 1024;
    var serverUrl = "";
    var BULLETSPEED = 8;

    gameModel.control_center = {
        radius: 30,
        loc : {
            x : width/2,
            y : height/2
        }
    };

    gameModel.fireBullet = function(angle, name){
        var radians = angle * (Math.PI/180.0);
        var newBullet = {
            loc : { x: width/2 , y : height/2 },
            direction : { x : Math.cos(radians) * BULLETSPEED, y : Math.sin(radians) * BULLETSPEED },
            radius : 5,
            angle: radians % Math.PI,
            name: name
        };
        gameModel.bullets.push(newBullet);
    }

    var gameCanvas = document.querySelector('#gameCanvas');
    var gameContext = gameCanvas.getContext('2d');
    gameContext.font="15px Verdana";

    gameModel.start = function(event){
        gameLoop();
    }

    gameModel.message = function(data){
        var serverSentModel = data;
        var angle = data[0] - 90;
        var name = data[1];
        gameModel.fireBullet(angle, name);
        //gameModel.asteroids = serverSentModel.asteroids;
        //gameModel.bullets = serverSentModel.bullets;
    }

    function drawModel(){
        gameContext.clearRect(0, 0, width, height);

        //Draw the control center
        drawCircle(gameModel.control_center.loc.x,
                gameModel.control_center.loc.y,
                gameModel.control_center.radius,
                'rgba(255,255,255,1)')

        //Draw the asteroids
        gameModel.asteroids.map(function(asteroid){
            drawCircle(asteroid.loc.x, asteroid.loc.y, asteroid.radius, 'rgba(255,0,0,0.5)')
        });
        
        //Draw the bullets
        gameModel.bullets.map(function(bullet){
            drawCircle(bullet.loc.x, bullet.loc.y, bullet.radius, 'rgba(0,255,0,0.5)');
            drawString(bullet.name, bullet.loc.x, bullet.loc.y, bullet.angle)
        });
    }

    function drawString(text, x, y, angle) {
         gameContext.save();
         gameContext.translate(x, y);
         gameContext.rotate(angle);
         gameContext.textAlign = "center";
         gameContext.fillText(text, 0, 0);
         gameContext.restore();
    }

    function getRnd(min, max) {
        return Math.random() * (max - min) + min;
    }

    function updateModel(){
        //Move the asteroid
        gameModel.ticks += 1;
        if (gameModel.ticks % 10 == 0) {
            var radians = getRnd(0,Math.PI * 2);
            console.log(radians);

            var dir = { x : -Math.cos(radians), y : -Math.sin(radians) };
            var x = width / 2 + (width / 2) * Math.cos(radians)
						var y = height / 2 + (height / 2) * Math.sin(radians)
            var loc = { x : x, y : y};
            gameModel.asteroids.push({ 
                loc : loc,
                direction : dir,
                radius : 15
            });

            for(var i = 0; i < 360; i+=20)
            	gameModel.fireBullet(i, "");
        }

        gameModel.asteroids.map(function(asteroid){
            asteroid.loc.x += asteroid.direction.x;
            asteroid.loc.y += asteroid.direction.y;
        });

        //Move the bullets
        gameModel.bullets.map(function(bullet){
            bullet.loc.x += bullet.direction.x;
            bullet.loc.y += bullet.direction.y;
        });

        //Detect collisions and out of bounds
        var gameIsOver = false;
        var newAsteroids = [];
        var newBullets = [];
        var blownUpBullets = [];
        gameModel.asteroids.map(function(asteroid){
            if (doesOverlap(asteroid, gameModel.control_center)){
                alert('GAME OVER!');
                gameIsOver = true;
                return;
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
                    break;
                };
            }

            if (!asteroidBlownUp){
                newAsteroids.push(asteroid);
            }
        });

        for (var j = 0; j != gameModel.bullets.length; ++j){
            var bullet = gameModel.bullets[j];
            if (isOutOfBounds(bullet)){
                gameModel.bullets.splice(j, 1);
                j += -1;
            };
        }

        gameModel.asteroids = newAsteroids;
        return gameIsOver;
    }

    function drawCircle(x, y, radius, strokeStyle){
        gameContext.beginPath();
        gameContext.fillStyle = strokeStyle;///'rgba(255,0,0,1)';
        gameContext.arc(x, y, radius, 0, 2 * Math.PI );
        gameContext.fill();
        gameContext.closePath();
    }

    function isOutOfBounds(object){
        if (object.loc.x < 0 || object.loc.x > width){
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
        if (!updateModel()){
            setTimeout(gameLoop, 30);
        }
    }
})();
