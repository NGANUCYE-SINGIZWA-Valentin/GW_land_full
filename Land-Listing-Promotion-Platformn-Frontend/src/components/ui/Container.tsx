import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  /** Classes supplémentaires (ex: padding vertical `py-12`) */
  className?: string;
}

/**
 * Conteneur horizontal unifié pour aligner tout le contenu
 * sur la même grille à travers les breakpoints.
 */
export const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={`w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-12 mx-auto ${className ?? ''}`}>
      {children}
    </div>
  );
};