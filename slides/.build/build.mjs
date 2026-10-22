// Build the deck: duplicate a template slide per content entry, fill it, write
// speaker notes, and render a PNG per slide. `node .build/build.mjs`; see
// make-dist.mjs for the whole pipeline (finalize, render, preview, dist/).
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {FileBlob, PresentationFile} from '@oai/artifact-tool';
import {slides as content,templateUrl} from './content.mjs';
import {highlight,palette,languageName} from './highlight.mjs';
import {schedule,timing,talkSeconds,talkSlides} from './schedule.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const build=path.join(root,'.build');
const source=path.join(build,'source-template.pptx');
const shots=path.join(root,'assets');
const p=await PresentationFile.importPptx(await FileBlob.load(source));
const originals=[...p.slides.items];
const output=[];
const black='#000000',white='#FFFFFF',yellow='#FDDA24';
const rect=(left,top,width,height)=>({left,top,width,height});
function find(s,re){const x=s.shapes.items.find(x=>re.test(String(x.text)));if(!x)throw new Error(`Missing ${re}`);return x;}
function edit(x,text,position,style={}){
  x.text=text;if(position)x.position=position;
  x.text.style={insets:0,autoFit:'none',wrap:'word',...style};return x;
}
function add(s,text,position,size=24,color=black,bold=false){
 const x=s.shapes.add({geometry:'textbox',position,fill:'none',line:{fill:'none',width:0}});
 x.text=[{runs:[{run:text,style:{typeface:'Inter',fontSize:`${size}px`,color,bold}}]}];
 x.text.style={insets:0,autoFit:'none',wrap:'word'};return x;
}
function blank(s,re){for(const x of [...s.shapes.items])if(re.test(String(x.text)))x.delete();}
/** The template's letter-spaced kicker style: "T H E   I D E A". */
const spaced=t=>t.split(' ').map(w=>[...w].join(' ')).join('   ');
const lines=t=>t.split('\n');
/** Largest font size (≤ max) at which every line fits `width`; Inter caps run ~0.66em. */
function fit(text,width,max,em=.66){
 const longest=Math.max(...lines(text).map(l=>l.length));
 return Math.min(max,Math.floor(width/(longest*em)));
}
const height=(text,size,leading=1.18)=>Math.ceil(lines(text).length*size*leading);
/** Lines `text` wraps to in `width` at `size`; Inter's average glyph runs ~0.53em. */
function wrapped(text,width,size,em=.53){
 let n=0;
 for(const line of lines(text)){
  let used=0;n++;
  for(const word of line.split(' ')){
   const w=(word.length+1)*size*em;
   if(used&&used+w>width){n++;used=w;}else used+=w;
  }
 }
 return n;
}
/** Paragraphs of one style, `gap` px apart (spaceAfter is in hundredths of
 * a point, the OOXML unit; a px is 0.75pt). */
function paragraphs(text,style,gap){
 return lines(text).map((l,i,all)=>({runs:[{run:l,style}],...(i<all.length-1?{spaceAfter:Math.round(gap*75)}:{})}));
}
const mono='JetBrains Mono NL';

/** A heading block at (left, top) within `width`, returning where it ends. */
function heading(s,re,text,left,top,width,max){
 const size=fit(text,width,max);
 const h=height(text,size);
 edit(find(s,re),text,rect(left,top,width,h),{fontSize:size});
 return top+h;
}

/** Place a cropped screenshot as large as fits `box`, keeping its aspect
 * ratio (the image API stretches a crop to whatever box it is given). */
async function screenshot(s,{file,crop,alt},box){
 const bytes=await fs.readFile(path.join(shots,file));
 const png=Buffer.from(bytes);
 const w=png.readUInt32BE(16)*(1-crop.left-crop.right);
 const h=png.readUInt32BE(20)*(1-crop.top-crop.bottom);
 const scale=Math.min(box.width/w,box.height/h);
 const width=w*scale,height=h*scale;
 s.images.add({blob:bytes,contentType:'image/png',crop,alt,
  position:rect(box.left+(box.width-width)/2,box.top+(box.height-height)/2,width,height)});
}

