import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    plugins: ['@hey-api/client-fetch'],
    input: 'openapi.yml',
    output: 'src/',
});
