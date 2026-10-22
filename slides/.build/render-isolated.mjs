import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const {slideCount}=JSON.parse(readFileSync(new URL('manifest.json',import.meta.url),'utf8'));
for(let i=1;i<=slideCount;i++){
 const r=spawnSync(process.execPath,[fileURLToPath(new URL('render-one.mjs',import.meta.url)),String(i)],{encoding:'utf8'});
 if(r.status!==0)throw new Error(r.stderr);
 console.log('Rendered slide',i);
}
