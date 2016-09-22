//Bouncing Balls v0.7

//Original concept by Erik a.k.a. "Doolado"
//Visit his YouTube Channel at https://www.youtube.com/user/doolado
//View his 7-part video-series about the original project at https://youtube.com/watch?v=uogkgz9U9Ik

//Enhanced features by Kyle Amoroso
//	+ Added a settings box to the page
//	+ Added extra functionality
//		- Fullscreen capability
//		- Edit gravity and bounce values
//		- Accurate elastic collisions
//		- First-time tips popup
//		- Dark Mode option
//		- Touch enabled
//	+ Cleaned up the code (sorta) (not really)
//	+ Also a Chrome App (off the market)
//		- Offline by default
//	+ Now using Bootstrap for mobile functionality
//		- Info at http://getbootstrap.com/
//	+ Now using randomColor for beautiful colors, by David Merfield
//		- Info at http://llllll.li/randomColor/


/***NOTES****

UNIFY JQUERY
SEPERATE LOGIC FROM GRAPHICS!!!!
Fix the ugliness that is this monstrosity

*************/
"use strict";

document.documentElement.requestFullscreen = document.documentElement.requestFullscreen ||
		document.documentElement.webkitRequestFullscreen ||
		document.documentElement.mozRequestFullScreen ||
		document.documentElement.msRequestFullscreen;
document.exitFullscreen = document.exitFullscreen ||
		document.webkitExitFullscreen ||
		document.mozCancelFullScreen ||
		document.msExitFullscreen;
