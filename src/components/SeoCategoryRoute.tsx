import React, { useEffect } from 'react';
import { useParams } from 'react';
import SeoHead from './SeoHead';

interface SeoCategoryRouteProps {
  HomePageComponent: React.ComponentType<any>;
  homePageProps: any;
}

export const SeoCategoryRoute: React.FC<SeoCategoryRouteProps> = ({
  HomePageComponent,
  homePageProps,
}) => {
  const params = useParams<{ category?: string; city?: string }>();

  const rawCat = params.category || '';
  const rawCity = params.city || '';

  // Formatear cadenas para SEO (ej: "electricistas" -> "Electricistas", "madrid" -> "Madrid")
  const categoryFormatted = rawCat ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase() : '';
  const cityFormatted = rawCity ? rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase() : '';

  const pageTitle = cityFormatted
    ? `${categoryFormatted} en ${cityFormatted}`
    : categoryFormatted
    ? `Servicios de ${categoryFormatted}`
    : 'Servicios Profesionales';

  const pageDescription = cityFormatted
    ? `Encuentra y contrata los mejores profesionales de ${categoryFormatted} en ${cityFormatted}. Opiniones verificadas, presupuesto sin compromiso y atención rápida.`
    : `Encuentra profesionales expertos en ${categoryFormatted}. Presupuestos sin compromiso y opiniones de clientes en GigeJob.`;

  // Sincronizar la búsqueda del HomePage si setSearch existe
  useEffect(() => {
    if (homePageProps.setSearch) {
      homePageProps.setSearch((prev: any) => ({
        ...prev,
        query: categoryFormatted || prev?.query || '',
        location: cityFormatted || prev?.location || '',
      }));
    }
  }, [categoryFormatted, cityFormatted]);

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        searchData={{
          category: categoryFormatted,
          location: cityFormatted,
        }}
      />
      <HomePageComponent {...homePageProps} />
    </>
  );
};

export default SeoCategoryRoute;
