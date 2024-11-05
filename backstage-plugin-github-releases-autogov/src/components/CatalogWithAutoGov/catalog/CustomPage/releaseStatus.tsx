// ReleaseStatus.tsx
import React from 'react';
import { Chip, Typography } from '@material-ui/core';
import useLatestGithubRelease from '../../hooks/useLatestRelease';
import { useProjectEntity } from '../../../GitHubReleaseCard/hooks/useProjectEntity';
import { Entity } from '@backstage/catalog-model';

interface ReleaseStatusProps {
  entity: Entity;
}

const ReleaseStatus: React.FC<ReleaseStatusProps> = ({ entity }) => {
  const { owner, repo } = useProjectEntity(entity);

  // Call useLatestGithubRelease directly
  const { data, loading, error } = useLatestGithubRelease(owner, repo);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error</Typography>;
  }

  // Determine color based on status
  const status = data?.autoGovStatus || 'Unknown';
  let statusColor;
  let textColor;
  if (status.toLowerCase() === 'passed') {
    statusColor = 'green';
    textColor = 'white';
  } else if (status.toLowerCase() === 'failed') {
    statusColor = '#FF6666';
    textColor = 'black';
  } else {
    statusColor = 'gray';
    textColor = 'white';
  }

  return (
    <Typography>
      <Chip
        label={status}
        size="small"
        style={{
          backgroundColor: statusColor,
          color: textColor,
        }}
      />
    </Typography>
  );
};

export default ReleaseStatus;
