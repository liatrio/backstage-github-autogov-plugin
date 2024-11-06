import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  DefaultEntityFilters,
  EntityFilter,
  catalogApiRef,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import { Box, Checkbox, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React from 'react';
import useAsync from 'react-use/lib/useAsync';
import { getSourceLocation } from './CatalogTable';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export class EntityRepoSourceFilter implements EntityFilter {
  constructor(readonly values: string[]) {}

  filterEntity(entity: Entity): boolean {
    const location = getSourceLocation(entity);

    return location !== undefined && this.values.includes(location);
  }
}

export type CustomFilters = DefaultEntityFilters & {
  repoSources?: EntityRepoSourceFilter;
};

export const EntityRepoSourcePicker = () => {
  // The sources key is recognized due to the CustomFilter generic
  const { updateFilters } = useEntityList<CustomFilters>();

  const catalogApi = useApi(catalogApiRef);

  // Get available sources from the catalog backstage.io/source-location property.
  const { value: sources } = useAsync(async () => {
    const res = await catalogApi.queryEntities({ limit: 1000 });
    const uniqueSources: string[] = [];

    for (const entity of res.items) {
      const sourceLocation = getSourceLocation(entity);

      if (!uniqueSources.includes(sourceLocation))
        uniqueSources.push(sourceLocation);
    }

    return uniqueSources;
  });

  return (
    <Box pb={1} pt={1}>
      <Typography variant="button" component="label">
        Repo Sources
        <Autocomplete
          multiple
          id="repo-source-picker"
          options={sources ?? []}
          disableCloseOnSelect
          getOptionLabel={option => option}
          onChange={(_event, options: string[]) => {
            updateFilters({
              repoSources: options.length
                ? new EntityRepoSourceFilter(options)
                : undefined,
            });
          }}
          size="small"
          popupIcon={<ExpandMoreIcon />}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                checked={selected}
              />
              {option}
            </li>
          )}
          renderInput={params => <TextField {...params} />}
        />
      </Typography>
    </Box>
  );
};
