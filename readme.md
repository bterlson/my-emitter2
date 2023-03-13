### To set this up from scratch:

#### Setup pnpm and vendored deps

1. Initialize pnpm workspace
2. Copy into vendor directory playground and bundler packages.
3. add root level tsconfig
4. delete `references` from tsconfig.jsons

#### Build the world

1. Run build on vendor/bundler
2. Run build on vendor/playground
3. Run `npx tsc -p .` in typespec-validates (needs build script, whoops)

#### Configure playground

1. Edit vite.config.js, adding "typespec-validation" to the libraries array.
2. Install prettier (not technically required, makes peer dep warnings go away)
3. npm run dev

#### Code changes from original

1. Delete default css content in App.css
2. Use StyledPlayground instead of Playground
3. Attach monaco services (for colorization)
