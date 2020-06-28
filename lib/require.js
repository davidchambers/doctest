import module from 'module';
import url from 'url';

export default module.createRequire (url.fileURLToPath (import.meta.url));