const layouts={
 title:{template:1,render(s,c){
  edit(find(s,/Y O U R/),c.kicker,rect(52,137,450,35),{fontSize:13.33});
  const end=heading(s,/^TITLE$/,c.heading,51,180,465,52);
  edit(find(s,/Name - Role/),c.subtitle,rect(52,end+18,440,64),{fontSize:22});
 }},
 bigIdea:{template:6,render(s,c){
  edit(find(s,/T H E/),spaced(c.kicker),rect(54,33,700,28),{fontSize:12});
  const top=lines(c.heading).length>2?120:172;
  const end=heading(s,/ONE CLEAR/,c.heading,116,top,780,c.size??52);
  edit(find(s,/Name Name/),c.subtitle,rect(121,end+22,690,Math.ceil(wrapped(c.subtitle,690,22)*22*1.3)),{fontSize:22,italic:false});
 }},
 // Template 8's white head and black band, without its numerals and rules:
 // up to six findings, each a yellow lead and a sentence or two.
 points:{template:8,render(s,c){
  heading(s,/KEY TAKEAWAYS/,c.heading,49,91,858,44);
  edit(find(s,/T H R E E/),spaced(c.kicker),rect(52,30,700,24),{fontSize:12});
  for(const x of [...s.shapes.items])if(String(x.text).startsWith('TAKEAWAY')||x.position.width<2)x.delete();
  for(const x of [...s.images.items])if(x.position.top>190&&x.position.top<220&&x.position.width<80)x.delete();
  const n=c.items.length,cols=n<=3?n:n===4?2:3,rows=Math.ceil(n/cols);
  const gap=36,width=(858-gap*(cols-1))/cols,size=c.size??(cols===3&&rows>1?18:20);
  const top=c.intro?236:186,bottom=496,rowHeight=(bottom-top)/rows;
  if(c.intro)add(s,c.intro,rect(52,186,858,34),18,white);
  c.items.forEach(([lead,body],i)=>{
   const left=52+(i%cols)*(width+gap),y=top+Math.floor(i/cols)*rowHeight;
   const need=26+Math.ceil(wrapped(body,width,size)*size*1.3);
   if(need>rowHeight-8)throw new Error(`"${c.title}": item "${lead}" needs ${need}px of ${Math.floor(rowHeight-8)}`);
   add(s,lead,rect(left,y,width,22),15,yellow,true);
   const x=add(s,body,rect(left,y+26,width,rowHeight-34),size,white);
   x.text.style={insets:0,autoFit:'none',wrap:'word',lineSpacing:1.1};
  });
 }},
 // Photo on the left, text on the right (template 7) or the reverse (9).
 topicLeft:{template:7,render(s,c){topic(s,c,318,600)}},
 topicRight:{template:9,render(s,c){
  if(c.heading.includes('\n'))throw new Error(`"${c.title}": template 9 headings must be one line`);
  topic(s,c,51,495);
 }},
 demo:{template:10,async render(s,c){
  demoFrame(s,c);
  c.labels.forEach((label,i)=>add(s,label,rect(548,181+i*100,360,34),16,yellow,true));
  const paras=[/^What problem/,/^What changed/,/^What was learned/];
  paras.forEach((r,i)=>edit(find(s,r),c.bodies[i],rect(548,215+i*100,350,58),{fontSize:20,color:white}));
  if(c.image)await screenshot(s,c.image,rect(69,170,440,282));
  if(c.left){
   add(s,c.left.title,rect(69,195,430,90),30,white);
   add(s,c.left.body,rect(69,312,430,96),20,white);
   add(s,c.left.note,rect(69,432,435,37),17,yellow);
  }
  if(c.caption)add(s,c.caption,rect(69,458,440,26),15,yellow);
 }},
 // Highlighted code in a panel, and a caption under it.
 code:{template:10,render(s,c){
  const end=demoFrame(s,c);
  for(const x of [...s.shapes.items])if(x.position.left>530&&x.position.top>160)x.delete();
  // The caption follows the panel, which hugs its code.
  const captionH=c.caption?Math.ceil(wrapped(c.caption,829,17)*17*1.3):0;
  const top=end+24,bottom=c.caption?484-captionH-14:470;
  const panelEnd=codePanel(s,c,rect(69,top,829,bottom-top));
  if(c.caption)add(s,c.caption,rect(69,panelEnd+14,829,captionH),17,yellow);
 }},
 next:{template:12,async render(s,c){
  heading(s,/YOUR NEXT STEP/,c.heading,52,99,866,42);
  edit(find(s,/One clear action/),c.body,rect(53,180,575,90),{fontSize:24});
  edit(find(s,/K E E P/),spaced(c.kicker),rect(54,33,660,28),{fontSize:12});
  blank(s,/\[QR CODE\]/);
  add(s,c.links,rect(54,291,580,73),18);
  const qr=await fs.readFile(path.join(build,'nido-qr.png'));
  s.images.add({blob:qr,contentType:'image/png',position:rect(666,243,165,165),alt:'QR code to https://test.nido.fyi',fit:'contain'});
 }},
};

