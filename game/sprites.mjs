const assets=new Map();
export const asteroidNames=['asteroid-round','asteroid-long','asteroid-angular'];
export function asteroidVariant(o){return Math.abs(Math.floor(o.z/100)+Math.round((o.y??0)/30)+Math.round((o.x??0)*10))%3;}
export function asteroidSize(o){return [{width:202,height:170},{width:242,height:158},{width:226,height:166}][asteroidVariant(o)];}
const outlines={
 'asteroid-round':[[.148,.51],[.183,.379],[.257,.255],[.318,.148],[.415,.079],[.519,.038],[.63,.052],[.736,.098],[.8,.189],[.839,.298],[.868,.39],[.862,.513],[.84,.65],[.796,.766],[.737,.86],[.64,.918],[.516,.956],[.406,.963],[.307,.934],[.232,.863],[.181,.758],[.158,.639]],
 'asteroid-long':[[.047,.782],[.091,.675],[.161,.585],[.228,.518],[.301,.414],[.389,.329],[.478,.275],[.529,.175],[.628,.107],[.714,.038],[.808,.03],[.887,.065],[.935,.121],[.96,.206],[.949,.326],[.9,.453],[.817,.562],[.72,.67],[.604,.78],[.491,.866],[.371,.921],[.252,.966],[.149,.956],[.08,.892]],
 'asteroid-angular':[[.087,.509],[.16,.32],[.262,.196],[.384,.084],[.505,.032],[.604,.025],[.691,.064],[.782,.042],[.884,.087],[.9,.151],[.867,.231],[.86,.334],[.843,.424],[.857,.48],[.903,.511],[.916,.557],[.887,.623],[.837,.691],[.77,.773],[.68,.866],[.577,.934],[.444,.975],[.33,.956],[.234,.881],[.152,.787],[.104,.657]],
 'supercar-rear':[[.031,.8],[.035,.65],[.044,.51],[.068,.411],[.077,.369],[.06,.376],[.056,.392],[.058,.342],[.064,.303],[.094,.303],[.172,.305],[.214,.241],[.236,.188],[.212,.195],[.181,.208],[.136,.201],[.116,.168],[.128,.142],[.179,.132],[.205,.151],[.211,.17],[.26,.125],[.293,.071],[.331,.054],[.397,.049],[.474,.061],[.526,.061],[.603,.049],[.669,.054],[.707,.071],[.74,.125],[.789,.17],[.795,.151],[.821,.132],[.872,.142],[.884,.168],[.864,.201],[.819,.208],[.788,.195],[.764,.188],[.786,.241],[.828,.305],[.906,.303],[.936,.303],[.942,.342],[.944,.392],[.94,.376],[.923,.369],[.932,.411],[.956,.51],[.965,.65],[.969,.8],[.95,.907],[.906,.914],[.84,.908],[.75,.891],[.645,.889],[.608,.92],[.6,.932],[.535,.927],[.465,.927],[.4,.932],[.392,.92],[.355,.889],[.25,.891],[.16,.908],[.094,.914],[.05,.907]],
};
export function getSprite(name){
 if(typeof Image==='undefined')return null;
 let item=assets.get(name);
 if(!item){const img=new Image();item={img,ready:false};assets.set(name,item);img.onload=()=>{item.ready=true;};img.src=`/assets/${name}.png`;}
 return item.ready?item.img:null;
}
export function preloadSprites(){for(const name of ['supercar-rear',...asteroidNames])getSprite(name);}
export function drawSprite(c,name,x,y,width,height){
 const img=getSprite(name);if(!img)return false;
 const outline=outlines[name];
 const minX=Math.min(...outline.map(p=>p[0])),maxX=Math.max(...outline.map(p=>p[0]));
 const minY=Math.min(...outline.map(p=>p[1])),maxY=Math.max(...outline.map(p=>p[1]));
 // Render-time clipping preserves the source PNG and excludes its backdrop.
 c.save();c.translate(x,y);c.scale(width/(maxX-minX),height/(maxY-minY));c.translate(-minX,-minY);
 c.beginPath();outline.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();c.clip();
 c.drawImage(img,0,0,1,1);c.restore();return true;
}
