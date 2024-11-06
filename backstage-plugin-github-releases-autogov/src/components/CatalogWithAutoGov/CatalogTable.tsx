import {
  ANNOTATION_EDIT_URL,
  ANNOTATION_VIEW_URL,
  Entity,
  RELATION_OWNED_BY,
  RELATION_PART_OF,
  getEntitySourceLocation,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import {
  CodeSnippet,
  Table,
  TableColumn,
  TableProps,
  WarningPanel,
} from '@backstage/core-components';
import {
  getEntityRelations,
  humanizeEntityRef,
  useEntityList,
  useStarredEntities,
} from '@backstage/plugin-catalog-react';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Edit from '@material-ui/icons/Edit';
import OpenInNew from '@material-ui/icons/OpenInNew';
import Star from '@material-ui/icons/Star';
import StarBorder from '@material-ui/icons/StarBorder';
import { capitalize } from 'lodash';
import pluralize from 'pluralize';
import React, { ReactNode, useMemo, useEffect, useState } from 'react';
import { columnFactories } from './columns';
import { CatalogTableRow } from './types';

/**
 * Props for {@link CatalogTable}.
 *
 * @public
 */

export interface CatalogTableProps {
  columns?: TableColumn<CatalogTableRow>[];
  actions?: TableProps<CatalogTableRow>['actions'];
  tableOptions?: TableProps<CatalogTableRow>['options'];
  emptyContent?: ReactNode;
  subtitle?: string;
}

const YellowStar = withStyles({
  root: {
    color: '#f3ba37',
  },
})(Star);

const refCompare = (a: Entity, b: Entity) => {
  const toRef = (entity: Entity) =>
    entity.metadata.title ||
    humanizeEntityRef(entity, {
      defaultKind: 'Component',
    });

  return toRef(a).localeCompare(toRef(b));
};

export const getSourceLocation = (entity: Entity) => {
  const { target, type } = getEntitySourceLocation(entity);
  if (type === 'url') {
    const locationURL = new URL(target);

    return locationURL.hostname;
  } else if (type === 'file') {
    return target;
  }

  return 'Unknown';
};

/** @public */
export const CatalogTable = (props: CatalogTableProps) => {
  const { columns, actions, tableOptions, subtitle, emptyContent } = props;
  const { isStarredEntity, toggleStarredEntity } = useStarredEntities();
  const { loading, error, entities, filters } = useEntityList();

  const defaultColumns: TableColumn<CatalogTableRow>[] = useMemo(() => {
    return [
      columnFactories.createTitleColumn({ hidden: true }),
      columnFactories.createNameColumn({ defaultKind: filters.kind?.value }),
      ...createEntitySpecificColumns(),
    ];

    function createEntitySpecificColumns(): TableColumn<CatalogTableRow>[] {
      const baseColumns = [
        columnFactories.createOwnerColumn(),
        columnFactories.createSpecTypeColumn(),
        columnFactories.createSourceColumn(),
        columnFactories.createSpecLifecycleColumn(),
        columnFactories.createLatestAutoGovStatusColumn(),
      ];
      switch (filters.kind?.value) {
        case 'user':
          return [];
        case 'domain':
        case 'system':
          return [columnFactories.createOwnerColumn()];
        case 'group':
        case 'template':
          return [columnFactories.createSpecTypeColumn()];
        case 'location':
          return [
            columnFactories.createSpecTypeColumn(),
            columnFactories.createSpecTargetsColumn(),
          ];
        default:
          return entities.every(
            entity => entity.metadata.namespace === 'default',
          )
            ? baseColumns
            : [...baseColumns, columnFactories.createNamespaceColumn()];
      }
    }
  }, [filters.kind?.value, entities]);

  const showTypeColumn = filters.type === undefined;
  // TODO(timbonicus): remove the title from the CatalogTable once using EntitySearchBar
  const titlePreamble = capitalize(filters.user?.value ?? 'all');

  if (error) {
    return (
      <div>
        <WarningPanel
          severity="error"
          title="Could not fetch catalog entities."
        >
          <CodeSnippet language="text" text={error.toString()} />
        </WarningPanel>
      </div>
    );
  }

  const defaultActions: TableProps<CatalogTableRow>['actions'] = [
    ({ entity }) => {
      const url = entity.metadata.annotations?.[ANNOTATION_VIEW_URL];
      const title = 'View';

      return {
        icon: () => (
          <>
            <Typography variant="srOnly">{title}</Typography>
            <OpenInNew fontSize="small" />
          </>
        ),
        tooltip: title,
        disabled: !url,
        onClick: () => {
          if (!url) return;
          window.open(url, '_blank');
        },
      };
    },
    ({ entity }) => {
      const url = entity.metadata.annotations?.[ANNOTATION_EDIT_URL];
      const title = 'Edit';

      return {
        icon: () => (
          <>
            <Typography variant="srOnly">{title}</Typography>
            <Edit fontSize="small" />
          </>
        ),
        tooltip: title,
        disabled: !url,
        onClick: () => {
          if (!url) return;
          window.open(url, '_blank');
        },
      };
    },
    ({ entity }) => {
      const isStarred = isStarredEntity(entity);
      const title = isStarred ? 'Remove from favorites' : 'Add to favorites';

      return {
        cellStyle: { paddingLeft: '1em' },
        icon: () => (
          <>
            <Typography variant="srOnly">{title}</Typography>
            {isStarred ? <YellowStar /> : <StarBorder />}
          </>
        ),
        tooltip: title,
        onClick: () => toggleStarredEntity(entity),
      };
    },
  ];

  const rows = entities.sort(refCompare).map(entity => {
    const partOfSystemRelations = getEntityRelations(entity, RELATION_PART_OF, {
      kind: 'system',
    });
    const ownedByRelations = getEntityRelations(entity, RELATION_OWNED_BY);
    // const sourceLocation = getSourceLocation(entity);

    return {
      entity,
      resolved: {
        // This name is here for backwards compatibility mostly; the
        // presentation of refs in the table should in general be handled with
        // EntityRefLink / EntityName components
        name: humanizeEntityRef(entity, {
          defaultKind: 'Component',
        }),
        entityRef: stringifyEntityRef(entity),
        ownedByRelationsTitle: ownedByRelations
          .map(r => humanizeEntityRef(r, { defaultKind: 'group' }))
          .join(', '),
        ownedByRelations,
        partOfSystemRelationTitle: partOfSystemRelations
          .map(r =>
            humanizeEntityRef(r, {
              defaultKind: 'system',
            }),
          )
          .join(', '),
        partOfSystemRelations,
        sourceLocation: getSourceLocation(entity),
      },
    };
  });

  const typeColumn = (columns || defaultColumns).find(c => c.title === 'Type');
  if (typeColumn) {
    typeColumn.hidden = !showTypeColumn;
  }
  const showPagination = rows.length > 20;
  const currentKind = filters.kind?.value || '';
  const currentType = filters.type?.value || '';
  const titleDisplay = [titlePreamble, currentType, pluralize(currentKind)]
    .filter(s => s)
    .join(' ');

  return (
    <Table<CatalogTableRow>
      isLoading={loading}
      columns={columns || defaultColumns}
      options={{
        paging: showPagination,
        pageSize: 50,
        actionsColumnIndex: -1,
        loadingType: 'linear',
        showEmptyDataSourceMessage: !loading,
        padding: 'dense',
        pageSizeOptions: [50, 100, 150],
        ...tableOptions,
      }}
      title={`${titleDisplay} (${entities.length})`}
      data={rows}
      actions={actions || defaultActions}
      subtitle={subtitle}
      emptyContent={emptyContent}
    />
  );
};

CatalogTable.columns = columnFactories;