function topic(s,c,left,width){
 edit(find(s,/L O R E M/),spaced(c.kicker),undefined,{fontSize:12});
 const size=c.big?68:Math.min(52,fit(c.heading,width,52));
 const top=c.big?142:128;
 const h=height(c.heading,size);
 // Template 9 keeps its font and tracking on the first paragraph only, so
 // its headings stay on one line (layouts.topicRight checks that).
 edit(find(s,/^LOREM IPSUM/),c.heading,rect(left,top,width,h),{fontSize:size});
 // The body is short paragraphs that wrap, at one readable size.
 const bodySize=c.bodySize??20,bodyTop=top+h+24,bottom=c.footnote?440:490;
 const body=find(s,/^Lorem ipsum/);
 edit(body,c.body,rect(left+1,bodyTop,width-10,bottom-bodyTop),{fontSize:bodySize,lineSpacing:1.1});
 body.text=paragraphs(c.body,{typeface:'Inter',fontSize:`${bodySize}px`,color:black},12);
 body.text.style={insets:0,autoFit:'none',wrap:'word',lineSpacing:1.1};
 const need=lines(c.body).reduce((n,l)=>n+wrapped(l,width-10,bodySize)*bodySize*1.32+12,0);
 if(need>bottom-bodyTop)throw new Error(`"${c.title}": body needs ${Math.ceil(need)}px of ${bottom-bodyTop}`);
 if(c.footnote)add(s,c.footnote,rect(left+1,448,width-10,29),17,black);
}

/** A dark panel of highlighted code: each line a paragraph, each token a run
 * in the monospace face, sized so the longest line fits without wrapping. */
function codePanel(s,c,box){
 const pad=18,labelH=18;
 const code=c.code.split('\n');
 const longest=Math.max(...code.map(l=>l.length));
 const inner=box.width-pad*2,avail=box.height-pad*2-labelH;
 // JetBrains Mono advances 0.6em per character; leave a little slack.
 const size=Math.min(c.codeSize??20,Math.floor(inner/(longest*.61)),Math.floor(avail/(code.length*1.3)));
 if(size<14)throw new Error(`"${c.title}": code needs ${size}px to fit; trim it`);
 // The panel hugs its code rather than filling the space it was given.
 const textH=Math.ceil(code.length*size*1.3);
 const panel=rect(box.left,box.top,box.width,pad*2+labelH+textH);
 s.shapes.add({geometry:'rect',position:panel,fill:'#161616',line:{style:'solid',fill:'#2E2E2E',width:1},borderRadius:8});
 add(s,languageName[c.lang],rect(box.left+box.width-pad-160,box.top+10,160,16),11,'#8C8C8C').text.style={insets:0,autoFit:'none',wrap:'none',alignment:'right'};
 const x=s.shapes.add({geometry:'textbox',position:rect(box.left+pad,box.top+pad+labelH,inner,textH),fill:'none',line:{fill:'none',width:0}});
 x.text=highlight(c.code,c.lang).map(tokens=>({runs:(tokens.length?tokens:[{text:' ',kind:'plain'}]).map(t=>({run:t.text,style:{typeface:mono,fontSize:`${size}px`,color:palette[t.kind],bold:false}}))}));
 x.text.style={insets:0,autoFit:'none',wrap:'none',lineSpacing:1.12};
 return panel.top+panel.height;
}

