# Doom in Fabric Apps - merging Blank App template with Doom github project

But can it run Doom?

This silly question is something you could hear if a platform starts to mature.

Because getting Doom running on a platform is seen as the proof in the pudding.

With Fabric Apps, we suddenly can execute pro-code in Fabric.

So, can it run Doom?

<img width="1017" height="956" alt="doom" src="https://github.com/user-attachments/assets/c80302d7-1b38-41b3-8d1b-d44cd5c4f350" />

## Doom integration

This Fabric App is a merge of both the Rayfin Blank app template and the Doom repo at [GitHub](https://github.com/thedoggybrad/doom_on_js-dos).

See also [this blog post](https://sandervandevelde.wordpress.com/2026/06/07/playing-zork-i-as-a-microsoft-fabric-app-via-rayfin/) explaining all steps.

## Blang App template

Bare-bones Fabric-authenticated React + Vite app.
Sign-in, routing, and a placeholder home page — with no data layer to delete before you start your own project.

### Getting started

```bash
# Deploy app to Fabric and start the local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Project structure

```text
├── rayfin/
│   └── rayfin.yml          # Fabric service configuration (auth + static hosting)
├── src/
│   ├── main.tsx            # Entry point + Rayfin client bootstrap
│   ├── App.tsx             # Routes and auth gate
│   ├── hooks/
│   │   └── AuthContext.tsx # React context wrapping the auth helpers
│   ├── components/
│   │   └── AuthPage.tsx    # Sign-in UI
│   ├── pages/
│   │   └── HomePage.tsx    # Post-auth landing page
│   └── services/
│       ├── IAuthService.ts        # Auth service contract + AuthUser type
│       ├── MockAuthService.ts     # Local-dev impl (email/password)
│       ├── RayfinAuthService.ts   # Production impl (Fabric brokered auth)
│       ├── rayfinClient.ts        # Typed Rayfin client singleton
│       └── bootstrap.ts           # Reads env, picks the right auth service
└── package.json
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Deploy app to Fabric and start local dev server |
| `npm run build` | Production build |
| `npm run build:fabric` | Build for Fabric deployment (entrypoint for `rayfin up staticapp deploy`) |
| `npm run lint` | Lint with ESLint |
| `npm run test` | Run unit tests with Vitest |
| `npm run rayfin:up` | Deploy app to Fabric (no local dev server) |
