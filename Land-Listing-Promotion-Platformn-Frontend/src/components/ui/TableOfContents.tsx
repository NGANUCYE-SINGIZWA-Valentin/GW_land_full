import React, { useState, useEffect } from 'react';

interface TocSection {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  sections: TocSection[];
  /** Offset from top for intersection detection (default: 120 to account for sticky header) */
  rootMargin?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  sections,
  rootMargin = '-120px 0px -50% 0px',
}) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      { rootMargin }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, rootMargin]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-white/60 dark:border-slate-800 shadow-[0_20px_50px_-12px_rgba(148,163,184,0.12)]">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-4">
        On this page
      </h3>
      <nav className="flex flex-col gap-1">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`text-sm py-1.5 px-2 rounded-lg transition-colors ${
              activeId === s.id
                ? 'text-brand-primary dark:text-brand-secondary bg-brand-primary/5 dark:bg-brand-secondary/10 font-semibold'
                : 'text-gray-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-secondary hover:bg-brand-primary/5 dark:hover:bg-brand-secondary/10'
            }`}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
};