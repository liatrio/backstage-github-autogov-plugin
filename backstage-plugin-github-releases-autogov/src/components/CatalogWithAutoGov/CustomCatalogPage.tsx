import {
  Content,
  ContentHeader,
  CreateButton,
  PageWithHeader,
  SupportButton,
  TableColumn,
  TableProps,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  createTranslationRef,
  useTranslationRef,
} from '@backstage/core-plugin-api/alpha';
import {
  CatalogFilterLayout,
  EntityKindPicker,
  EntityLifecyclePicker,
  EntityListProvider,
  EntityNamespacePicker,
  EntityOwnerPicker,
  EntityOwnerPickerProps,
  EntityProcessingStatusPicker,
  EntityTagPicker,
  EntityTypePicker,
  UserListFilterKind,
  UserListPicker,
} from '@backstage/plugin-catalog-react';
import React, { ReactNode } from 'react';
import { CatalogTable } from './CatalogTable';
import { CatalogTableRow } from './types';
import { EntityRepoSourcePicker } from './EntityRepoSourceFilter';

/** @internal */
export interface BaseCatalogPageProps {
  filters: ReactNode;
  content?: ReactNode;
}

/** @alpha */
export const catalogTranslationRef = createTranslationRef({
  id: 'catalog',
  messages: {
    catalog_page_title: `{{orgName}} Catalog`,
    catalog_page_create_button_title: 'Create',
  },
});

export function BaseCatalogPage(props: BaseCatalogPageProps) {
  const { filters, content = <CatalogTable /> } = props;
  const orgName =
    useApi(configApiRef).getOptionalString('organization.name') ?? 'Liatrio';
  const { t } = useTranslationRef(catalogTranslationRef);

  return (
    <PageWithHeader title={t('catalog_page_title', { orgName })} themeId="home">
      <Content>
        <ContentHeader title="">
          <CreateButton
            title={t('catalog_page_create_button_title')}
            to="/create"
          />
          <SupportButton>All your software catalog entities</SupportButton>
        </ContentHeader>
        <EntityListProvider>
          <CatalogFilterLayout>
            <CatalogFilterLayout.Filters>{filters}</CatalogFilterLayout.Filters>
            <CatalogFilterLayout.Content>{content}</CatalogFilterLayout.Content>
          </CatalogFilterLayout>
        </EntityListProvider>
      </Content>
    </PageWithHeader>
  );
}

/**
 * Props for root catalog pages.
 *
 * @public
 */
export interface CustomCatalogPageProps {
  initiallySelectedFilter?: UserListFilterKind;
  columns?: TableColumn<CatalogTableRow>[];
  actions?: TableProps<CatalogTableRow>['actions'];
  initialKind?: string;
  tableOptions?: TableProps<CatalogTableRow>['options'];
  emptyContent?: ReactNode;
  ownerPickerMode?: EntityOwnerPickerProps['mode'];
}

export function CustomCatalogPage(props: CustomCatalogPageProps) {
  const {
    columns,
    actions,
    initiallySelectedFilter = 'owned',
    initialKind = 'component',
    tableOptions = {},
    emptyContent,
    ownerPickerMode,
  } = props;

  return (
    <BaseCatalogPage
      filters={
        <>
          <EntityKindPicker initialFilter={initialKind} />
          <EntityTypePicker />
          <UserListPicker initialFilter={initiallySelectedFilter} />
          <EntityOwnerPicker mode={ownerPickerMode} />
          <EntityLifecyclePicker />
          <EntityTagPicker />
          <EntityProcessingStatusPicker />
          <EntityNamespacePicker />
          <EntityRepoSourcePicker />
        </>
      }
      content={
        <CatalogTable
          columns={columns}
          actions={actions}
          tableOptions={tableOptions}
          emptyContent={emptyContent}
        />
      }
    />
  );
}
