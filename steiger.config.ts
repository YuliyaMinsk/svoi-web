import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

// Feature-Sliced Design boundary linter. The recommended preset enforces
// public-API access, forbidden cross-imports, slice naming, etc.
export default defineConfig([...fsd.configs.recommended]);
