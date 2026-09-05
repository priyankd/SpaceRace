import {drawSprite,asteroidNames,asteroidVariant,asteroidSize} from './sprites.mjs';
// Procedural asteroid surfaces keep every obstacle distinct without texture downloads.
// Surface rotation changes the appearance, never the collision footprint.
const noise=(seed)=>{const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n);};
export function drawAsteroid(c,p,o,time,world,reduced){
 const size=asteroidSize(o),variant=asteroidVariant(o);
 c.save();c.translate(p.x,p.y-size.height*p.scale/2);
 c.rotate(reduced?0:Math.sin(time*.22+o.z)*.075);
 if(!reduced){const phase=time*.28+o.z;c.scale(.96+Math.cos(phase)*.025,.97+Math.sin(phase)*.02);}
 const drawn=drawSprite(c,asteroidNames[variant],-size.width*p.scale/2,-size.height*p.scale/2,size.width*p.scale,size.height*p.scale);
 c.restore();if(drawn)return;
 const k=p.scale,seed=o.z+(o.y??0)*.37+(o.x??0)*101;
 const spin=reduced?seed*.01:seed*.01+time*(o.type==='asteroid'?.28:.1);
 const icy=world==='saturn';
 const colors=icy?['#edfbff','#93b9c9','#3d5c78']:world==='mars'?['#e5b299','#ac715c','#513744']:['#d5c6b4','#8f8583','#343c50'];
 c.save();c.translate(p.x,p.y-83*k);c.scale(k,k);
 // Rounded, irregular silhouette with stable world-space size.
 const points=Array.from({length:18},(_,i)=>{
  const a=i/18*Math.PI*2;
  const radius=.9+noise(seed+i)*.075+Math.sin(a*3+spin)*.02;
  return [Math.cos(a)*128*radius,Math.sin(a)*85*radius];
 });
 c.beginPath();c.moveTo((points[17][0]+points[0][0])/2,(points[17][1]+points[0][1])/2);
 for(let i=0;i<points.length;i++){const next=points[(i+1)%points.length];c.quadraticCurveTo(points[i][0],points[i][1],(points[i][0]+next[0])/2,(points[i][1]+next[1])/2);}
 c.closePath();
 const stone=c.createRadialGradient(-50,-45,4,12,15,155);
 stone.addColorStop(0,colors[0]);stone.addColorStop(.43,colors[1]);stone.addColorStop(1,colors[2]);
 c.fillStyle=stone;c.fill();c.save();c.clip();
 // Broad mineral facets move over the face as it tumbles.
 for(let i=0;i<9;i++){
  const angle=spin+i*2.4,front=Math.cos(angle);
  if(front<=0)continue;
  const x=Math.sin(angle)*104,y=(noise(seed+i*5)-.5)*116;
  c.fillStyle=i%2?'rgba(243,236,218,.09)':'rgba(25,33,48,.12)';
  c.beginPath();c.moveTo(x-25*front,y-18);c.lineTo(x+20*front,y-29);c.lineTo(x+35*front,y+13);c.lineTo(x-12*front,y+26);c.closePath();c.fill();
 }
 // Craters compress near the limb, giving the rotation a three-dimensional feel.
 if(k>.075)for(let i=0;i<12;i++){
  const longitude=spin+i*2.39996,front=Math.cos(longitude);
  if(front<=.08)continue;
  const latitude=(noise(seed+i*7.3)-.5)*1.6;
  const x=Math.sin(longitude)*Math.cos(latitude)*106,y=Math.sin(latitude)*66;
  const radius=7+noise(seed+i*3.1)*12,rx=Math.max(1.2,radius*front),ry=radius*.7;
  c.fillStyle=icy?'#d7eff18c':'#e3c5a76b';c.beginPath();c.ellipse(x+1.5,y+2,rx+2,ry+2,0,0,Math.PI*2);c.fill();
  const pit=c.createLinearGradient(x,y-ry,x,y+ry);
  pit.addColorStop(0,icy?'#365168':'#383342');pit.addColorStop(.62,icy?'#6f95a8':'#736262');pit.addColorStop(1,colors[1]);
  c.fillStyle=pit;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
  c.strokeStyle='rgba(245,240,222,.23)';c.lineWidth=1;c.beginPath();c.ellipse(x,y,rx,ry,0,.2,2.7);c.stroke();
 }
 // Fine mineral grains are deterministic and stay attached to the rotating surface.
 if(k>.2)for(let i=0;i<35;i++){
  const lon=spin+i*2.39996,front=Math.cos(lon);if(front<.15)continue;
  const lat=(noise(seed+i*11)-.5)*1.9;
  c.fillStyle=i%3?'rgba(19,27,43,.18)':'rgba(255,245,226,.23)';
  c.fillRect(Math.sin(lon)*Math.cos(lat)*110,Math.sin(lat)*70,1.5*front,1.3);
 }
 c.restore();
 c.strokeStyle='rgba(227,236,247,.3)';c.lineWidth=1.4;
 // Light on the upper rim helps the silhouette stand out against each world.
 c.beginPath();c.ellipse(-3,-4,112,70,0,3.5,5.8);c.stroke();
 c.restore();
}
