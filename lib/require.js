import module from 'node:module';
import url from 'node:url';

export default module.createRequire (url.fileURLToPath (import.meta.url));
