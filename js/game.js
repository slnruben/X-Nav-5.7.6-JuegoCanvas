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

// Green Monster image
var greenMonsterReady = false;
var greenMonsterImage = new Image();
greenMonsterImage.onload = function() {
	greenMonsterReady = true;
};
greenMonsterImage.src = "images/monsterGreen.png";

// Blue Monster image
var blueMonsterReady = false;
var blueMonsterImage = new Image();
blueMonsterImage.onload = function() {
	blueMonsterReady = true;
};
blueMonsterImage.src = "images/monsterBlue.png";

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
var princessesSaved = 0;
var stones = [];
var tower = {};
var greenMonsters = [];
var numGreenMonsters;
var blueMonsters = [];
var numBlueMonsters;
var died = false;
var greenMonstersSpeed = 86;
var blueMonstersSpeed = 56;
var level;

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
};

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
};

var checkStones = function(element) {
	return (isNear(stones, element));
};

var checkMonsters = function(element) {
	return (isNear(greenMonsters, element)
		|| isNear(blueMonsters, element));
}

var checkOverlap = function(element) {
	return (isTouching(hero, element) 
		|| checkStones(element)
		|| checkMonsters(element));
};

var getSign = function() {
	if (Math.random() < 0.5) {
		return -1;
	}
	return 1;
};

var getRandPos = function(min, max) {
	return Math.floor(Math.random()*(max - min)) + min;
};

var setCenterPos = function(element) {
	element.x = canvas.width / 2;
	element.y = canvas.height / 2;
};

var setRandPos = function(element) {
	element.x = getRandPos(RIGTH, LEFT);
	element.y = getRandPos(BOT, TOP);
};

// Initialize elements of array
var init = function(arr, size) {
	for (var i = 0; i < size; i++) {
		var element = {};
		arr[i] = element;
	}
};

// Reset the game when the player catches a princess
var reset = function() {
	level = princessesSaved / 10  || 1;
	numGreenMonsters = level;
	numBlueMonsters = level < 3 ? level: 4;

	init(stones, numStones);
	init(greenMonsters, numGreenMonsters);
	init(blueMonsters, numBlueMonsters);

	setCenterPos(hero);
	setCenterPos(tower);
	// Throw the princess somewhere on the screen randomly
	for (var i in stones) {
		do {
			setRandPos(stones[i]);
		} while (checkOverlap(stones[i]));
	}
	do {
		setRandPos(princess);
	} while (checkOverlap(princess));
	for (var i in greenMonsters) {
		do {
			setRandPos(greenMonsters[i]);
		} while (checkOverlap(greenMonsters[i]));
	}
	for (var i in blueMonsters) {
		do {
			setRandPos(blueMonsters[i]);
		} while (checkOverlap(blueMonsters[i]));
	}
};

var getPos = function(origin, destiny) {
	destiny.x = origin.x;
	destiny.y = origin.y;
};

var canMoveUp = function(y) {
	return (!isNear(stones, hero) && y > TOP);
};

var canMoveDown = function(y) {
	return (!isNear(stones, hero) && y < BOT);
};

var canMoveRigth = function(x) {
	return (!isNear(stones, hero) && x < RIGTH);
};

var canMoveLeft = function(x) {
	return (!isNear(stones, hero) && x > LEFT);
};

var moveMonsterClose = function(monsters, speed, modifier) {
	var aux = {};
	var posBefore = {};
	for (var i in monsters) {
		aux.x = hero.x - monsters[i].x;
		aux.y = hero.y - monsters[i].y;
		getPos(monsters[i], posBefore);
		monsters[i].x = monsters[i].x + Math.sign(aux.x) * speed * modifier;
		monsters[i].y = monsters[i].y + Math.sign(aux.y) * speed * modifier;
		if (checkStones(monsters[i])) {
			getPos(posBefore, monsters[i]);
		}
	}
}

// Parkinson Party
var moveMonsterRand = function(speed, modifier) {
	var posBefore = {};
	for (var i in greenMonsters) {
		getPos(greenMonsters[i], posBefore);
		greenMonsters[i].x = greenMonsters[i].x + getSign() * greenMonstersSpeed * modifier;
		greenMonsters[i].y = greenMonsters[i].y + getSign() * greenMonstersSpeed * modifier;
		if (isNear(stones, greenMonsters[i])) {
			getPos(posBefore, greenMonsters[i]);
		}
	}
};

// Update game objects
var update = function(modifier) {
	if (died) {
		return;
	}
	var posBefore = {};
	getPos(hero, posBefore);
	if (BUTTON_UP in keysDown && canMoveUp(hero.y)) { // Player holding up
		hero.y -= hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (BUTTON_DOWN in keysDown && canMoveDown(hero.y)) { // Player holding down
		hero.y += hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (BUTTON_LEFT in keysDown && canMoveLeft(hero.x)) { // Player holding left
		hero.x -= hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (BUTTON_RIGTH in keysDown && canMoveRigth(hero.x)) { // Player holding right
		hero.x += hero.speed * modifier;
		moveMonsterClose(greenMonsters, greenMonstersSpeed, modifier);
		//moveMonsterRand(modifier);
	}
	if (isNear(stones, hero)) {
		getPos(posBefore, hero);
	}
	moveMonsterClose(blueMonsters, blueMonstersSpeed, modifier);
	//moveMonsterRand(modifier);

	// Are they touching?
	if (isTouching(hero, princess)) {
		++princessesSaved;
		reset();
	}

	if (checkMonsters(hero)) {
		died = true;
	}
};

// Draw everything
var render = function() {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	if (towerReady) {
		ctx.drawImage(towerImage, tower.x, tower.y);
	}
	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}
	if (stoneReady) {
		for (var i in stones) {
			ctx.drawImage(stoneImage, stones[i].x, stones[i].y);
		}
	}
	if (greenMonsterReady) {
		for (var i in greenMonsters) {
			ctx.drawImage(greenMonsterImage, greenMonsters[i].x, greenMonsters[i].y)
		}
	}
	if (blueMonsterReady) {
		for (var i in blueMonsters) {
			ctx.drawImage(blueMonsterImage, blueMonsters[i].x, blueMonsters[i].y)
		}
	}
	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Level: " + Math.ceil(level), 32, 12);
	ctx.fillText("Princesses caught: " + princessesSaved, 32, 32);
	if (died) {
		ctx.fillText("Game Over", 200, 200);
	}
};

// The main game loop
var main = function() {
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