var BBalls = {
	BALL_MAX: 200,
	canvas: null,
	ctx: null,
	drawId: 0,
	tickId: 0,
	isPaused: false,
	oldFPS: 0,
	frame: 0,
	gravity: null,
	angle: null,
	bounce: null,
	forceFactor: 2,
	balls: [],
	theme: "light",
	pointer: {
		isDown: false,
		downX: 0,
		downY: 0,
		currentX: 0,
		currentY: 0,
		down: function(x,y) {
			this.isDown = true;
			this.downX = x;
			this.downY = y;
		},
		move: function(x,y) {
			this.currentX = x;
			this.currentY = y;
		},
		up: function() {
			this.isDown = false;
		}
	},
	loop: {
		start: 0,
		checkTmr: function(t) {
			return t-this.start;
		}
	},
	draw: function(timestamp) {
		if(BBalls.loop.start==0) {
			BBalls.loop.start = timestamp;
		}
		
		var dt = BBalls.loop.checkTmr(timestamp);
		var currentFPS = (dt>0)?1000/dt:60;
		BBalls.loop.start = timestamp;
		
		if(BBalls.isPaused) {
			return;
		}
		if(BBalls.oldFPS==0) {
			BBalls.oldFPS = currentFPS;
		}
		
		var oldFrame = BBalls.frame;
		BBalls.frame = (BBalls.frame+1000/currentFPS)%1000;
		
		if(oldFrame>BBalls.frame) {
			BBalls.oldFPS = currentFPS;
		}
		
		BBalls.ctx.clearRect(0,0,BBalls.canvas.width,BBalls.canvas.height);
		
		var color = (BBalls.theme=="light")?"#000":"#FFF"
		if(BBalls.balls.length<BBalls.BALL_MAX&&BBalls.pointer.isDown&&!(BBalls.pointer.downX==BBalls.pointer.currentX&&BBalls.pointer.downY==BBalls.pointer.currentY)) {
			BBalls.drawArrow(color);
		}
		
		for(var i=0; i<BBalls.balls.length; i++) {
			var ball1 = BBalls.balls[i];
			for(var j=i+1; j<BBalls.balls.length; j++) {
				var ball2 = BBalls.balls[j];
				
				if(Math.sqrt(Math.pow(ball1.x-ball2.x,2)+Math.pow(ball1.y-ball2.y,2))<=ball1.r+ball2.r) {
					ball1.collide(ball2);
					break;
				}
			}
			ball1.draw(1/currentFPS);
		}
		
		BBalls.ctx.fillStyle = (BBalls.theme=="light")?"#000":"#FFF";
		BBalls.ctx.font = "15px Arial";
		BBalls.ctx.shadowColor = (BBalls.theme=="light")?"#FFF":"#000";
		BBalls.ctx.shadowBlur = 5;
		BBalls.ctx.textAlign = "end";
		BBalls.ctx.fillText(Math.floor(BBalls.oldFPS)+"fps",BBalls.canvas.width-10,25);
		BBalls.ctx.textAlign = "start";
		BBalls.ctx.fillText("Balls: "+BBalls.balls.length,10,BBalls.canvas.height-10);
		
		BBalls.drawId = requestAnimationFrame(BBalls.draw);
	},
	tick: function() {
		var dt = Date.now()-BBalls.lastTime;
		//do mechanics
		BBalls.lastTime = Date.now();
		BBalls.tickId = setTimeout(BBalls.tick,1000/60);
	},
	freeze: function() {
		for(var i=0; i<BBalls.balls.length; i++) {
			BBalls.balls[i].vx = 0;
			BBalls.balls[i].vy = 0;
		}
	},
	reset: function() {
		BBalls.balls = [];
		BBalls.adjustGravity(10);
		BBalls.adjustBounce(0.9);
		//BBalls.syncAngle(-90,"deg");
		BBalls.Ball.contagion = false;
		BBalls.theme = "light";
		BBalls.canvas.className = BBalls.theme;
	},
	fullscreenHandler: function() {
		var fsBtn = document.getElementById("fullscreen");
		if(document.fullscreenElement||document.mozFullScreenElement||document.webkitFullscreenElement||document.msFullscreenElement) {
			if(!fsBtn.classList.contains("active")) {
				fsBtn.classList.add("active");
			}
		} else {
			if(fsBtn.classList.contains("active")) {
				fsBtn.classList.remove("active");
			}
		}
	},
	drawArrow: function(color) {
		var fromx = BBalls.pointer.downX;
		var fromy = BBalls.pointer.downY;
		var tox = BBalls.pointer.currentX;
		var toy = BBalls.pointer.currentY;
		
		BBalls.ctx.beginPath();
		var headlen = 10;
		var angle = Math.atan2(toy-fromy,tox-fromx);
		BBalls.ctx.moveTo(fromx,fromy);
		BBalls.ctx.lineTo(tox,toy);
		BBalls.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
		BBalls.ctx.moveTo(tox,toy);
		BBalls.ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
		
		//style
		BBalls.ctx.lineJoin = "round";
		BBalls.ctx.lineWidth = 2;
		BBalls.ctx.strokeStyle = color;
		BBalls.ctx.lineCap = "round";
		BBalls.ctx.stroke();
	},
	adjustGravity: function(grav) {
		grav = Math.min(Math.max(parseFloat(grav),0),15);
		BBalls.gravity.value = grav;
		var angle = BBalls.angle.value*Math.PI/180;
		BBalls.Ball.ax = grav*Math.cos(angle);
		BBalls.Ball.ay = -grav*Math.sin(angle);
	},
	adjustBounce: function(bnc) {
		bnc = Math.min(Math.max(parseFloat(bnc),0),1);
		BBalls.bounce.value = bnc;
		BBalls.Ball.bounce = bnc;
	}
};
BBalls.Ball = function(positionX,positionY,velocityX,velocityY,radius,color) {
	this.x = positionX;
	this.y = positionY;
	this.vx = velocityX;
	this.vy = velocityY;
	this.r = radius;
	this.c = color;
};
BBalls.Ball.prototype.draw = function(dt) {
	//acceleration in m/s (from inputs)
	//velocity and position in pixels (for drawing)
	
	this.vx+=32*BBalls.Ball.ax*dt;	//v=a*t,32px=1m
	this.vy+=32*BBalls.Ball.ay*dt;
	this.x+=this.vx*dt;	//s=v*t
	this.y+=this.vy*dt;
	
	if(this.x+this.r>BBalls.canvas.width) {
		this.x = BBalls.canvas.width-this.r;
		this.vx*=-BBalls.Ball.bounce;
	}
	
	if(this.x-this.r<0) {
		this.x = this.r;
		this.vx*=-BBalls.Ball.bounce;
	}
	
	if(this.y+this.r>BBalls.canvas.height) {
		this.y = BBalls.canvas.height-this.r;
		this.vy*=-BBalls.Ball.bounce;
	}
	
	if(this.y-this.r<0) {
		this.y = this.r;
		this.vy*=-BBalls.Ball.bounce;
	}
	
	//draw a circle
	BBalls.ctx.beginPath();
	BBalls.ctx.arc(this.x,this.y,this.r,0,2*Math.PI,false);
	//fill
	BBalls.ctx.shadowBlur = this.r/2;
	BBalls.ctx.shadowColor = "rgba(0,0,0,0.5)";
	BBalls.ctx.fillStyle = this.c;
	BBalls.ctx.fill();
	BBalls.ctx.shadowBlur = 0;
};
BBalls.Ball.prototype.collide = function(ball2) {
	//set up temps
	var r1 = this.r;
	var r2 = ball2.r;
	var m1 = 4/3*Math.PI*Math.pow(r1,3)*125/8192;	//500 kg/m^3 dense sphere, 32px=1m
	var m2 = 4/3*Math.PI*Math.pow(r2,3)*125/8192;
	var x1 = this.x;
	var y1 = this.y;
	var vx1 = this.vx;
	var vy1 = this.vy;
	var v1 = Math.sqrt(Math.pow(vx1,2)+Math.pow(vy1,2));
	var theta1 = Math.atan2(vy1,vx1);
	var x2 = ball2.x;
	var y2 = ball2.y;
	var vx2 = ball2.vx;
	var vy2 = ball2.vy;
	var v2 = Math.sqrt(Math.pow(vx2,2)+Math.pow(vy2,2));
	var theta2 = Math.atan2(vy2,vx2);
	var phi = Math.atan2(y2-y1,x2-x1);
	var ax = BBalls.Ball.ax;
	var ay = BBalls.Ball.ay;
	
	if(BBalls.Ball.contagion) {
		if(m1*v1>m2*v2)
			ball2.c = this.c;
		if(m1*v1<m2*v2)
			this.c = ball2.c;
	}
	
	//adjust for overlap during collision
	//assume quadratic motion in both dimensions
	//solve for t when the distance between the respective centers of each ball is the same as the sum of their radii
	//t<0 because we want to backtrack
	//we got here because now the balls overlap
	
	if(Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))<r1+r2) {
		var dividend = Math.pow(r1+r2,2)-Math.pow(x2-x1,2)-Math.pow(y2-y1,2);
		var divisor = 2*((vx2-vx1)*(x2-x1)+(vy2-vy1)*(y2-y1));
		
		if(divisor==0||dividend/divisor>=0) {	//checking divide by zero in dt calculation and possibility of dt>=0, meaning no possible time beforehand where the balls met
			//balls never disperse
			//sperate them by moving <this> and <ball2> away from each other so that Math.pow(x2-x1,2)+Math.pow(y2-y1,2)==Math.pow(r1+r2,2)
			var theta = Math.atan2(y2-y1,x2-x1);
			var overlap = r1+r2-Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
			this.x = x1+overlap/2*Math.cos(theta+Math.PI);
			this.y = y1+overlap/2*Math.sin(theta+Math.PI);
			ball2.x = x2+overlap/2*Math.cos(theta);
			ball2.y = y2+overlap/2*Math.sin(theta);
			return;
		} else {
			var dt = dividend/divisor;
			this.x = x1+vx1*dt+ax*Math.pow(dt,2)/2;
			this.y = y1+vy1*dt+ay*Math.pow(dt,2)/2;
			ball2.x = x2+vx2*dt+ay*Math.pow(dt,2)/2;
			ball2.y = y2+vy2*dt+ay*Math.pow(dt,2)/2;
		}
	}
	
	//perform elastic collision calculations
	this.vx = (v1*Math.cos(theta1-phi)*(m1-m2)+2*m2*v2*Math.cos(theta2-phi))/(m1+m2)*Math.cos(phi)+v1*Math.sin(theta1-phi)*Math.cos(phi+Math.PI/2);
	this.vy = (v1*Math.cos(theta1-phi)*(m1-m2)+2*m2*v2*Math.cos(theta2-phi))/(m1+m2)*Math.sin(phi)+v1*Math.sin(theta1-phi)*Math.sin(phi+Math.PI/2);
	ball2.vx = (v2*Math.cos(theta2-phi)*(m2-m1)+2*m1*v1*Math.cos(theta1-phi))/(m1+m2)*Math.cos(phi)+v2*Math.sin(theta2-phi)*Math.cos(phi+Math.PI/2);
	ball2.vy = (v2*Math.cos(theta2-phi)*(m2-m1)+2*m1*v1*Math.cos(theta1-phi))/(m1+m2)*Math.sin(phi)+v2*Math.sin(theta2-phi)*Math.sin(phi+Math.PI/2);
};
BBalls.Ball.ax = 0;
BBalls.Ball.ay = 10;
BBalls.Ball.bounce = 0.9;
BBalls.Ball.contagion = false;
BBalls.Ball.MIN_RADIUS = 10;	//10
BBalls.Ball.RADIUS_RANGE = 10;	//10

