import React from 'react';
import { PropertyMap } from './PropertyMap';
import { Property } from '@/types/property';

interface PropertyMapPanelProps {
  properties: Property[];
  activeId?: string | null;
  hoveredId?: string | null;
  onHover?: (id: string | null) => void;
  className?: string;
}

export const PropertyMapPanel: React.FC<PropertyMapPanelProps> = ({
  properties,
  activeId,
  hoveredId,
  onHover,
  className = '',
}) => (
  <div className={`h-[420px] lg:h-[640px] rounded-2xl overflow-hidden border border-white/60 shadow-[0_20px_50px_-12px_rgba(148,163,184,0.32)] ${className}`}>
    <PropertyMap properties={properties} activeId={activeId} hoveredId={hoveredId} onHover={onHover} />
  </div>
);
