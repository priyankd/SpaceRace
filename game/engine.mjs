import {SOLAR_STOPS} from './solar-tour.mjs';
import {asteroidSize} from './sprites.mjs';
export const LENGTH = 30000;
const SPEED_MULTIPLIER = 3;
export const FACTS = [
  {title:'A lighter leap', text:'The Moon’s surface gravity is about one-sixth of Earth’s. The same push can send you higher and keep you airborne longer.', at:1800},
  {title:'A sky without blue', text:'The Moon has an extremely thin atmosphere called an exosphere. It cannot scatter sunlight into a blue sky like Earth’s atmosphere.', at:5000},
  {title:'Craters keep stories', text:'Impacts leave craters on the Moon. With almost no atmosphere and no flowing surface water, many remain for millions of years.', at:9000},
];
export const OBSTACLES = [
 {z:2800,x:-.48,type:'rock'}, {z:3400,x:.48,type:'rock'},
 {z:4400,x:0,type:'asteroid'}, {z:5700,x:0,type:'laser'},
 {z:6800,x:.45,type:'rock'}, {z:7600,x:0,type:'asteroid'},
 {z:8600,x:0,type:'laser'}, {z:10000,x:-.42,type:'rock'},
 {z:10500,x:.48,type:'rock'}, {z:11200,x:0,type:'asteroid'},
 // Boulder slalom: shorter gaps reward braking before changing lanes.
 {z:12600,x:-.55,type:'rock'}, {z:12600,x:0,type:'rock'}, {z:13100,x:.48,type:'rock'},
 {z:13600,x:.55,type:'rock'}, {z:13600,x:0,type:'rock'}, {z:14100,x:.48,type:'rock'},
 {z:14800,x:0,type:'asteroid',rate:1.6},
 {z:15700,x:0,type:'laser'},
 // Far-side crossing: faster moving hazards between leap zones.
 {z:17300,x:0,type:'asteroid',rate:1.7},
 {z:17900,x:.5,type:'rock'}, {z:18500,x:-.5,type:'rock'},
 {z:19100,x:0,type:'asteroid',rate:1.8},
 {z:19800,x:0,type:'laser'},
 {z:21400,x:.48,type:'rock'}, {z:21900,x:-.48,type:'rock'},
 {z:22500,x:0,type:'asteroid',rate:1.8},
 {z:23300,x:0,type:'laser'},
 // Final gauntlet: alternating rocks and staggered, shorter gate windows.
 {z:24500,x:-.55,type:'rock'}, {z:24500,x:0,type:'rock'}, {z:25000,x:.55,type:'rock'}, {z:25000,x:0,type:'rock'},
 {z:25500,x:0,type:'asteroid',rate:2},
 {z:26400,x:0,type:'laser'},
 {z:27100,x:.48,type:'rock'}, {z:27600,x:-.48,type:'rock'},
 {z:28200,x:0,type:'asteroid',rate:2},
 {z:29000,x:0,type:'laser'},
 // Upper flight levels: high boulders, moving asteroids and elevated gates.
 {z:3200,x:0,y:260,type:'rock'},
 {z:5100,x:.45,y:350,type:'rock'},
 {z:7200,x:-.4,y:230,type:'rock'},
 {z:9400,x:0,y:340,type:'asteroid',rate:1.5},
 {z:12200,x:0,y:240,type:'laser'},
 {z:15200,x:0,y:360,type:'rock'},
 {z:18200,x:0,y:260,type:'asteroid',rate:1.8},
 {z:21000,x:0,y:250,type:'laser'},
 {z:23000,x:-.4,y:380,type:'rock'},
 {z:25900,x:0,y:300,type:'asteroid',rate:2},
 {z:28500,x:.4,y:350,type:'rock'},
].sort((a,b)=>a.z-b.z);
const notes=(entries)=>entries.map(([title,text],i)=>({title,text,at:[1800,9000,21000][i]}));
const variant=(seed)=>OBSTACLES.map((o,i)=>({...o,
 z:o.z+(o.z>2000?((i+seed)%3-1)*100:0),
 x:o.type==='laser'?0:(seed%2?-o.x:o.x),
 y:o.type==='laser'?(i%3===0?220:0):[0,130,290,360][(i+seed)%4],
 rate:(o.rate??1.2)+seed*.15,
})).concat(Array.from({length:seed*4},(_,i)=>({z:4200+i*(23000/(seed*4)),x:i%2?.55:-.55,y:i%3*140,type:'asteroid',rate:1.4+seed*.2}))).sort((a,b)=>a.z-b.z);
export const LEVELS=[
 {id:'moon',name:'Moon Leap',world:'Earth’s Moon',number:'01',tag:'Lunar flight',description:'Fly above silver craters and weave through floating boulders. A safe practice stretch starts your adventure.',length:LENGTH,obstacles:OBSTACLES,facts:FACTS,source:'https://science.nasa.gov/moon/facts/',sky:['#050c1b','#101c37','#273453'],terrain:['#303c53','#39465a','#435166'],accent:'#d5f48a',stat:'1/6',statLabel:'EARTH’S SURFACE GRAVITY',sections:['Crater crossing','Meteor pass','Boulder slalom','Far-side crossing']},
 {id:'mars',name:'Mars Explorer',world:'Mars',number:'02',tag:'Canyon slalom',description:'Sweep over rust-red canyons. Alternating high and low boulders make this a vertical slalom.',length:LENGTH,obstacles:variant(1),facts:notes([
 ['A rusty world','Iron minerals in Martian soil oxidize, giving much of the surface its reddish color.'],
 ['A giant volcano','Mars is home to Olympus Mons, the largest volcano in our solar system.'],
 ['Two small companions','Mars has two small moons, Phobos and Deimos. Both are irregularly shaped.'],
 ]),source:'https://science.nasa.gov/mars/facts/',sky:['#281520','#6e3e42','#bd775b'],terrain:['#613b37','#8a4b39','#b76b4d'],accent:'#ffb489',stat:'2',statLabel:'SMALL MOONS',sections:['Rust canyon','Olympus approach','Boulder slalom','Phobos crossing']},
 {id:'jupiter',name:'Jupiter Storm Run',world:'Jupiter orbit',number:'03',tag:'Cloud-top chase',description:'Race above swirling cloud bands. Faster moving obstacles and stacked gates fill this fictional orbital course.',length:LENGTH,obstacles:variant(2),facts:notes([
 ['The solar system’s giant','Jupiter is the largest planet in our solar system.'],
 ['A storm with a name','The Great Red Spot is a gigantic, long-lived storm in Jupiter’s atmosphere.'],
 ['No road down below','Jupiter is a gas giant made mostly of hydrogen and helium. It has no solid surface to drive on.'],
 ]),source:'https://science.nasa.gov/jupiter/jupiter-facts/',sky:['#121120','#40324e','#8e6b65'],terrain:['#78626a','#b88f77','#dfb99a'],accent:'#e9bbff',stat:'1st',statLabel:'LARGEST PLANET',sections:['Cloud bands','Storm approach','Orbital slalom','Giant crossing']},
 {id:'saturn',name:'Saturn Ring Rally',world:'Saturn orbit',number:'04',tag:'Ice-field finale',description:'Fly beside Saturn’s rings through a dense field of icy obstacles. Save your boost for the clear gaps.',length:LENGTH,obstacles:variant(3),facts:notes([
 ['Rings of tiny worlds','Saturn’s rings contain countless pieces of ice and rock, ranging widely in size.'],
 ['A gas giant','Like Jupiter, Saturn is made mostly of hydrogen and helium and has no solid surface to land on.'],
 ['Moving at different speeds','Particles in different parts of Saturn’s rings orbit the planet at different speeds.'],
 ]),source:'https://science.nasa.gov/saturn/facts/',sky:['#091825','#254052','#6c7e89'],terrain:['#596b7b','#8d9296','#c3bb9f'],accent:'#9debf1',stat:'ICE',statLabel:'A MAIN INGREDIENT OF THE RINGS',sections:['Ring approach','Ice field','Orbital slalom','Outer crossing']},
];
export function getLevel(id='moon'){return LEVELS.find(level=>level.id===id)??LEVELS[0];}
// Smooth alternating sweep, slalom and hairpin approaches in world units.
export function coursePose(z,levelId='moon'){
 const index=Math.max(0,LEVELS.findIndex(level=>level.id===levelId));
 const points=[0,0,950,-1100,1450,-1450,450,1550,-1300,1000,-1600,1200,-650,1450,-950,0];
 const distance=Math.max(0,Math.min(LENGTH,z))/2000;
 const segment=Math.min(points.length-2,Math.floor(distance)),t=distance-segment;
 const a=points[segment],b=points[segment+1],scale=1+index*.12;
 const ease=t*t*t*(10+t*(-15+6*t));
 return {x:(a+(b-a)*ease)*scale,heading:(b-a)*30*t*t*(1-t)*(1-t)/2000*scale};
}
// Box frames define a continuous flight corridor, including elevated gates.
const corridors=new Map();
export function flightBounds(z,levelId='moon'){
 const level=getLevel(levelId);
 let nodes=corridors.get(level.id);
 if(!nodes){const frames=new Map(Array.from({length:level.length/2000+1},(_,i)=>[i*2000,0]));for(const o of level.obstacles)if(o.type==='laser')frames.set(o.z,o.y??0);nodes=[...frames].sort((a,b)=>a[0]-b[0]);corridors.set(level.id,nodes);}
 let left=nodes[0],right=nodes[nodes.length-1];
 for(let i=1;i<nodes.length;i++)if(z<=nodes[i][0]){left=nodes[i-1];right=nodes[i];break;}
 const t=Math.max(0,Math.min(1,(z-left[0])/Math.max(1,right[0]-left[0])));
 const floor=left[1]+(right[1]-left[1])*t*t*(3-2*t);
 return {floor,ceiling:floor+360,minX:-.84,maxX:.84,minY:floor+8,maxY:floor+250};
}
export function bestKey(id='moon'){return `space-race-best-half-lasers-v3-${getLevel(id).id}`;}
export function createState(levelId='moon'){return {levelId:getLevel(levelId).id,mode:'briefing',resumeMode:'racing',countdown:0,goTime:0,z:0,x:0,speed:0,time:0,boost:100,y:8,vy:0,lives:3,recoveries:0,invincible:0,found:/** @type {number[]} */ ([]),notice:'',noticeTime:0,boosting:false,jumps:0};}
export function laserOn(o){return o.type==='laser';}
export function laserBounds(o){
 const side=o.side??'left',floor=o.y??0;
 return {minX:side==='right'?0:-600,maxX:side==='left'?0:600,
 minY:floor+(side==='upper'?180:0),maxY:floor+(side==='lower'?180:360)};
}
export function obstacleX(o,time){return o.type==='asteroid'?Math.sin(time*(o.rate??1.2)+o.z)*.68:o.x;}
export function announce(s,text){s.notice=text;s.noticeTime=4;}
export function recover(s){s.x*=.6;s.speed=Math.min(s.speed,100);s.y=Math.max(flightBounds(s.z,s.levelId).minY,Math.min(flightBounds(s.z,s.levelId).maxY,s.y));s.vy=0;}
export function collisionHit(s,o){
 const relativeY=s.y-(o.y??0);
 if(o.type==='laser'){const b=laserBounds(o);return s.x*600+35>b.minX&&s.x*600-35<b.maxX&&s.y+90>b.minY&&s.y<b.maxY;}
 if(o.type==='planet')return Math.pow((s.x-o.x)*600/(o.radius+35),2)+Math.pow((s.y+45-o.y)/(o.radius+45),2)<1;
 const size=asteroidSize(o);
 return Math.abs(s.x-obstacleX(o,s.time))<(size.width/2+35)/600&&relativeY>-105&&relativeY<size.height+10;
}
// Miniature planets leave a clear lane and appear during their matching flyby.
for(const level of LEVELS){
 let laserIndex=0;
 level.obstacles=level.obstacles.map(o=>o.type==='laser'?{...o,side:['left','lower','right','upper'][laserIndex++%4]}:o);
 const planets=SOLAR_STOPS.flatMap((stop,i)=>{
  if(stop.name==='Sun'||stop.name==='Asteroid belt')return [];
  let z=Math.round((i+.55)*level.length/SOLAR_STOPS.length);
  const end=(i+.95)*level.length/SOLAR_STOPS.length;
  while(level.obstacles.some(o=>Math.abs(o.z-z)<200)&&z<end)z+=25;
  const floor=flightBounds(z,level.id).floor;
  return [{type:'planet',name:stop.name,z,x:i%2?-.42:.42,y:floor+125,radius:stop.name==='Jupiter'?115:stop.name==='Saturn'?95:85}];
 });
 level.obstacles=[...level.obstacles,...planets].sort((a,b)=>a.z-b.z);
}
export function startRace(levelId='moon'){
 return {...createState(levelId),mode:'countdown',countdown:3};
}
export function step(s,input,dt){
 if(s.mode==='countdown'){
  s.countdown=Math.max(0,s.countdown-Math.min(.05,Math.max(0,dt)));
  if(s.countdown<1e-8){s.countdown=0;s.mode='racing';s.goTime=.7;}
  return;
 }
 if(s.mode!=='racing')return;
 const level=getLevel(s.levelId);
 dt=Math.min(.05,Math.max(0,dt));s.goTime=Math.max(0,s.goTime-dt);s.time+=dt;s.noticeTime=Math.max(0,s.noticeTime-dt);s.invincible=Math.max(0,s.invincible-dt);
 const previous=s.z;
 s.boosting=!!input.boost&&s.boost>1&&!!input.accelerate;
 const max=(s.boosting?310:210)*SPEED_MULTIPLIER;
 s.speed=Math.max(0,Math.min(max,s.speed+(input.accelerate?105:-230)*SPEED_MULTIPLIER*dt));
 s.boost=Math.max(0,Math.min(100,s.boost+(s.boosting?-27:12)*dt));
 s.x+=(Number(!!input.right)-Number(!!input.left))*dt*(.55+s.speed/(210*SPEED_MULTIPLIER));
 s.vy=(Number(!!input.rise)-Number(!!input.descend))*220;
 s.y+=s.vy*dt;
 s.z+=s.speed*dt;
 const bounds=flightBounds(s.z,s.levelId);
 s.x=Math.max(bounds.minX,Math.min(bounds.maxX,s.x));
 s.y=Math.max(bounds.minY,Math.min(bounds.maxY,s.y));
 if((s.y===bounds.maxY&&s.vy>0)||(s.y===bounds.minY&&s.vy<0))s.vy=0;
 for(const o of level.obstacles){if(previous<o.z&&s.z>=o.z&&collisionHit(s,o)){
  recover(s);s.lives=Math.max(0,s.lives-1);s.recoveries++;s.invincible=1.2;
  if(s.lives===0){s.mode='gameover';s.speed=0;s.boosting=false;s.invincible=0;return;}
 }}
 level.facts.forEach((f,i)=>{if(s.z>=f.at&&!s.found.includes(i)){s.found.push(i);announce(s,f.title+' · saved to journal');}});
 if(s.z>=level.length){s.z=level.length;s.mode='finished';s.speed=0;s.boosting=false;}
}
export function clock(t){return `${Math.floor(t/60)}:${Math.floor(t%60).toString().padStart(2,'0')}.${Math.floor(t%1*10)}`;}
