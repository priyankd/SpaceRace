// Source-photo disk coordinates keep the visible planet aligned with its hitbox.
const portraits={
 Sun:{cx:256,cy:196,r:177},
 Mercury:{cx:277,cy:277,r:252},
 Venus:{cx:165,cy:165,r:148},
 Earth:{cx:382,cy:209,r:204},
 Mars:{cx:223,cy:223,r:222},
 Jupiter:{cx:118,cy:108,r:99},
 Saturn:{cx:277,cy:282,r:155,ring:{x:277,y:275,outer:374,minor:34,inner:286,innerMinor:17,angle:.785}},
 Uranus:{cx:290,cy:153,r:129,ring:{x:290,y:157,outer:259,minor:48,inner:207,innerMinor:29,angle:-.4}},
 Neptune:{cx:274,cy:282,r:240},
 Pluto:{cx:367,cy:206,r:159},
};
const images=new Map();
export function drawPlanetImage(c,name,x,y,radius){
 const shape=portraits[name];if(!shape||typeof Image==='undefined')return false;
 let img=images.get(name);
 if(!img){img=new Image();images.set(name,img);img.src=`/assets/planet-${name.toLowerCase()}.png`;}
 if(!img.complete||!img.naturalWidth)return false;
 c.save();c.translate(x,y);c.scale(radius/shape.r,radius/shape.r);c.translate(-shape.cx,-shape.cy);
 // Clip at render time; the user's original photos remain untouched.
 if(name==='Sun'){
  c.save();c.globalCompositeOperation='screen';c.drawImage(img,0,0);c.restore();
 }
 if(shape.ring){
  const ring=shape.ring;c.save();c.beginPath();
  c.ellipse(ring.x,ring.y,ring.outer,ring.minor,ring.angle,0,Math.PI*2);
  c.ellipse(ring.x,ring.y,ring.inner,ring.innerMinor,ring.angle,0,Math.PI*2);
  c.clip('evenodd');c.drawImage(img,0,0);c.restore();
 }
 c.beginPath();c.arc(shape.cx,shape.cy,shape.r,0,Math.PI*2);c.clip();c.drawImage(img,0,0);c.restore();
 return true;
}
