import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,LEVELS} from '../game/engine.mjs';
import {render} from '../game/render.mjs';
test('scene draws finite geometry at desktop and mobile dimensions throughout the course',()=>{
 globalThis.window={devicePixelRatio:2};let calls=0;
 const gradient={addColorStop(){}};
 const ctx=new Proxy({}, {get:(_,name)=>(name==='createLinearGradient'||name==='createRadialGradient')?()=>gradient:(...args)=>{calls++;for(const value of args)if(typeof value==='number')assert(Number.isFinite(value),String(name));},set:()=>true});
 for(const level of LEVELS)for(const [width,height] of [[360,530],[1360,720]])for(const z of [0,1349,2800,5700,8600,11999,14000,18000,21000,24500,29000,29999]){
 const canvas={clientWidth:width,clientHeight:height,width:0,height:0,getContext:()=>ctx};
 render(canvas,Object.assign(createState(level.id),{z,time:36,x:.6,y:90,boosting:true,invincible:1}));
 assert.equal(canvas.width,width*2);assert.equal(canvas.height,height*2);
 }assert(calls>1000);
 delete globalThis.window;
});
