import module from 'module';
import {fileURLToPath} from 'url';


const [major, minor] = process.versions.node.split ('.');

export default (Number (`${major}.${minor}`) < 12.2
                ? /* c8 ignore next */ module.createRequireFromPath
                : /* c8 ignore next */ module.createRequire)
               (fileURLToPath (import.meta.url));
