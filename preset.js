import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const managerEntries = (entry = []) => {
    return [...entry, path.resolve(__dirname, 'dist/register.js')];
};

export { managerEntries };
//# sourceMappingURL=preset.js.map
