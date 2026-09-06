import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,startRace,step,recover,LEVELS,getLevel,bestKey,collisionHit,coursePose,flightBounds,LENGTH,OBSTACLES,obstacleX,laserOn} from '../game/engine.mjs';
const race=()=>Object.assign(createState(),{mode:'racing'});
const tick=(s,input,n=60)=>{for(let i=0;i<n;i++)step(s,input,1/60);};
test('briefing and pause freeze all race physics',()=>{const s=createState();tick(s,{accelerate:true});assert.equal(s.z,0);s.mode='paused';tick(s,{accelerate:true});assert.equal(s.time,0);});
test('releasing the accelerator brakes to a stop and recharges boost',()=>{const s=race();tick(s,{accelerate:true},120);assert.equal(s.speed,630);tick(s,{accelerate:true,boost:true},120);assert.equal(s.speed,930);assert(s.boost<50);tick(s,{},120);assert.equal(s.speed,0);assert(s.boost>50);});
test('box walls stop sideways movement without a recovery',()=>{const s=race();tick(s,{right:true},180);assert.equal(s.x,flightBounds(s.z).maxX);tick(s,{left:true},360);assert.equal(s.x,flightBounds(s.z).minX);assert.equal(s.recoveries,0);});
test('car stays in flight through former ramp locations',()=>{const s=race();s.z=1349;s.speed=150;tick(s,{accelerate:true});assert.equal(s.y,8);assert.equal(s.vy,0);assert.equal(s.jumps,0);assert(s.z>1350);});
test('three impacts consume three lives and freeze the run until restart',()=>{
 const s=race();
 for(let hit=1;hit<=3;hit++){
  Object.assign(s,{z:2799,x:-.48,y:8,speed:150});step(s,{accelerate:true},.02);
  assert.equal(s.lives,3-hit);assert.equal(s.recoveries,hit);
 }
 assert.equal(s.mode,'gameover');assert.equal(s.speed,0);assert.equal(s.boosting,false);
 const frozen={...s};tick(s,{accelerate:true,boost:true});assert.deepEqual(s,frozen);
 assert.equal(createState().lives,3);
});
test('half-wall lasers remain on and have matching safe openings',()=>{
 for(const level of LEVELS)for(const o of level.obstacles.filter(o=>o.type==='laser')){
  for(const time of [0,1.7,4,12])assert(laserOn(o,time));
  const floor=o.y??0;
  const blocked={left:[-.5,floor+80],right:[.5,floor+80],upper:[0,floor+210],lower:[0,floor+30]}[o.side];
  const safe={left:[.5,floor+80],right:[-.5,floor+80],upper:[0,floor+30],lower:[0,floor+210]}[o.side];
  for(const [coords,lives] of [[blocked,2],[safe,3]]){
   const state=Object.assign(createState(level.id),{mode:'racing',z:o.z-1,x:coords[0],y:coords[1],speed:150});
   step(state,{accelerate:true},.02);assert.equal(state.lives,lives,level.id+' '+o.side);
  }
 }
});
test('discoveries do not gate completion, finish freezes and replay resets',()=>{const s=race();s.z=LENGTH-1;s.speed=200;step(s,{accelerate:true},.02);assert.equal(s.mode,'finished');const t=s.time;tick(s,{accelerate:true});assert.equal(s.time,t);assert.equal(createState().found.length,0);});
for(const level of LEVELS)test(`a driver can finish ${level.name} with steering and braking`,()=>{
 const s=Object.assign(createState(level.id),{mode:'racing'});
 for(let i=0;i<60*600&&s.mode==='racing';i++){
  const o=level.obstacles.find(o=>o.z>s.z&&o.z-s.z<700);
  let target=s.x,targetY=s.y,brake=s.speed>180;
  if(o){
   const distance=o.z-s.z,arrival=s.time+distance/Math.max(100,s.speed);
   const predicted={...s,time:arrival,y:Math.max(flightBounds(o.z,level.id).minY,Math.min(flightBounds(o.z,level.id).maxY,s.y))};
   const group=level.obstacles.filter(other=>Math.abs(other.z-o.z)<50);
   if(o.type==='laser'){
    const floor=o.y??0;
    target=o.side==='left'?.55:o.side==='right'?-.55:0;
    targetY=Math.max(flightBounds(s.z,level.id).minY,Math.min(flightBounds(s.z,level.id).maxY,floor+(o.side==='lower'?220:30)));
    if(distance<200&&(Math.abs(s.x-target)>.08||Math.abs(s.y-targetY)>15))brake=true;
   }
   else{
    const safe=[-.8,-.65,-.4,0,.4,.65,.8].filter(x=>group.every(other=>!collisionHit({...predicted,x},other)));
    target=safe.sort((a,b)=>Math.abs(a-s.x)-Math.abs(b-s.x))[0]??s.x;
    if(distance<150&&Math.abs(target-s.x)>.08)brake=true;
   }
  }
  step(s,{accelerate:!brake,left:s.x>target+.02,right:s.x<target-.02,rise:s.y<targetY-5,descend:s.y>targetY+5},1/60);
 }
 assert.equal(s.mode,'finished');assert.equal(s.found.length,3);assert(s.lives>0);
});
test('manual recovery never erases discoveries',()=>{const s=race();s.found=[0];recover(s);assert.deepEqual(s.found,[0]);});
test('vertical controls climb, descend and hold altitude on release',()=>{const s=race();tick(s,{rise:true},30);assert(s.y>100);const altitude=s.y;tick(s,{});assert.equal(s.y,altitude);assert.equal(s.vy,0);tick(s,{descend:true},30);assert(Math.abs(s.y-8)<1e-8);tick(s,{rise:true,descend:true});assert(Math.abs(s.y-8)<1e-8);});
test('vertical flight limits and recovery keep the car in the flight envelope',()=>{const s=race();tick(s,{rise:true},300);assert.equal(s.y,flightBounds(s.z).maxY);assert.equal(s.vy,0);tick(s,{descend:true},300);assert.equal(s.y,flightBounds(s.z).minY);recover(s);assert.equal(s.y,8);assert.equal(s.vy,0);});
test('flight stays inside rising and falling boxes during a whole run',()=>{for(const level of LEVELS){const s=Object.assign(createState(level.id),{mode:'racing'});for(let i=0;i<15000&&s.mode==='racing';i++){step(s,{accelerate:true,boost:true,right:i%200<100,left:i%200>=100,rise:i%180<90,descend:i%180>=90},1/60);const b=flightBounds(s.z,level.id);assert(s.x>=b.minX&&s.x<=b.maxX);assert(s.y>=b.minY&&s.y<=b.maxY);}}});
test('levels have separate records, discoveries and race resets',()=>{
 assert.equal(new Set(LEVELS.map(l=>bestKey(l.id))).size,LEVELS.length);
 for(const level of LEVELS){const s=createState(level.id);s.mode='racing';s.z=level.length-1;s.speed=200;step(s,{accelerate:true},.02);assert.equal(s.mode,'finished');assert.equal(s.found.length,3);const replay=createState(level.id);assert.equal(replay.levelId,level.id);assert.equal(replay.z,0);assert.equal(replay.found.length,0);assert.equal(level.facts.length,3);}
 assert.equal(getLevel('invalid').id,'moon');
});

