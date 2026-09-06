import {drawPlanetImage} from './planet-images.mjs';
// Order from the Sun. Stops are a compressed flyby, not a scale model.
export const SOLAR_STOPS=[
 {name:'Sun',color:'#ffc663',radius:95},
 {name:'Mercury',color:'#b2aaa1',radius:30},
 {name:'Venus',color:'#dfbd85',radius:43},
 {name:'Earth',color:'#4c9bcc',radius:45},
 {name:'Mars',color:'#bf765b',radius:35},
 {name:'Asteroid belt',color:'#929ca7',radius:60},
 {name:'Jupiter',color:'#c6a58a',radius:88},
 {name:'Saturn',color:'#d2c49d',radius:68},
 {name:'Uranus',color:'#91ccd4',radius:55},
 {name:'Neptune',color:'#426ebf',radius:54},
 {name:'Pluto',color:'#c6b3a4',radius:26},
];
export const tourIndex=(z,length)=>Math.max(0,Math.min(SOLAR_STOPS.length-1,Math.floor(z/length*SOLAR_STOPS.length)));
export function drawSolarFlyby(c,w,h,s,length,reduced,placement=null){
 const index=tourIndex(s.z,length),stop=placement?.stop??SOLAR_STOPS[index];
 const phase=Math.min(1,(s.z/length*SOLAR_STOPS.length)-index);
 const radius=placement?.radius??stop.radius*Math.min(w/1050,h/650)*(.75+phase*.6);
 const x=placement?.x??w*(.79+phase*.11),y=placement?.y??h*(.39+phase*.08);
 c.save();
 if(drawPlanetImage(c,stop.name,x,y,radius)){
  // Photos are shared by scenic flybys and the collidable miniature planets.
 }else if(stop.name==='Sun'){
  const glow=c.createRadialGradient(x,y,radius*.7,x,y,radius*1.8);
  glow.addColorStop(0,'#ffbb6670');glow.addColorStop(1,'#ff8b2200');
  c.fillStyle=glow;c.beginPath();c.arc(x,y,radius*1.8,0,Math.PI*2);c.fill();
  const surface=c.createRadialGradient(x-radius*.25,y-radius*.3,0,x,y,radius);
  surface.addColorStop(0,'#fff4b3');surface.addColorStop(.7,'#ffcb59');surface.addColorStop(1,'#f88a2c');
  c.fillStyle=surface;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.fill();
  c.save();c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.clip();
  for(let i=0;i<95;i++){
   const angle=i*2.39996+(reduced?0:s.time*.015),r=radius*Math.sqrt((i+.5)/95);
   c.fillStyle=i%3?'#fff4aa24':'#bd5d2828';c.beginPath();c.arc(x+Math.cos(angle)*r,y+Math.sin(angle)*r,radius*(.015+(i%4)*.006),0,Math.PI*2);c.fill();
  }c.restore();
 }else if(stop.name==='Asteroid belt'){
  // Sparse debris: the real belt is not a solid wall of rocks.
  for(let i=0;i<45;i++){
   const a=i*2.39996+(reduced?0:s.time*.012),r=radius*(.45+(i%7)/8);
   const px=x+Math.cos(a)*r*1.5,py=y+Math.sin(a)*r*.65;
   const shade=c.createRadialGradient(px-1,py-1,0,px,py,2+i%4);shade.addColorStop(0,'#bec5cd');shade.addColorStop(1,'#303844');c.fillStyle=shade;c.beginPath();c.arc(px,py,2+i%4,0,Math.PI*2);c.fill();
  }
 }else{
  const ring=()=>{c.strokeStyle='#d9cda89c';c.lineWidth=radius*.19;c.beginPath();c.ellipse(x,y,radius*1.65,radius*.5,-.28,0,Math.PI*2);c.stroke();c.strokeStyle='#f2dfb13c';c.lineWidth=radius*.07;c.beginPath();c.ellipse(x,y,radius*1.9,radius*.59,-.28,0,Math.PI*2);c.stroke();};
  if(stop.name==='Saturn')ring();
  c.save();c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.clip();c.fillStyle=stop.color;c.fillRect(x-radius,y-radius,radius*2,radius*2);
  const rotation=reduced?0:s.time*.035;
  for(let i=0;i<50;i++){
   const latitude=(i/49-.5)*Math.PI,cy=y+Math.sin(latitude)*radius;
   const banded=['Jupiter','Saturn','Venus','Uranus','Neptune'].includes(stop.name);
   if(banded){c.strokeStyle=`rgba(${i%3?'255,229,197':'41,57,83'},${stop.name==='Uranus'?.035:.08+(i%4)*.035})`;c.lineWidth=radius*(.025+(i%3)*.013);c.beginPath();for(let j=0;j<=24;j++){const px=x-radius+j*radius/12,py=cy+Math.sin(j*.6+i+rotation)*radius*.012;j?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
   else{const lon=i*2.39996+rotation,front=Math.cos(lon);if(front<0)continue;const px=x+Math.sin(lon)*Math.cos(latitude)*radius;
    c.fillStyle=stop.name==='Earth'?(i%4?'#589783':'#d7e9e5'):i%2?'#171e3033':'#e4cab052';c.beginPath();c.ellipse(px,cy,Math.max(1,radius*.13*front),radius*.065,i,0,Math.PI*2);c.fill();
   }
  }
  if(stop.name==='Pluto'){c.fillStyle='#edddc7';c.beginPath();c.ellipse(x+radius*.2,y+radius*.15,radius*.28,radius*.36,-.4,0,Math.PI*2);c.fill();}
  if(stop.name==='Jupiter'){c.fillStyle='#9f5d4ad9';c.beginPath();c.ellipse(x+radius*.25,y+radius*.3,radius*.24,radius*.1,-.1,0,Math.PI*2);c.fill();}
  const shadow=c.createRadialGradient(x-radius*.4,y-radius*.45,radius*.06,x+radius*.2,y+radius*.12,radius*1.2);shadow.addColorStop(0,'#ffffff24');shadow.addColorStop(.45,'#07101e00');shadow.addColorStop(.83,'#07101ea0');shadow.addColorStop(1,'#050a16f5');c.fillStyle=shadow;c.fillRect(x-radius,y-radius,radius*2,radius*2);c.restore();
  if(stop.name==='Saturn'){c.save();c.beginPath();c.rect(x-radius*2,y,radius*4,radius);c.clip();ring();c.restore();}
 }
 c.fillStyle='#e0e9f2';c.textAlign='center';c.font='14px Arial, sans-serif';if(!placement)c.fillText(stop.name,x,y+radius+24);
 c.restore();
}
