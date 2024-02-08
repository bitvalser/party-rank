import { createRoot } from 'react-dom/client';
import 'reflect-metadata';

import { Root } from './root';

const root = createRoot(document.getElementById('app'));
root.render(<Root />);