test('collisions and recentering never rewind distance or create checkpoints',()=>{const s=race();s.z=12500;s.speed=600;recover(s);assert.equal(s.z,12500);assert.equal('checkpoint' in s,false);assert.equal(s.speed,100);});

test('winding routes alternate direction and join smoothly in every world',()=>{
 for(const level of LEVELS){
  assert.equal(coursePose(0,level.id).x,0);
  const headings=Array.from({length:60},(_,i)=>coursePose(i*500,level.id).heading);
  assert(headings.some(h=>h>.5));assert(headings.some(h=>h<-.5));
  for(let z=2000;z<LENGTH;z+=2000){
   const a=coursePose(z-.01,level.id),b=coursePose(z+.01,level.id);
   assert(Math.abs(a.x-b.x)<.001);assert(Math.abs(a.heading-b.heading)<.001);
  }
  for(const gate of level.obstacles.filter(o=>o.type==='laser'))assert.equal(flightBounds(gate.z,level.id).floor,gate.y??0);
 }
 assert.notEqual(coursePose(4000,'moon').x,coursePose(4000,'saturn').x);
});

test('each planet has a collidable center and a safe passing lane',()=>{
 for(const level of LEVELS){
  const planets=level.obstacles.filter(o=>o.type==='planet');
  assert.deepEqual(planets.map(o=>o.name),['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']);
  for(const o of planets){
   const s=Object.assign(createState(level.id),{mode:'racing',z:o.z-1,x:o.x,y:o.y-45,speed:150});
   step(s,{accelerate:true},.02);assert.equal(s.lives,2,o.name);
   const safe=Object.assign(createState(level.id),{mode:'racing',z:o.z-1,x:o.x>0?-.8:.8,y:o.y-45,speed:150});
   step(safe,{accelerate:true},.02);assert.equal(safe.lives,3,o.name);
  }
 }
});
test('recenter cannot consume lives or grant collision immunity',()=>{
 const s=race();recover(s);assert.equal(s.lives,3);assert.equal(s.invincible,0);assert.equal(s.recoveries,0);
 Object.assign(s,{z:5699,speed:150,time:0});step(s,{accelerate:true},.02);assert.equal(s.lives,2);
 step(s,{accelerate:true},.02);assert.equal(s.lives,2);
});

test('launch counts down three seconds before race time or movement begins',()=>{
 const s=startRace('mars');assert.equal(s.countdown,3);assert.equal(s.mode,'countdown');
 tick(s,{accelerate:true,boost:true,rise:true},60);assert(Math.abs(s.countdown-2)<1e-8);assert.equal(s.z,0);assert.equal(s.time,0);assert.equal(s.y,8);
 s.resumeMode=s.mode;s.mode='paused';const remaining=s.countdown;tick(s,{accelerate:true},120);assert.equal(s.countdown,remaining);
 s.mode=s.resumeMode;tick(s,{accelerate:true},120);assert.equal(s.mode,'racing');assert.equal(s.time,0);assert.equal(s.z,0);assert(s.goTime>0);
 tick(s,{accelerate:true},60);assert(s.z>0);assert.equal(s.goTime,0);
 const retry=startRace(s.levelId);assert.equal(retry.countdown,3);assert.equal(retry.lives,3);assert.equal(retry.z,0);
});
