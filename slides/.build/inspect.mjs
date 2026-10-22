import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
const p=await PresentationFile.importPptx(await FileBlob.load(fileURLToPath(new URL('source-template.pptx',import.meta.url))));
const r=await p.inspect({select:'$.slides[*]',include:['id','index','layout','elements.id','elements.kind','elements.text','elements.position','elements.style']});
await fs.writeFile(new URL('reference-inspect.json',import.meta.url),JSON.stringify(r.records,null,2));
for (let i=0;i<p.slides.items.length;i++) {
 const s=p.slides.items[i];
 console.log('SLIDE',i+1,s.id, 'shapes',s.shapes.items.map(x=>({id:x.id,text:String(x.text),position:x.position})), 'images',s.images.items.map(x=>({id:x.id,position:x.position})));
}
console.log('master count',p.masters.items.length);
console.log('slide proto',Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides.items[0])));
console.log('collection proto',Object.getOwnPropertyNames(Object.getPrototypeOf(p.slides)));