/** The black demo layout's title and kicker, its placeholder frame removed. */
function demoFrame(s,c){
 const size=fit(c.heading,820,40);
 const h=height(c.heading,size);
 edit(find(s,/WHAT WE/),c.heading,rect(69,96,820,h),{fontSize:size});
 edit(find(s,/D E M O/),spaced(c.kicker),rect(54,33,650,24),{fontSize:12});
 for(const r of [/^CONTEXT$/,/DECISION/,/RESULT/])find(s,r).delete();
 blank(s,/\[SCREENSHOT/);
 for(const x of [...s.shapes.items])if(!String(x.text)&&x.position.width>400&&x.position.width<450)x.delete();
 return 96+h;
}

for (const c of content){
 const layout=layouts[c.layout];
 if(!layout)throw new Error(`Unknown layout ${c.layout} on "${c.title}"`);
 const s=originals[layout.template-1].duplicate();output.push(s);
 await layout.render(s,c);
 // The source has a 1px bleed on black slides; normalize to canvas for export.
 if(layout.template===10)for(const x of s.shapes.items){if(x.position.width===960)x.position=rect(0,0,960,540);else if(x.position.width>32&&x.position.width<34&&x.position.height===540)x.position=rect(0,0,32.2,540);}
}
for(const s of originals)s.delete();
output.forEach((s,i)=>s.moveTo(i));
for(const [i,s] of output.entries()){
 const c=schedule[i];
 const notes=[`SLIDE ${c.number}: ${c.title}`,`TIME: ${timing(c)}`,c.cue?`STAGE CUE: ${c.cue}`:'',`SCRIPT\n${c.script}`,c.sources.length?`SOURCES (not spoken)\n${c.sources.join('\n')}`:'',`Visual template and reused photography/brand assets: ${templateUrl}`].filter(Boolean).join('\n\n');
 s.speakerNotes.text=notes;s.speakerNotes.setVisible(true);
}
const renders=path.join(build,'render');
await fs.rm(renders,{recursive:true,force:true});
await fs.mkdir(renders,{recursive:true});
await (await PresentationFile.exportPptx(p)).save(path.join(build,'candidate.pptx'));
for(const [i,s] of output.entries()){
 const png=await p.export({slide:s,format:'png',scale:1.5});
 await fs.writeFile(path.join(renders,`slide-${i+1}.png`),new Uint8Array(await png.arrayBuffer()));
}
const ins=await p.inspect({select:'$.slides[*]',include:['id','index','elements.id','elements.text','elements.position','elements.style','notes.text']});
await fs.writeFile(path.join(build,'final-inspect.json'),JSON.stringify(ins.records,null,2));
await fs.writeFile(path.join(build,'manifest.json'),JSON.stringify({slideCount:output.length,talkSlides,seconds:talkSeconds,spokenWords:content.filter(s=>!s.appendix).reduce((n,s)=>n+s.script.split(/\s+/).length,0),sourceSha256:crypto.createHash('sha256').update(await fs.readFile(source)).digest('hex')},null,2)+'\n');
console.log(JSON.stringify({slides:output.length,talkSlides,seconds:talkSeconds,candidate:path.join(build,'candidate.pptx')}));
