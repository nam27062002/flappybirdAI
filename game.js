let delection = {}
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
var checkclick = false
var b = 0
var bdemo = 0
function E(x) {
	var k = parseInt((x - 0.05) / 0.016)
	if (k > 20) {
		k = 20
	}
	if ( k < 0){
		k = 0
	}
	return k
}
function onResults(results) {
	delection = results
	if (typeof (delection.multiHandLandmarks[0]) != "undefined") {
		const data = [Object.values((delection.multiHandLandmarks[0])[4]), Object.values((delection.multiHandLandmarks[0])[8])]
		var res = 0
		for (let i = 0; i < 3; i++) {
			res += (data[1][i] - data[0][i]) * (data[1][i] - data[0][i])
		}
		res = Math.sqrt(res)
		if (res < 0.06 && !checkclick) {
			b++
			console.log(b)
			checkclick = true
		}
		else if (res >= 0.06){
			checkclick = false
		}
		if (!onGame)
			distanceY = 100 + E(res) * 5
	}
	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	canvasCtx.drawImage(
		results.image, 0, 0, canvasElement.width, canvasElement.height);
	if (results.multiHandLandmarks) {
		for (const landmarks of results.multiHandLandmarks) {
			drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
				{ color: '#00FF00', lineWidth: 5 });
			drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 2 });
		}
	}
	canvasCtx.restore();
}

const hands = new Hands({
	locateFile: (file) => {
		return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
	}
});
hands.setOptions({
	maxNumHands: 2,
	modelComplexity: 1,
	minDetectionConfidence: 0.8,
	minTrackingConfidence: 0.5
});
hands.onResults(onResults);
const camera = new Camera(videoElement, {
	onFrame: async () => {
		await hands.send({ image: videoElement });
	}
});
camera.start();

