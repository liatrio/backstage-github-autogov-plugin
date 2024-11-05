import { useState, useEffect, useCallback } from 'react';
import {
  useApi,
  githubAuthApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { Octokit } from '@octokit/rest';

interface LatestReleaseData {
  id: number;
  tagName: string;
  autoGovStatus: string;
  failedPolicies: string;
}

const useLatestGithubRelease = (owner: string, repo: string) => {
  const [data, setData] = useState<LatestReleaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = useApi(githubAuthApiRef);
  const configApi = useApi(configApiRef);
  const backendUrl = configApi.getString('backend.baseUrl');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await auth.getAccessToken(['repo']);
      const octokit = new Octokit({ auth: token });

      // Fetch the most recent release for the repo
      const response = await octokit.rest.repos.getLatestRelease({
        owner,
        repo,
      });

      if (response.status !== 200) {
        throw new Error(
          `Failed to fetch the latest release: ${response.status}`,
        );
      }

      const release = response.data;
      const releaseAssets = release.assets;

      // Find the asset that contains the results
      const resultsAsset = releaseAssets.find(asset =>
        asset.name.includes('results'),
      );

      if (!resultsAsset) {
        setData({
          id: release.id,
          tagName: release.tag_name,
          autoGovStatus: 'n/a',
          failedPolicies: 'n/a',
        });
        return;
      }

      // Call the backend plugin "github-releases-assets-backend" to fetch the asset data
      const assetUrl = resultsAsset.url;
      const assetResponse = await fetch(
        `${backendUrl}/api/github-releases-assets-backend/releases-assets?assetUrl=${encodeURIComponent(assetUrl)}`,
      );

      if (!assetResponse.ok) {
        setData({
          id: release.id,
          tagName: release.tag_name,
          autoGovStatus: 'n/a',
          failedPolicies: 'n/a',
        });
        return;
      }

      const resultsData = await assetResponse.json();
      setData({
        id: release.id,
        tagName: release.tag_name,
        autoGovStatus: resultsData.result || 'n/a',
        failedPolicies: resultsData.violations || 'n/a',
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, auth, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
};

export default useLatestGithubRelease;
