// Render the supplied animated models to portable Phaser spritesheets.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.glb':'model/gltf-binary'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(data);});
});
(async()=>{
 await new Promise(resolve=>server.listen(4175,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{const page=await browser.newPage();page.on('pageerror',e=>console.error(e.message));await page.goto('http://127.0.0.1:4175/tools/bake.html');
 await page.waitForFunction(()=>window.kotaroReady && window.bubaReady,{timeout:30000});
 console.log(await page.evaluate(()=>window.assetInfo));
 for(const name of ['Kotaro','Buba']){const data=await page.evaluate(name=>window['bake'+name](),name);const file=path.join(root,'public/assets/atia',name.toLowerCase()+'-sheet.png');fs.writeFileSync(file,Buffer.from(data.split(',')[1],'base64'));console.log('Saved '+file);}
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