kaboom({
	global: true,
	fullscreen: true,
	scale: 1,
	debug: true,
});
// value
const scaleDisplay = [400, 700]
const yFloor = 100
var posFloor = [width() / 2, width() / 2 + scaleDisplay[0]]
const speed = 100
distanceX = 250
tubeX = 70
distanceY = 150
var onGame = false
// function
$(".output_canvas").attr("width", (width() - scaleDisplay[0]) / 2)
$(".output_canvas").attr("height", ((width() - scaleDisplay[0]) / 2) * 6 / 9)
// random
function randomInRange(start, end) {
	return Math.floor(Math.random() * (350 - 50 + 1) + 50);
}
function drawTube(index, r = 0) {
	var x = randomInRange()
	add([
		sprite("tube", { width: tubeX, height: x }),
		area(),
		pos((width() - scaleDisplay[0]) / 2 + distanceX * (index + 2) - r, (height() - scaleDisplay[1]) / 2),
		'tubeDown',
		{ passed: false, },
	])
	add([
		sprite("tubeUp", { width: tubeX, height: scaleDisplay[1] - yFloor - distanceY - x }),
		area(),
		pos((width() - scaleDisplay[0]) / 2 + distanceX * (index + 2) - r, (height() - scaleDisplay[1]) / 2 + x + distanceY),
		'tubeUp',
	])

}
// Load images
loadSprite("background", "assets/background-night.png")
loadSprite("floor", "assets/floor.png")
loadSprite("black", "assets/black.png")
loadSprite("tube", "assets/pipe-green-down.png")
loadSprite("tubeUp", "assets/pipe-green.png")
loadSprite("gameover", "assets/gameover.png")
loadSprite("bird", "assets/bird.png", {
	sliceX: 3,
	anims: {
		"idle": {
			from: 0,
			to: 2,
			speed: 6,
			loop: true,
		},
	}
})
loadSound("fly", "sound/sfx_wing.wav")
loadSound("hit", "sound/sfx_hit.wav")
loadSound("point", "sound/sfx_point.wav")
loadSound("die", "sound/sfx_die.wav")
function changeDistance() {
	return {
		down: add([
			sprite("tube", { width: tubeX, height: (scaleDisplay[1] - yFloor) / 2 - distanceY / 2 }),
			area(),
			pos((width() - scaleDisplay[0]) / 2 + distanceX * (1.3), (height() - scaleDisplay[1]) / 2),
		]),
		up: add([
			sprite("tubeUp", { width: tubeX, height: (scaleDisplay[1] - yFloor) / 2 - distanceY / 2 }),
			area(),
			pos((width() - scaleDisplay[0]) / 2 + distanceX * (1.3), (scaleDisplay[1] - yFloor) / 2 - distanceY / 2 + distanceY + (height() - scaleDisplay[1]) / 2),
		])
	}

}
distanceYpass = distanceY
scene("start", () => {
	const black = add([
		sprite("black", { width: width(), height: height() }),
		area(),
		pos(width() / 2, height() / 2),
		origin("center")
	]);
	const background = add([
		sprite("background", { width: scaleDisplay[0], height: scaleDisplay[1] }),
		area(),
		pos(width() / 2, height() / 2),
		origin("center")
	]);
	const floor = add([
		sprite("floor", { width: scaleDisplay[0], height: yFloor }),
		area(),
		pos(posFloor[0], height() / 2 + scaleDisplay[1] / 2 - yFloor / 2),
		origin("center")
	]);
	const floor1 = add([
		sprite("floor", { width: scaleDisplay[0], height: yFloor }),
		area(),
		pos(posFloor[1], height() / 2 + scaleDisplay[1] / 2 - yFloor / 2),
		origin("center")
	]);
	var bird = add([
		sprite("bird"),
		pos(width() / 2, height() / 2),
		origin("center"),
		area(),
		scale(1.5)
	])
	var value = changeDistance()
	var down = value.down
	var up = value.up
	bird.play("idle")

	add([
		sprite("black", { width: (width() - scaleDisplay[0]) / 2, height: height() }),
		area(),
		z(10),
	]);
	add([
		sprite("black", { width: (width() - scaleDisplay[0]) / 2, height: height() }),
		area(),
		pos((width() - scaleDisplay[0]) / 2 + scaleDisplay[0], 0),
		z(10)
	]);
	add([
		text("Press button up or button down"),
		pos(width() / 2, height() / 2 - 300),
		origin("center"),
		scale(0.21),
		z(100),
		color(255, 255, 0)
	])
	add([
		text("Distance between 2 pipes"),
		pos(width() / 2, height() / 2 - 270),
		origin("center"),
		scale(0.25),
		z(100)
	])
	distance = add([
		text(distanceY),
		pos(width() / 2, height() / 2 - 240),
		origin("center"),
		scale(0.4),
		z(100),
		color(0, 0, 255)
	])
	floor.onUpdate(() => {
		floor.move(-speed, 0)
		if (floor.pos.x <= scaleDisplay[0]) {
			floor.pos.x = posFloor[0]
			floor1.pos.x = posFloor[1]
		}
		if (distanceYpass != distanceY){
			distanceYpass = distanceY
			destroy(up)
			destroy(down)
			distance.onUpdate(() => {
				distance.text = distanceY
			})
			value = changeDistance()
			down = value.down
			up = value.up
		}
	});
	floor1.onUpdate(() => {
		floor1.move(-speed, 0)
	});
	var check = true
	bird.onUpdate(() => {
		if (check == true) {
			bird.move(0, 50)
		}
		if (height() / 2 <= bird.pos.y - 6) {
			check = false
		}
		if (check == false) {
			bird.move(0, -50)
		}
		if (height() / 2 >= bird.pos.y + 6) {
			check = true
		}
	})
	onKeyPress("space", () => {
		go("game")
	})
	
	onKeyPress("up", () => {
		if (distanceY < 200) {
			distanceY += 5
			destroy(up)
			destroy(down)
			distance.onUpdate(() => {
				distance.text = distanceY
			})
			value = changeDistance()
			down = value.down
			up = value.up
		}
	})
	onKeyPress("down", () => {
		if (distanceY > 100) {
			distanceY -= 5
			destroy(up)
			destroy(down)
			distance.onUpdate(() => {
				distance.text = distanceY
			})
			value = changeDistance()
			down = value.down
			up = value.up
		}
	})
});
scene("game", () => {
	gravity(640)
	onGame = true
	const JUMP_FORCE = 280
	rotateBird = 20
	var score = 0
	var die = false
	var sound = [false, false]
	var onGround = false
	function Die() {
		if (die == false) {
			die = true
		}
	}
	const black = add([
		sprite("black", { width: width(), height: height() }),
		area(),
		pos(width() / 2, height() / 2),
		origin("center")
	]);
	const background = add([
		sprite("background", { width: scaleDisplay[0], height: scaleDisplay[1] }),
		area(),
		pos(width() / 2, height() / 2),
		origin("center")
	]);
	const floor = add([
		sprite("floor", { width: scaleDisplay[0], height: yFloor }),
		area(),
		pos(posFloor[0], height() / 2 + scaleDisplay[1] / 2 - yFloor / 2),
		origin("center")
	]);
	const floor1 = add([
		sprite("floor", { width: scaleDisplay[0], height: yFloor }),
		area(),
		pos(posFloor[1], height() / 2 + scaleDisplay[1] / 2 - yFloor / 2),
		origin("center")
	]);
	drawTube(1)
	drawTube(2)
	drawTube(3)
	var bird = add([
		sprite("bird"),
		pos(width() / 2, height() / 2),
		origin("center"),
		area(),
		scale(1.5),
		body(),
		rotate(rotateBird),
		z(1000)
	])
	var checkYBird = bird.pos.y
	bird.play("idle")
	onKeyPress("space", () => {
		if (!die) {
			bird.jump(JUMP_FORCE)
			play("fly")
		}
		else if (onGround) {
			die = false
			go("game")
		}

	})
	onUpdate("tubeDown", (tube) => {
		if (!die) {
			tube.move(-speed, 0)
			if (tube.pos.x <= (width() - scaleDisplay[0]) / 2 - tubeX) {
				destroy(tube)
				drawTube(1, tubeX)
			}
			if (tube.pos.x + tubeX <= bird.pos.x && tube.passed == false) {
				score++
				play("point")
				label.onUpdate(() => {
					label.text = score
				})
				tube.passed = true
			}
		}
	})
	label = add([
		text(score),
		pos(width() / 2, height() / 2 - 300),
		origin("center"),
		z(100),

	])
	bird.onUpdate(() => {
		if (!die) {
			if (b != bdemo){
				bdemo = b
				bird.jump(JUMP_FORCE)
				play("fly")
			}
			if (checkYBird < bird.pos.y) {
				bird.angle = rotateBird
			}
			else {
				bird.angle = -rotateBird
			}
			checkYBird = bird.pos.y
			if (bird.pos.y < (height() - scaleDisplay[1]) / 2) {
				Die()
			}
			else if (bird.pos.y > (height() - scaleDisplay[1]) / 2 + scaleDisplay[1] - yFloor) {
				Die()
			}
		}
		else {
			if (bird.pos.y > (height() - scaleDisplay[1]) / 2 + scaleDisplay[1] - yFloor - 20) {

				bird.pos.y = (height() - scaleDisplay[1]) / 2 + scaleDisplay[1] - yFloor - 20
				if (!sound[1]) {
					play("die")
					sound[1] = true
					wait(0.5, () => gameover = add([
						sprite("gameover", { width: scaleDisplay[0], height: 100 }),
						area(),
						pos(width() / 2, height() / 2),
						origin("center")
					]))
					wait(0.5, () => onGround = true)
				}
			}
		}
	})
	bird.onCollide("tubeDown", () => {
		play("hit")
		sound[0] = true
		Die(1)

	})
	bird.onCollide("tubeUp", () => {
		if (!sound[0])
			play("hit")
		Die(1)
	})
	onUpdate("tubeUp", (tube) => {
		if (!die) {
			tube.move(-speed, 0)
			if (tube.pos.x <= (width() - scaleDisplay[0]) / 2 - tubeX) {
				destroy(tube)
			}
		}
	})
	floor.onUpdate(() => {
		if (!die) {
			floor.move(-speed, 0)
			if (floor.pos.x <= scaleDisplay[0]) {
				floor.pos.x = posFloor[0]
				floor1.pos.x = posFloor[1]
			}
		}
	});
	floor1.onUpdate(() => {
		if (!die)
			floor1.move(-speed, 0)
	});
	add([
		sprite("black", { width: (width() - scaleDisplay[0]) / 2, height: height() }),
		area(),
		z(10)
	]);
	add([
		sprite("black", { width: (width() - scaleDisplay[0]) / 2, height: height() }),
		area(),
		pos((width() - scaleDisplay[0]) / 2 + scaleDisplay[0], 0),
		z(10)
	]);
});
go("start");