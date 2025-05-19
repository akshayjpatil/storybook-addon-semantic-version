import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const managerEntries = (entry = []) => {
  return [...entry, path.resolve(__dirname, './register.js')];
};
