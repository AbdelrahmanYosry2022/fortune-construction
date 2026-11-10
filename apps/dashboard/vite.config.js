import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { createRequire } from 'node:module';
var require = createRequire(import.meta.url);
var resolvePkgEntry = function (pkgName, candidates) {
    try {
        var pkgJsonPath = require.resolve("".concat(pkgName, "/package.json"));
        var baseDir = dirname(pkgJsonPath);
        for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
            var rel = candidates_1[_i];
            var p = resolvePath(baseDir, rel);
            if (existsSync(p))
                return p;
        }
        return pkgName;
    }
    catch (_a) {
        return pkgName;
    }
};
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@fortune/shared-ui': fileURLToPath(new URL('./src/lib/dashboardSharedUi.tsx', import.meta.url)),
            'react-style-singleton': resolvePkgEntry('react-style-singleton', [
                'dist/es5/index.js',
                'dist/commonjs/index.js',
            ]),
            'react-remove-scroll': resolvePkgEntry('react-remove-scroll', [
                'dist/es5/index.js',
                'dist/commonjs/index.js',
            ]),
            'react-remove-scroll-bar/constants': resolvePkgEntry('react-remove-scroll-bar', [
                'dist/es5/constants.js',
                'dist/commonjs/constants.js',
            ]),
            'react-remove-scroll-bar': resolvePkgEntry('react-remove-scroll-bar', [
                'dist/es5/index.js',
                'dist/commonjs/index.js',
            ]),
        },
    },
    server: { port: 5174 },
});
