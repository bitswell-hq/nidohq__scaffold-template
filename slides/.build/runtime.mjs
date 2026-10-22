// Where the full pipeline finds its tools. Every path is an environment
// variable whose default is the Codex presentations runtime's usual home:
//
//   CODEX_RUNTIME         ~/.cache/codex-runtimes/codex-primary-runtime
//   RUNTIME_NODE_MODULES  $CODEX_RUNTIME/dependencies/node/node_modules (artifact-tool)
//   PRESENTATIONS_PYTHON  $CODEX_RUNTIME/dependencies/python/bin/python3
//   SOFFICE, PDFTOPPM     $CODEX_RUNTIME/dependencies/bin/override/{soffice,pdftoppm}
//   PRESENTATIONS_SKILL   ~/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations
//   DECK_FONTS            .build/fonts (Inter-{Regular,Medium,SemiBold,Bold,Light}.ttf,
//                         JetBrainsMonoNL-Regular.ttf)
import {fileURLToPath} from 'node:url';
import os from 'node:os';
import path from 'node:path';

const env=process.env;
const build=fileURLToPath(new URL('./',import.meta.url));
export const codexRuntime=env.CODEX_RUNTIME??path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime');
const deps=path.join(codexRuntime,'dependencies');
export const nodeModules=env.RUNTIME_NODE_MODULES??path.join(deps,'node/node_modules');
export const python=env.PRESENTATIONS_PYTHON??path.join(deps,'python/bin/python3');
export const soffice=env.SOFFICE??path.join(deps,'bin/override/soffice');
export const pdftoppm=env.PDFTOPPM??path.join(deps,'bin/override/pdftoppm');
export const skill=env.PRESENTATIONS_SKILL??path.join(os.homedir(),'.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations');
export const fonts=env.DECK_FONTS?path.resolve(env.DECK_FONTS):path.join(build,'fonts');
