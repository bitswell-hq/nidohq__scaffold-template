// The whole deck pipeline: build → finalize → render with LibreOffice and
// Inter → HTML preview and text notes → dist/. `node .build/make-dist.mjs`
//
// Needs the Codex presentations runtime (artifact-tool, validators, soffice),
// the Inter TTFs (https://github.com/rsms/inter/releases,
// Inter-{Regular,Medium,SemiBold,Bold,Light}.ttf) and JetBrains Mono NL for
// code (https://github.com/JetBrains/JetBrainsMono/releases,
// JetBrainsMonoNL-Regular.ttf). runtime.mjs lists the
// environment variables that locate each, with their defaults.
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import {fonts,nodeModules,pdftoppm,soffice} from './runtime.mjs';

const build=fileURLToPath(new URL('./',import.meta.url));
const root=path.join(build,'..');
const name='hack-meridian-smart-accounts';
const run=(cmd,args,env={})=>execFileSync(cmd,args,{stdio:'inherit',env:{...process.env,...env}});

// The build scripts import artifact-tool, which Node resolves from
// .build/node_modules: link it to the runtime's copy.
const linked=path.join(build,'node_modules');
if(!await fs.lstat(linked).catch(()=>null))await fs.symlink(nodeModules,linked);

run(process.execPath,[path.join(build,'build.mjs')]);
run(process.execPath,[path.join(build,'finalize.mjs')]);

// Render the final .pptx the way PowerPoint-less viewers will see it, with
// Inter and the code font installed through a private fontconfig.
const faces=[...['Regular','Medium','SemiBold','Bold','Light'].map(w=>`Inter-${w}.ttf`),'JetBrainsMonoNL-Regular.ttf'];
for(const face of faces)
 await fs.access(path.join(fonts,face)).catch(()=>{throw new Error(`Missing ${fonts}/${face}`)});
const cache=path.join(build,'font-cache');
await fs.mkdir(cache,{recursive:true});
const fontconfig=path.join(cache,'fonts.conf');
await fs.writeFile(fontconfig,`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fonts}</dir><cachedir>${cache}</cachedir></fontconfig>\n`);
const renders=path.join(build,'lo-render');
await fs.rm(renders,{recursive:true,force:true});
await fs.mkdir(renders,{recursive:true});
run(soffice,['--headless','--convert-to','pdf','--outdir',renders,path.join(root,'output',`${name}.pptx`)],{FONTCONFIG_FILE:fontconfig});
const pdf=path.join(renders,`${name}.pdf`);
run(pdftoppm,['-jpeg','-jpegopt','quality=80','-scale-to-x','1440','-scale-to-y','-1',pdf,path.join(renders,'slide')]);

run(process.execPath,[path.join(build,'review.mjs')]);
run(process.execPath,[path.join(build,'notes.mjs')]);

const dist=path.join(root,'dist');
await fs.mkdir(dist,{recursive:true});
await fs.copyFile(path.join(root,'output',`${name}.pptx`),path.join(dist,`${name}.pptx`));
await fs.copyFile(pdf,path.join(dist,`${name}.pdf`));
for(const f of await fs.readdir(dist))console.log('dist/'+f,((await fs.stat(path.join(dist,f))).size/1e6).toFixed(1)+' MB');
