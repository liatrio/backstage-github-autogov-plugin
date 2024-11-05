# Contributing to the Backstage GitHub Releases AutoGov Plugin

## Local Testing

1. build & package the plugins

```zsh
cd backstage-plugin-github-releases-autogov
yarn build
yarn pack
```

```zsh
cd ..
cd backstage-plugin-github-releases-assets-backend
yarn build
yarn pack
```

2. Add the plugins to a local Backstage instance

> make sure to use the full path of the local package.

```zsh
cd packages/backend
yarn add <path-to-plugin>/backstage-github-autogov-plugin/backstage-plugin-github-releases-assets-backend/liatrio-backstage-plugin-github-releases-assets-backend-v1.1.0.tgz
```

```packages/backend/src/index.ts
backend.add(
  import('liatrio-backstage-plugin-github-releases-assets-backend'),
);
```

```zsh
cd packages/app
yarn add <path-to-plugin>/backstage-github-autogov-plugin/backstage-plugin-github-releases-autogov/liatrio-backstage-plugin-github-releases-autogov-v1.1.0.tgz
```

```packages/app/src/components/catalog/EntityPage.tsx
import { GithubReleasesAutogovPage } from 'liatrio-backstage-plugin-github-releases-autogov';
...

<EntityLayout.Route
      path="/code-insights"
      title="Code Insights">
      <GithubReleasesAutogovPage />
 </EntityLayout.Route>
```
