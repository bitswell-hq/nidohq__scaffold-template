// The speaker notes as text: dist/speaker-notes.md for people and
// dist/slides.json for tools, with each slide's on-slide text, timing, cue,
// script and links. No images, so either reads in one pass.
// `node .build/notes.mjs`; make-dist.mjs runs it too. It needs only Node.
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import {schedule,timing,clock,talkSeconds,talkSlides} from './schedule.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=path.join(root,'dist');
const flat=t=>t.replace(/\s*\n\s*/g,' ');

/** What the audience reads on the slide, in reading order. */
function onSlide(c){
 const text=[];
 const add=(...xs)=>text.push(...xs.filter(Boolean));
 add(c.body,c.subtitle);
 c.rows?.forEach((r,i)=>add(`${i+1}. ${r}`));
 c.items?.forEach(([t,b])=>add(`${t}: ${b}`));
 if(c.left)add(flat(c.left.title),c.left.body,c.left.note);
 c.labels?.forEach((l,i)=>add(`${l}: ${c.bodies[i]}`));
 add(c.note,c.footnote,c.links);
 if(c.image)add(`[Screenshot: ${c.image.alt}]`);
 add(c.caption);
 return {kicker:c.kicker,heading:flat(c.heading),text:text.flatMap(t=>t.split('\n')),...(c.code?{code:c.code,lang:c.lang}:{})};
}

/** A source as a repo-relative path (sources are written relative to the deck). */
const link=s=>s.startsWith('../')?s.slice(3):s;

const slides=schedule.map(c=>({
 number:c.number,
 title:c.title,
 section:c.appendix?'appendix':'talk',
 ...(c.appendix?{}:{start:clock(c.start),end:clock(c.start+c.seconds)}),
 seconds:c.seconds,
 timing:timing(c),
 ...(c.cue?{cue:c.cue}:{}),
 onSlide:onSlide(c),
 script:c.script,
 links:c.sources.map(link),
}));

const appendix=slides.length-talkSlides;
const json={
 title:'Stellar smart accounts (Hack Meridian)',
 generatedFrom:`${path.basename(root)}/.build/content.mjs`,
 talk:{slides:talkSlides,seconds:talkSeconds,duration:clock(talkSeconds)},
 appendixSlides:appendix,
 slides,
};

// Markdown links resolve from dist/, so local sources climb out of the deck.
// A source that is neither a URL nor a path is a plain-text attribution.
const mdLink=s=>{
 const [href,...rest]=s.split(' ');
 const note=rest.length?' '+rest.join(' '):'';
 if(href.startsWith('https:'))return `<${href}>${note}`;
 return href.startsWith('../')?`[${link(href)}](../${href})${note}`:s;
};
const md=[
 '# Stellar smart accounts: speaker notes',
 '',
 `${talkSlides} slides, ${clock(talkSeconds)}, then ${appendix} appendix slides for questions. Generated from \`.build/content.mjs\` by \`.build/notes.mjs\`; edit the content, not this file. The same notes as data: [\`slides.json\`](slides.json).`,
 '',
 '| # | Slide | Time |',
 '| --- | --- | --- |',
 ...slides.map(s=>`| ${s.number} | ${s.title} | ${s.section==='talk'?`${s.start}–${s.end}`:'appendix'} |`),
 '',
 ...slides.flatMap(s=>[
  s.number===talkSlides+1?'---\n\n## Appendix\n':'',
  `### ${s.number}. ${s.title}`,
  '',
  `**Time:** ${s.timing}`,
  '',
  ...(s.cue?[`**Stage cue:** ${s.cue}`,'']:[]),
  `**On the slide:** ${[s.onSlide.kicker,s.onSlide.heading].filter(Boolean).join(' · ')}`,
  '',
  ...s.onSlide.text.map(t=>`- ${t}`),
  // A Markdown fence's info string, so GitHub highlights it as the slide does.
  ...(s.onSlide.code?['','```'+({trace:'text'}[s.onSlide.lang]??s.onSlide.lang),s.onSlide.code,'```']:[]),
  '',
  '**Script**',
  '',
  s.script,
  '',
  ...(s.links.length?['**Links** (not spoken)','',...schedule[s.number-1].sources.map(l=>`- ${mdLink(l)}`),'']:[]),
 ]),
].join('\n').replace(/\n{3,}/g,'\n\n');

await fs.mkdir(dist,{recursive:true});
await fs.writeFile(path.join(dist,'slides.json'),JSON.stringify(json,null,2)+'\n');
await fs.writeFile(path.join(dist,'speaker-notes.md'),md);
console.log(JSON.stringify({notes:'dist/speaker-notes.md',data:'dist/slides.json',talkSlides,appendix,seconds:talkSeconds}));
