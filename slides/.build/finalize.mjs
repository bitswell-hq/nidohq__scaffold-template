// Validate the candidate deck (package integrity, layout geometry, the font
// families it may use) and write the final .pptx to output/.
// Tool locations come from runtime.mjs.
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import {nodeModules,python,skill} from './runtime.mjs';
// The finalizer re-imports the deck in a child process that resolves
// artifact-tool from here.
process.env.RUNTIME_NODE_MODULES??=nodeModules;
const {finalizePresentation}=await import(path.join(skill,'container_tools/artifact_tool_utils.mjs'));
const root=fileURLToPath(new URL('../',import.meta.url));
export const finalPath=path.join(root,'output/hack-meridian-smart-accounts.pptx');
// output/ is scratch and the receipt is regenerated; the finalizer never
// overwrites either, so clear the last run's.
await fs.mkdir(path.dirname(finalPath),{recursive:true});
await fs.rm(finalPath,{force:true});
await fs.rm(path.join(root,'.build/validation.json'),{force:true});
const r=await finalizePresentation({
 workspaceDir:root,
 candidatePath:path.join(root,'.build/candidate.pptx'),
 finalPath,
 pythonExecutable:python,
 integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
 layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
 layoutArgs:['--expected-slide-size-emu','9144000,5143500','--validate-bullet-geometry','--validate-heading-fit'],
 requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],
 // The template's Inter faces, plus a monospace face for code, which the
 // template has none of.
 fontPolicy:{basis:'design',families:['Inter','Inter SemiBold','Inter Medium','Inter Light','JetBrains Mono NL']},
 verifyArtifactToolImport:true,
 receiptPath:path.join(root,'.build/validation.json'),
});
console.log(JSON.stringify({status:r.status??r.ok??'done',final:finalPath},null,2));
