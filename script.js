
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W,H, gameRunning=false;
function resize(){ W=canvas.width=canvas.clientWidth*2; H=canvas.height=canvas.clientHeight*2; }
resize(); window.onresize=resize;

let player = {x:100,y:0,speed:4,vx:0,vy:0,sprint:false, hasBall:true}
let ball = {x:140,y:0,vx:0,vy:0}
let opponent = {x:0,y:0,vx:0,vy:0}
let scoreA=0,scoreB=0;
let joystick = {active:false,dx:0,dy:0}

const stick = document.getElementById('joystickStick');
const base = document.getElementById('joystickBase');
let baseRect;

base.addEventListener('touchstart', e=>{ joystick.active=true; baseRect=base.getBoundingClientRect(); });
base.addEventListener('touchmove', e=>{
  if(!joystick.active) return;
  let t=e.touches[0];
  let cx=baseRect.left+60, cy=baseRect.top+60;
  let dx=t.clientX-cx, dy=t.clientY-cy;
  let dist=Math.min(50, Math.hypot(dx,dy));
  let ang=Math.atan2(dy,dx);
  joystick.dx=Math.cos(ang)*dist/50; joystick.dy=Math.sin(ang)*dist/50;
  stick.style.left=30+Math.cos(ang)*dist+'px';
  stick.style.top=30+Math.sin(ang)*dist+'px';
  e.preventDefault();
});
function endJoy(){ joystick.active=false; joystick.dx=0; joystick.dy=0; stick.style.left='30px'; stick.style.top='30px'; }
base.addEventListener('touchend', endJoy);
base.addEventListener('mousedown', e=>{ joystick.active=true; baseRect=base.getBoundingClientRect(); });
window.addEventListener('mousemove', e=>{
  if(!joystick.active || e.buttons===0) return;
  let cx=baseRect.left+60, cy=baseRect.top+60;
  let dx=e.clientX-cx, dy=e.clientY-cy;
  let dist=Math.min(50, Math.hypot(dx,dy));
  let ang=Math.atan2(dy,dx);
  joystick.dx=Math.cos(ang)*dist/50; joystick.dy=Math.sin(ang)*dist/50;
  stick.style.left=30+Math.cos(ang)*dist+'px';
  stick.style.top=30+Math.sin(ang)*dist+'px';
});
window.addEventListener('mouseup', endJoy);

document.getElementById('shootBtn').addEventListener('touchstart', shoot);
document.getElementById('shootBtn').addEventListener('click', shoot);
document.getElementById('passBtn').addEventListener('click', pass);
document.getElementById('sprintBtn').addEventListener('touchstart', ()=>player.sprint=true);
document.getElementById('sprintBtn').addEventListener('touchend', ()=>player.sprint=false);

function shoot(){
  if(!player.hasBall) return;
  ball.vx=15+Math.random()*5;
  ball.vy=(Math.random()-0.5)*4;
  player.hasBall=false;
}
function pass(){
  if(!player.hasBall) return;
  ball.vx=8; ball.vy=(Math.random()-0.5)*6; player.hasBall=false;
}

function startGame(){
  document.getElementById('startScreen').style.display='none';
  gameRunning=true;
  player.y=H/2; ball.y=H/2; opponent.x=W-200; opponent.y=H/2;
  loop();
}
window.startGame=startGame;

function loop(){
  if(!gameRunning) return;
  // player movement
  let spd = player.sprint? 7 : 4;
  player.vx=joystick.dx*spd; player.vy=joystick.dy*spd;
  player.x+=player.vx; player.y+=player.vy;
  player.x=Math.max(40, Math.min(W-40, player.x));
  player.y=Math.max(40, Math.min(H-40, player.y));

  if(player.hasBall){ ball.x=player.x+35; ball.y=player.y; }
  else {
    ball.x+=ball.vx; ball.y+=ball.vy;
    ball.vx*=0.98; ball.vy*=0.98;
    if(ball.y<40 || ball.y>H-40) ball.vy*=-1;
    // opponent AI
    opponent.x += (ball.x-opponent.x)*0.03;
    opponent.y += (ball.y-opponent.y)*0.05;
    if(Math.hypot(ball.x-opponent.x, ball.y-opponent.y)<30){ ball.vx=-6; ball.vy=(Math.random()-0.5)*4; }
    if(Math.hypot(ball.x-player.x, ball.y-player.y)<40 && Math.hypot(ball.vx, ball.vy)<1){ player.hasBall=true; }
    // goal
    if(ball.x>W-30 && ball.y>H/2-80 && ball.y<H/2+80){ scoreA++; resetRound(); }
    if(ball.x<30 && ball.y>H/2-80 && ball.y<H/2+80){ scoreB++; resetRound(); }
    if(ball.x>W || ball.x<0) { ball.vx*=-0.5; }
  }

  draw();
  requestAnimationFrame(loop);
}

function resetRound(){
  document.getElementById('teamA').textContent=`أنت ${scoreA}`;
  document.getElementById('teamB').textContent=`${scoreB} الخصم`;
  player.x=100; player.y=H/2; ball.x=140; ball.y=H/2; ball.vx=0; ball.vy=0; player.hasBall=true;
  opponent.x=W-200;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  // pitch lines
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=3;
  ctx.strokeRect(20,20,W-40,H-40);
  ctx.beginPath(); ctx.moveTo(W/2,20); ctx.lineTo(W/2,H-20); ctx.stroke();
  ctx.beginPath(); ctx.arc(W/2,H/2,80,0,Math.PI*2); ctx.stroke();
  // goals
  ctx.fillStyle='white'; ctx.fillRect(W-20,H/2-80,20,160); ctx.fillRect(0,H/2-80,20,160);
  // opponent
  ctx.fillStyle='#ff3b30'; ctx.beginPath(); ctx.arc(opponent.x,opponent.y,18,0,Math.PI*2); ctx.fill();
  // player
  ctx.fillStyle='#007aff'; ctx.beginPath(); ctx.arc(player.x,player.y,20,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='white'; ctx.font='12px Arial'; ctx.fillText('7',player.x-4,player.y+4);
  // ball
  ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(ball.x,ball.y,10,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='black'; ctx.stroke();
}
