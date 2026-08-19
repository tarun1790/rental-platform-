import React from 'react';
import { CHICAGO_LISTINGS } from '../../../data/chicago-listings';
import { PropertyDetailClient } from '../../../components/property/PropertyDetailClient';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  return CHICAGO_LISTINGS.map((listing) => ({
    id: listing.id,
  }));
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  return <PropertyDetailClient propertyId={params.id} />;
}
