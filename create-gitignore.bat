@echo off
echo node_modules/ > .gitignore
echo .pnp >> .gitignore
echo .pnp.js >> .gitignore
echo dist/ >> .gitignore
echo dist-ssr/ >> .gitignore
echo build/ >> .gitignore
echo .env >> .gitignore
echo .env.local >> .gitignore
echo .env.development.local >> .gitignore
echo .env.test.local >> .gitignore
echo .env.production.local >> .gitignore
echo supabase/.branches >> .gitignore
echo supabase/.temp >> .gitignore
echo .DS_Store >> .gitignore
echo Thumbs.db >> .gitignore
echo *.log >> .gitignore
echo coverage/ >> .gitignore
echo *.tsbuildinfo >> .gitignore
echo .gitignore file created successfully!
