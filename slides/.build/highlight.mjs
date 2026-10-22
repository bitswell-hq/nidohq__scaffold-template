// Syntax highlighting for the code slides: split a snippet into lines of
// colored tokens that build.mjs writes as text runs, so the colors are real
// .pptx text (searchable, editable) and carry into the PDF and the preview.
// A small lexer per language; the snippets are short and hand-picked, so
// it covers what they use rather than whole grammars.

/** On the template's black: plain text, then one color per token kind. */
export const palette={
 plain:'#ECECEC',
 keyword:'#FDDA24', // the template's yellow
 string:'#A6E3A1',
 number:'#FAB387',
 comment:'#8C8C8C',
 fn:'#89B4FA',
 type:'#CBA6F7',
 key:'#89DCEB',
 error:'#F38BA8',
};

const kw=words=>new RegExp(`(?:${words.split(' ').join('|')})\\b`,'y');
const ident=/[A-Za-z_$][\w$]*/y;

// Each language is an ordered list of [kind, sticky regex]. At each position
// the first match wins; anything unmatched is one plain character.
const languages={
 ts:[
  ['comment',/\/\/.*/y],
  ['string',/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y],
  ['keyword',kw('const let await async return export import from type if else try catch new function true false undefined null')],
  ['number',/\d[\d_]*n?/y],
  ['type',/[A-Z][\w$]*(?=\s*[<\[]|\b(?!\s*\())/y],
  ['fn',/[A-Za-z_$][\w$]*(?=\s*\()/y],
  ['key',/[A-Za-z_$][\w$]*(?=\s*:(?!:))/y],
  ['plain',ident],
 ],
 rust:[
  ['comment',/\/\/.*/y],
  ['string',/"(?:\\.|[^"\\])*"/y],
  ['keyword',kw('pub fn let mut impl struct use mod self Self return if else match for in true false')],
  ['number',/\d[\d_]*/y],
  ['fn',/[a-z_][\w]*!|[a-z_][\w]*(?=\s*\()/y],
  ['type',/[A-Z][\w]*|(?:[iu](?:8|16|32|64|128)|bool|str)\b/y],
  ['plain',ident],
 ],
 json:[
  ['key',/"(?:\\.|[^"\\])*"(?=\s*:)/y],
  ['string',/"(?:\\.|[^"\\])*"/y],
  ['number',/-?\d+/y],
  ['keyword',kw('true false null')],
 ],
 // An annotated authorization trace: calls, comments and the error it ends in.
 trace:[
  ['comment',/\/\/.*/y],
  ['error',/Error\([^)]*\)\s*\w*/y],
  ['string',/"[^"]*"/y],
  ['number',/#\d+|\b\d+\b/y],
  ['fn',/[A-Za-z_][\w.]*(?=\()/y],
  ['key',/[A-Za-z_]+(?=:)/y],
  ['plain',/[A-Za-z_][\w.…]*/y],
 ],
};

/** Highlight `code` in `lang`: an array of lines, each [{text, kind}]. */
export function highlight(code,lang){
 const rules=languages[lang];
 if(!rules)throw new Error(`No highlighter for "${lang}"`);
 return code.split('\n').map(line=>{
  const out=[];
  const push=(text,kind)=>{
   const last=out.at(-1);
   if(last&&last.kind===kind)last.text+=text;else out.push({text,kind});
  };
  let i=0;
  while(i<line.length){
   let hit;
   for(const [kind,re] of rules){
    re.lastIndex=i;
    const m=re.exec(line);
    if(m&&m[0].length){hit=[kind,m[0]];break;}
   }
   if(hit){push(hit[1],hit[0]);i+=hit[1].length;}
   else{push(line[i],'plain');i++;}
  }
  return out;
 });
}

/** A human name for the panel's corner label. */
export const languageName={ts:'TypeScript',rust:'Rust',json:'JSON',trace:'auth trace'};
