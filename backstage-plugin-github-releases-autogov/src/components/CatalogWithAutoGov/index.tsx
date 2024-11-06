import React from 'react';
import { useOutlet } from 'react-router-dom';
import { CustomCatalogPage, CustomCatalogPageProps } from './CustomCatalogPage';

// Main CatalogPage component that checks for nested routes
export function CatalogPage(props: CustomCatalogPageProps) {
  const outlet = useOutlet();
  return outlet || <CustomCatalogPage {...props} />;
}

// Export CatalogPage as the default for easy integration in App.tsx
export default CatalogPage;

// Export CustomCatalogPage directly for more flexible use
export { CustomCatalogPage };

// Export types for flexibility in usage
export type { CustomCatalogPageProps };