//EVENT LISTENERS
window.addEventListener("load",function() {
	BBalls.canvas = document.querySelector("canvas");
	BBalls.ctx = BBalls.canvas.getContext("2d");
	BBalls.canvas.width = window.innerWidth;
	BBalls.canvas.height = window.innerHeight;
	BBalls.gravity = document.getElementById("gravity");
	BBalls.angle = document.getElementById("angle");
	BBalls.bounce = document.getElementById("bounce");
	BBalls.drawId = requestAnimationFrame(BBalls.draw);
	
	document.addEventListener("keyup",function(e) {
		if(e.keyCode==27) {
			document.getElementById("fullscreen").classList.remove("active");
		}
	});
	document.addEventListener("fullscreenchange",BBalls.fullscreenHandler);
	document.addEventListener("webkitscreenchange",BBalls.fullscreenHandler);
	document.addEventListener("mozscreenchange",BBalls.fullscreenHandler);
	document.addEventListener("msscreenchange",BBalls.fullscreenHandler);
	
	window.addEventListener("resize",function() {
		BBalls.canvas.width = this.innerWidth;
		BBalls.canvas.height = this.innerHeight;
	});
	window.addEventListener("mousemove",function(e) {
		BBalls.pointer.move(e.clientX,e.clientY);
	});
	BBalls.canvas.addEventListener("mousedown",function(e) {
		var x = e.clientX;
		var y = e.clientY;
		if(e.which==1) {
			BBalls.pointer.down(x,y);
			BBalls.pointer.move(x,y);
		}
	});
	BBalls.canvas.addEventListener("mouseleave",BBalls.pointer.up);
	BBalls.canvas.addEventListener("mouseup",function(e) {
		if(BBalls.pointer.isDown) {
			BBalls.pointer.up();
			if(BBalls.balls.length!=BBalls.BALL_MAX) {
				BBalls.balls.push(new BBalls.Ball(
					BBalls.pointer.downX,
					BBalls.pointer.downY,
					(e.clientX-BBalls.pointer.downX)*BBalls.forceFactor,
					(e.clientY-BBalls.pointer.downY)*BBalls.forceFactor,
					BBalls.Ball.MIN_RADIUS+BBalls.Ball.RADIUS_RANGE*Math.random(),
					randomColor()
				));
			}
		}
	});
	BBalls.canvas.addEventListener("touchstart",function(e) {
		e.preventDefault();
		var touch = e.changedTouches[0];
		var x = touch.clientX;
		var y = touch.clientY;
		BBalls.pointer.down(x,y);
		BBalls.pointer.move(x,y);
	});
	BBalls.canvas.addEventListener("touchmove",function(e) {
		e.preventDefault();
		var touch = e.changedTouches[0];
		var x = touch.clientX;
		var y = touch.clientY;
		if(document.elementFromPoint(x,y)==BBalls.canvas) {
			BBalls.pointer.move(x,y);
		} else {
			BBalls.pointer.up();
		}
	});
	BBalls.canvas.addEventListener("touchend",function(e) {
		e.preventDefault();
		var touch = e.changedTouches[0];
		if(BBalls.pointer.isDown) {
			BBalls.pointer.up();
			if(BBalls.balls.length!=BBalls.BALL_MAX) {
				BBalls.balls.push(new BBalls.Ball(
					BBalls.pointer.downX,
					BBalls.pointer.downY,
					(touch.clientX-BBalls.pointer.downX)*BBalls.forceFactor,
					(touch.clientY-BBalls.pointer.downY)*BBalls.forceFactor,
					BBalls.Ball.MIN_RADIUS+BBalls.Ball.RADIUS_RANGE*Math.random(),
					randomColor({luminosity:"dark"})
				));
			}
		}
	});
	document.getElementById("settings").addEventListener("submit",function(e) {
		e.preventDefault();
		return false;
	});
	document.getElementById("settings").addEventListener("reset",BBalls.reset);
	BBalls.gravity.addEventListener("input",function() {
		BBalls.adjustGravity(this.value);
	});
	BBalls.bounce.addEventListener("input",function() {
		BBalls.adjustBounce(this.value);
	});
	BBalls.angle.addEventListener("input",function() {
		BBalls.adjustGravity(BBalls.gravity.value);
	});
	document.getElementById("toggle-contagion").addEventListener("change",function() {
		BBalls.Ball.contagion = this.checked;
	});
	document.getElementById("toggle-dark").addEventListener("change",function() {
		BBalls.theme = (this.checked)?"dark":"light";
		BBalls.canvas.className = BBalls.theme;
	});
	document.getElementById("fullscreen").addEventListener("click",function() {
		if(this.classList.contains("active")) {
			if(!document.fullscreenElement&&!document.mozFullScreenElement&&!document.webkitFullscreenElement&&!document.msFullscreenElement) {
				if(document.documentElement.requestFullscreen) {
					document.documentElement.requestFullscreen();
				} else {
					this.classList.remove("active");
					alert("Your browser does not support the HTML5 Fullscreen API.");
				}
			}
		} else {
			if(document.exitFullscreen) {
				document.exitFullscreen();
			}
		}
	});
	document.getElementById("freeze").addEventListener("click",BBalls.freeze);
});