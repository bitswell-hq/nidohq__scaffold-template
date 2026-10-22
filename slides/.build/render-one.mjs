import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import {FileBlob,PresentationFile} from '@oai/artifact-tool';
const root=fileURLToPath(new URL('../',import.meta.url));
const i=Number(process.argv[2]);
const p=await PresentationFile.importPptx(await FileBlob.load(root+'/output/hack-meridian-smart-accounts.pptx'));
await fs.writeFile(root+'/.build/final-render/slide-'+i+'.png',new Uint8Array(await (await p.export({slide:p.slides.items[i-1],format:'png',scale:1.5})).arrayBuffer()));
