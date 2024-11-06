import {
  createPlugin,
  createRoutableExtension,
} from "@backstage/core-plugin-api";

import { rootRouteRef } from "./routes";

// Create the plugin
export const githubReleasesAutogovPlugin = createPlugin({
  id: "github-releases-autogov",
  routes: {
    root: rootRouteRef,
  },
});

// Provide the GithubReleasesAutogovPage extension
export const GithubReleasesAutogovPage = githubReleasesAutogovPlugin.provide(
  createRoutableExtension({
    name: "GithubReleasesAutogovPage",
    component: () =>
      import("./components/GitHubReleaseCard/CustomInsightsPage").then(
        (m) => m.CustomInsightsPage,
      ),
    mountPoint: rootRouteRef,
  }),
);

export const CustomCatalogPage = githubReleasesAutogovPlugin.provide(
  createRoutableExtension({
    name: "CustomCatalogPage",
    component: () =>
      import("./components/CatalogWithAutoGov/CustomCatalogPage").then(
        (m) => m.CustomCatalogPage,
      ),
    mountPoint: rootRouteRef,
  }),
);
