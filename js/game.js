// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

const BUTTON_UP = 38;
const BUTTON_DOWN = 40;
const BUTTON_RIGTH = 39;
const BUTTON_LEFT = 37;
const numStones = 5;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
const TOP = 32;
const BOT = canvas.height - 64;
const LEFT = 32;
const RIGTH = canvas.width - 64;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function() {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function() {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// Princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function() {
	princessReady = true;
};
princessImage.src = "images/princess.png";

// Stone image
var stoneReady = false;
var stoneImage = new Image();
stoneImage.onload = function() {
	stoneReady = true;
};
stoneImage.src = "images/stone.png";

// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function() {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

// Tower image
var towerReady = false;
var towerImage = new Image();
towerImage.onload = function() {
	towerReady = true;
};
towerImage.src = "images/tower.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var princess = {};
var princessesCaught = 0;
var stones = [];
var tower = {};
var monsters = [];
var numMonsters = 1;
var died = false;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

var isTouching = function(first, second) {
	return (first.x <= (second.x + 32)
		&& second.x <= (first.x + 32)
		&& first.y <= (second.y + 32)
		&& second.y <= (first.y + 32));
}

var isNear = function(arr, element) {
	for (var i = 0; i < arr.length; i++) {
		if (element == arr[i]) {
			continue;
		}
		if (isTouching(arr[i], element)) {
			return true;
		}
	}
	return false;
}

var checkPosition = function(element) {
	return (isTouching(hero, element) 
		|| isTouching(princess, element) 
		|| isNear(stones, element)
		|| isNear(monsters, element));
}

var getRandXPos = function() {
	return Math.floor(Math.random()*(RIGTH - LEFT)) + LEFT;
}

var getRandYPos = function() {
	return Math.floor(Math.random()*(BOT - TOP)) + TOP;
}

var setCenterPos = function(element) {
	element.x = canvas.width / 2;
	element.y = canvas.height / 2;
}

var setRandPos = function(element) {
	element.x = getRandXPos();
	element.y = getRandYPos();
}

// Initialize elements of array
var init = function(arr, size) {
	for (var i = 0; i < size; i++) {
		var element = {};
		arr[i] = element;
	}
}

// Reset the game when the player catches a princess
var reset = function() {
	init(stones, numStones);
	init(monsters, numMonsters);

	setCenterPos(hero);
	setCenterPos(tower);
	// Throw the princess somewhere on the screen randomly
	do {
		setRandPos(princess);
	} while (isTouching(hero, princess));
	for (var i in stones) {
		do {
			setRandPos(stones[i]);
		} while (checkPosition(stones[i]));
	}
	for (var i in monsters) {
		do {
			setRandPos(monsters[i]);
		} while (checkPosition(monsters[i]));
	}
};

var canMoveUp = function() {
	return (!isNear(stones, hero) && hero.y > TOP);
}

var canMoveDown = function() {
	return (!isNear(stones, hero) && hero.y < BOT);
}

var canMoveRigth = function() {
	return (!isNear(stones, hero) && hero.x < RIGTH);
}

var canMoveLeft = function() {
	return (!isNear(stones, hero) && hero.x > LEFT);
}

// Update game objects
var update = function (modifier) {
	if (died) {
		return;
	}
	var posBefore = {};
	posBefore.x = hero.x;
	posBefore.y = hero.y;
	if (BUTTON_UP in keysDown && canMoveUp()) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (BUTTON_DOWN in keysDown && canMoveDown()) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (BUTTON_LEFT in keysDown && canMoveLeft()) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (BUTTON_RIGTH in keysDown && canMoveRigth()) { // Player holding right
		hero.x += hero.speed * modifier;
	}
	if (isNear(stones, hero)) {
		hero.x = posBefore.x;
		hero.y = posBefore.y;
	}

	// Are they touching?
	if (isTouching(hero, princess)) {
		++princessesCaught;
		reset();
	}

	if (isNear(monsters, hero)) {
		died = true;
	}
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}
	if (stoneReady) {
		for (var i in stones) {
			ctx.drawImage(stoneImage, stones[i].x, stones[i].y);
		}
	}
	if (monsterReady) {
		for (var i in monsters) {
			ctx.drawImage(monsterImage, monsters[i].x, monsters[i].y)
		}
	}
	if (towerReady) {
		ctx.drawImage(towerImage, tower.x, tower.y);
	}
	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Princesses caught: " + princessesCaught, 32, 32);
	if (died) {
		ctx.fillText("Game Over", 200, 200);
	}
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
reset();
var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
