import {drawSolarFlyby} from './solar-tour.mjs';
import {drawSprite} from './sprites.mjs';
import {drawAsteroid} from './asteroid.mjs';
import {getLevel,coursePose,flightBounds,laserOn,obstacleX} from './engine.mjs';
const animations=new WeakMap();

export function render(canvas,s){
 const c=canvas.getContext('2d');if(!c)return;
 const level=getLevel(s.levelId);
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false;
 let motion=animations.get(canvas);
 if(!motion||motion.levelId!==level.id||s.time<motion.time||Math.abs(s.z-motion.z)>200){motion={levelId:level.id,time:s.time,z:s.z,x:s.x,y:s.y,lean:0,landing:0,thrust:.3,cameraX:s.x,cameraY:s.y*.65};animations.set(canvas,motion);}
 const dt=Math.min(.05,Math.max(0,s.time-motion.time));
 const smoothing=1-Math.exp(-12*dt);
 const route=coursePose(s.z,s.levelId);
 const bend=(coursePose(s.z+350,s.levelId).heading-route.heading)*Math.min(1,s.speed/630);
 const turn=dt>0?Math.max(-1,Math.min(1,(s.x-motion.x)/dt)):0;
 motion.lean+=(turn*.13+Math.max(-.18,Math.min(.18,bend*.22))-motion.lean)*(1-Math.exp(-7*dt));
 motion.thrust+=((s.boosting?1:.3)-motion.thrust)*smoothing;
 if(motion.y>0&&s.y===0)motion.landing=1;
 motion.landing=Math.max(0,motion.landing-dt*2.6);
 motion.cameraX+=(s.x-motion.cameraX)*(1-Math.exp(-9*dt));
 motion.cameraY+=(s.y*.65-motion.cameraY)*(1-Math.exp(-9*dt));
 motion.time=s.time;motion.z=s.z;motion.x=s.x;motion.y=s.y;
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(window.devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
 c.setTransform(dpr,0,0,dpr,0,0);
 const horizon=h*.32, f=h*.86;
 const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,level.sky[0]);sky.addColorStop(.55,level.sky[1]);sky.addColorStop(1,level.sky[2]);c.fillStyle=sky;c.fillRect(0,0,w,h);
 for(let i=0;i<(level.id==='mars'?25:110);i++){const x=((i*719.3-motion.cameraX*12)%w+w)%w,y=(i*83.7)%(h*.85);c.fillStyle=`rgba(220,236,255,${.25+(i%4)*.17})`;c.fillRect(x,y,i%9===0?2:1,i%9===0?2:1);}
 drawSolarFlyby(c,w,h,s,level.length,reduced);
 const poly=(points,color)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
 for(let layer=0;layer<(level.id==='moon'||level.id==='mars'?3:0);layer++){
 const pts=[[0,h]];for(let i=0;i<=24;i++)pts.push([i*w/24,h*.93+layer*20-Math.sin(i*2.8+layer+motion.cameraX*.15)*14-Math.cos(i*1.9+s.z*.0002)*12]);pts.push([w,h]);poly(pts,level.terrain[layer]);
 }
 const proj=(z,x=0,y=0)=>{const depth=z-s.z+400,scale=f/Math.max(25,depth);return {x:w/2+(coursePose(z,s.levelId).x-route.x-route.heading*(z-s.z)+x*600-motion.cameraX*600)*scale,y:horizon+(180+motion.cameraY-y)*scale,scale};};
 // Connected corner rails reveal bends without adding a solid road.
 for(let z=Math.floor((s.z+4500)/250)*250;z>s.z-40;z-=250){
  const box=flightBounds(z,s.levelId);
  const corners=[proj(z,-1,box.floor),proj(z,-1,box.ceiling),proj(z,1,box.ceiling),proj(z,1,box.floor)];
  c.strokeStyle='#8cf5e555';c.lineWidth=Math.max(1,2*corners[0].scale);
  c.beginPath();corners.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.stroke();
  if(z-250>s.z-40){
   const near=flightBounds(z-250,s.levelId);
   const next=[proj(z-250,-1,near.floor),proj(z-250,-1,near.ceiling),proj(z-250,1,near.ceiling),proj(z-250,1,near.floor)];
   c.strokeStyle='#8cf5e52d';c.beginPath();corners.forEach((p,i)=>{c.moveTo(p.x,p.y);c.lineTo(next[i].x,next[i].y);});c.stroke();
  }
 }
 const items=[...level.obstacles,{z:level.length,type:'finish',x:0,y:flightBounds(level.length,s.levelId).floor}].filter(o=>o.z>s.z-50&&o.z<s.z+4500).sort((a,b)=>b.z-a.z);
 for(const o of items){const p=proj(o.z,obstacleX(o,s.time),o.y??0),k=p.scale;
 if(o.type==='rock'||o.type==='asteroid'){
 drawAsteroid(c,p,o,s.time,level.id,reduced);
 }else{const l=proj(o.z,-1,o.y??0),r=proj(o.z,1,o.y??0),active=o.type==='laser'&&laserOn(o,s.time),color=o.type==='laser'?(active?'#ff886f':'#a8f6ab'):o.type==='finish'?'#e1f58d':'#72e9e3';
 c.strokeStyle=color;c.lineWidth=Math.max(2,15*k);c.beginPath();c.moveTo(l.x,l.y);c.lineTo(l.x,l.y-360*k);c.lineTo(r.x,r.y-360*k);c.lineTo(r.x,r.y);c.closePath();c.stroke();
 if(active){c.fillStyle='#ff725931';c.fillRect(l.x,l.y-300*k,r.x-l.x,300*k);c.lineWidth=4*k;for(let j=1;j<5;j++){c.beginPath();c.moveTo(l.x,l.y-j*60*k);c.lineTo(r.x,r.y-j*60*k);c.stroke();}}
 if(k>.07){c.fillStyle=color;c.textAlign='center';c.font=`bold ${Math.max(10,38*k)}px sans-serif`;c.fillText(o.type==='laser'?(active?'STOP • LASER ON':'GO • GATE OPEN'):'FINISH',p.x,p.y-385*k);}
 }
 }
 const carX=w/2+(s.x-motion.cameraX)*f*600/400,carY=horizon+(180+motion.cameraY-s.y)*f/400,sz=Math.min(w/850,h/650),jump=0;
 if(!reduced&&s.speed>30){
  // Deterministic particles advance with race time and freeze when paused.
  for(let i=0;i<20;i++){
   const age=(s.time*(s.boosting?2.2:1.4)+i*.137)%1;
   const side=i%2?1:-1;
   const trail=s.boosting?140:65;
   const px=carX+side*(65+age*24)*sz-motion.lean*age*180*sz;
   const py=carY-(s.boosting?jump:0)+(age*trail)*sz;
   c.fillStyle=s.boosting?`rgba(146,249,231,${(1-age)*.65})`:`rgba(136,210,249,${(1-age)*.3})`;
   c.beginPath();c.ellipse(px,py,(2+age*5)*sz,(s.boosting?9:3)*sz,0,0,7);c.fill();
  }
 }
 const bounce=reduced?0:Math.sin(s.time*1.3)*1.4+Math.sin(s.time*2.1)*.5;
 const suspension=reduced?0:Math.sin(s.time*1.5)*motion.thrust*2;
 c.save();c.translate(carX,carY-jump+(bounce+suspension)*sz);
 c.rotate(reduced?0:motion.lean);
 c.scale(sz,sz*(1-(reduced?0:motion.thrust*.045+s.vy*.00015))); 
 if(s.invincible>0)c.globalAlpha=reduced?.8:.72+Math.sin(s.time*5)*.12;
 if(motion.thrust>.01){
  const flame=motion.thrust*(reduced?70:75+Math.sin(s.time*26)*12+Math.sin(s.time*41)*6);
  c.shadowColor='#7cecdf';c.shadowBlur=reduced?0:15;
  for(const side of [-1,1]){
   const x=side*43;
   poly([[x-16,0],[x+16,0],[x,flame]],'#65dac6');
   poly([[x-8,0],[x+8,0],[x,flame*.68]],'#efffed');
  }c.shadowBlur=0;
 }

 if(!drawSprite(c,'supercar-rear',-88,-106,176,112)){
 // Hover pods replace wheel rotation; light pulses smoothly with thrust.
 for(const x of [-82,60]){
  c.fillStyle='#15253a';c.fillRect(x,-65,23,70);
  c.shadowColor='#74e7f3';c.shadowBlur=reduced?0:12+motion.thrust*12;
  c.fillStyle='#99f1f2';c.fillRect(x+4,-55,15,45);c.shadowBlur=0;
  c.fillStyle='#e1fffb';c.fillRect(x+8,-49,7,32);
 }

 poly([[-72,8],[-68,-49],[-40,-103],[40,-103],[68,-49],[72,8]],'#b5e82a');
 poly([[-68,-49],[-40,-103],[-35,-44],[-49,5],[-72,8]],'#669c25');
 poly([[-37,-91],[37,-91],[49,-49],[-49,-49]],'#142b45');
 poly([[-29,-84],[27,-84],[34,-61],[-36,-61]],'#41768c');
 poly([[-10,-103],[10,-103],[14,7],[-14,7]],'#d4f787');
 c.fillStyle='#162840';c.fillRect(-70,-25,140,18);c.fillStyle='#ff977e';c.fillRect(-62,-20,36,7);c.fillRect(26,-20,36,7);c.fillStyle='#b8dbe5';c.fillRect(-81,-38,162,9);

 }
 c.restore();
 if(!reduced&&motion.thrust>.4){
  c.strokeStyle=`rgba(184,250,233,${motion.thrust*.24})`;c.lineWidth=1.5;
  for(let i=0;i<16;i++){
   const phase=(s.time*.9+i*.173)%1,side=i%2?1:-1;
   const x=w/2+side*w*(.27+phase*.35),y=h*.45+((i*47)%37)/100*h;
   c.beginPath();c.moveTo(x,y);c.lineTo(x+side*(20+phase*55),y+phase*20);c.stroke();
  }
 }
 if(s.invincible>0){c.strokeStyle='#a6f9e2';c.lineWidth=2;c.beginPath();c.ellipse(carX,carY-jump-35*sz,105*sz,90*sz,0,0,7);c.stroke();}
}
