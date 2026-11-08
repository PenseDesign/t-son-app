import { writeFileSync } from "node:fs";

// Empêche Cloudflare de publier le code serveur comme fichier public
writeFileSync(new URL("../dist/.assetsignore", import.meta.url), "_worker.js\n_routes.json\n");