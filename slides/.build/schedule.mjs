// When each slide is spoken. The talk's clock runs through the slides that are
// not `appendix`; appendix slides are backup for questions and get no start.
import {slides} from './content.mjs';

export const clock=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

let elapsed=0;
export const schedule=slides.map((c,i)=>{
 const at={...c,number:i+1};
 if(!c.appendix){at.start=elapsed;elapsed+=c.seconds;}
 return at;
});
export const talkSeconds=elapsed;
export const talkSlides=schedule.filter(s=>!s.appendix).length;

/** The notes' TIME line: "0:35–1:15 (40 seconds)", or the appendix note. */
export const timing=s=>s.appendix
 ?`appendix, not part of the ${clock(talkSeconds)} talk (about ${s.seconds} seconds if used for questions)`
 :`${clock(s.start)}–${clock(s.start+s.seconds)} (${s.seconds} seconds)`;
