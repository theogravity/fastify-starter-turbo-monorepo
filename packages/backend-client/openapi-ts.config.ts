import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'openapi.yml',
    output: 'src/generated',
    plugins: [
        '@hey-api/typescript',
        '@hey-api/sdk',
        '@hey-api/client-fetch',
    ],
});
