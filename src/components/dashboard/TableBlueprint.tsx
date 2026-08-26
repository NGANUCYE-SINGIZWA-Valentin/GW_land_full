import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, SlidersHorizontal, Columns2, Check, X, Inbox } from 'lucide-react';

export interface ColumnConfig<T> {
    header: string;
    accessorKey?: keyof T;
    render?: (row: T) => React.ReactNode;
    headerClassName?: string; // Appliqué uniquement au <th>
    cellClassName?: string;   // Appliqué uniquement au <td>
    hideable?: boolean;       // Si false, la colonne ne peut pas être masquée (défaut: true)
    defaultVisible?: boolean; // Visibilité initiale (défaut: true)
}

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterConfig<T> {
    accessorKey: keyof T;
    label: string;
    options: FilterOption[];
}

interface TableBlueprintProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    isLoading?: boolean;
    emptyMessage?: string;

    // 🔍 RECHERCHE INTERNE (client-side)
    searchKeys?: (keyof T)[];          // Colonnes sur lesquelles la recherche s'applique

    // 🎯 FILTRES CONFIGURABLES PAR COLONNE
    filterConfig?: FilterConfig<T>[];

    // Props ajoutées pour centraliser la Barre de Filtres et Pagination
    searchPlaceholder?: string;
    totalItems?: number;
    onSearchChange?: (value: string) => void;
    onFilterClick?: () => void;
    onPrevPage?: () => void;
    onNextPage?: () => void;
    hasPrevPage?: boolean;
    hasNextPage?: boolean;
}

export function TableBlueprint<T extends { id: string | number }>({
    data,
    columns,
    isLoading = false,
    searchPlaceholder = "Search...",
    totalItems = 0,
    searchKeys,
    filterConfig,
    onSearchChange,
    onFilterClick,
    onPrevPage,
    onNextPage,
    hasPrevPage = false,
    hasNextPage = false,
    emptyMessage = "No data found.",
}: TableBlueprintProps<T>) {
    // 🎛️ ÉTAT DE VISIBILITÉ DES COLONNES
    const [columnVisibility, setColumnVisibility] = useState<Record<number, boolean>>(() => {
        const initial: Record<number, boolean> = {};
        columns.forEach((col, index) => {
            initial[index] = col.defaultVisible ?? true;
        });
        return initial;
    });

    // 🔍 ÉTAT DE LA RECHERCHE
    const [searchValue, setSearchValue] = useState('');

    // 🎯 ÉTAT DES FILTRES
    const [selectedFilters, setSelectedFilters] = useState<Record<string, Set<string>>>(() => {
        if (!filterConfig) return {};
        const initial: Record<string, Set<string>> = {};
        for (const filter of filterConfig) {
            initial[String(filter.accessorKey)] = new Set();
        }
        return initial;
    });

    const reduceMotion = useReducedMotion();

    const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const columnMenuRef = useRef<HTMLDivElement>(null);
    const filterMenuRef = useRef<HTMLDivElement>(null);

    // Filtrer les colonnes visibles
    const visibleColumns = columns.filter((_, index) => columnVisibility[index] !== false);

    // 📊 DONNÉES FILTRÉES (recherche + filtres)
    const filteredData = useMemo(() => {
        let result = data;

        // 1️⃣ Appliquer les filtres par colonne
        const activeFilterKeys = Object.entries(selectedFilters)
            .filter(([_, set]) => set.size > 0)
            .map(([key]) => key);

        if (activeFilterKeys.length > 0) {
            result = result.filter((row) => {
                return activeFilterKeys.every((key) => {
                    const filterSet = selectedFilters[key];
                    const rowValue = String(row[key as keyof T] ?? '');
                    return filterSet.has(rowValue);
                });
            });
        }

        // 2️⃣ Appliquer la recherche textuelle
        if (searchValue && searchKeys && searchKeys.length > 0) {
            const query = searchValue.toLowerCase();
            result = result.filter((row) => {
                return searchKeys.some((key) => {
                    const value = row[key];
                    return String(value ?? '').toLowerCase().includes(query);
                });
            });
        }

        return result;
    }, [data, searchValue, searchKeys, selectedFilters]);

    // Compteur de filtres actifs
    const activeFilterCount = useMemo(() => {
        return Object.values(selectedFilters).filter(set => set.size > 0).length;
    }, [selectedFilters]);

    // Fermeture des menus au clic en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
                setIsColumnMenuOpen(false);
            }
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setIsFilterMenuOpen(false);
            }
        };
        if (isColumnMenuOpen || isFilterMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isColumnMenuOpen, isFilterMenuOpen]);

    const toggleColumnVisibility = (index: number) => {
        setColumnVisibility(prev => ({
            ...prev,
            [index]: !(prev[index] ?? true),
        }));
    };

    // Gestion du changement de recherche
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        onSearchChange?.(value);
    }, [onSearchChange]);

    // Gestion du clic sur le bouton Filter
    const handleFilterClick = useCallback(() => {
        if (filterConfig) {
            setIsFilterMenuOpen(prev => !prev);
        } else {
            onFilterClick?.();
        }
    }, [filterConfig, onFilterClick]);

    // Bascule d'une option de filtre
    const toggleFilterOption = useCallback((accessorKey: string, value: string) => {
        setSelectedFilters(prev => {
            const newSet = new Set(prev[accessorKey]);
            if (newSet.has(value)) {
                newSet.delete(value);
            } else {
                newSet.add(value);
            }
            return { ...prev, [accessorKey]: newSet };
        });
    }, []);

    // Réinitialiser tous les filtres
    const clearAllFilters = useCallback(() => {
        if (!filterConfig) return;
        setSelectedFilters(() => {
            const cleared: Record<string, Set<string>> = {};
            for (const filter of filterConfig) {
                cleared[String(filter.accessorKey)] = new Set();
            }
            return cleared;
        });
    }, [filterConfig]);

    // Vérifier si une option de filtre est sélectionnée
    const isFilterSelected = useCallback((accessorKey: string, value: string): boolean => {
        return selectedFilters[accessorKey]?.has(value) ?? false;
    }, [selectedFilters]);

    return (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">

            {/* 🔍 BARRE DE FILTRES CENTRALISÉE */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                    />
                    {searchValue && (
                        <button
                            onClick={() => { setSearchValue(''); onSearchChange?.(''); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-auto">

                    {/* 📑 BOUTON COLONNES */}
                    <div className="relative" ref={columnMenuRef}>
                        <button
                            onClick={() => setIsColumnMenuOpen(prev => !prev)}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                            <Columns2 size={14} />
                            Columns
                        </button>

                        {/* MENU DÉROULANT DE VISIBILITÉ DES COLONNES */}
                        {isColumnMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white shadow-sm shadow-slate-250 rounded-xl z-50 py-2">
                                <div className="px-4 py-1.5 text-xs font-medium text-slate-400 tracking-wider">
                                    Toggle Columns
                                </div>
                                <div className="border-t border-slate-50 mt-1 pt-1">
                                    {columns.map((column, index) => {
                                        const isHideable = column.hideable ?? true;
                                        const isVisible = columnVisibility[index] !== false;
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => isHideable && toggleColumnVisibility(index)}
                                                disabled={!isHideable}
                                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left ${isHideable
                                                    ? 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                                                    : 'text-slate-300 cursor-not-allowed'
                                                    }`}
                                            >
                                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isVisible
                                                    ? 'bg-brand-primary border-brand-primary'
                                                    : 'border-slate-300'
                                                    } ${!isHideable ? 'opacity-40' : ''}`}>
                                                    {isVisible && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </span>
                                                <span className="truncate">{column.header}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🎯 BOUTON FILTER AVEC MENU DÉROULANT */}
                    <div className="relative" ref={filterMenuRef}>
                        <button
                            onClick={handleFilterClick}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${activeFilterCount > 0
                                ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                }`}
                        >
                            <SlidersHorizontal size={14} />
                            Filter
                            {activeFilterCount > 0 && (
                                <span className="ml-0.5 w-5 h-5 flex items-center justify-center bg-brand-primary text-white text-[10px] font-bold rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        {/* MENU DÉROULANT DES FILTRES */}
                        {isFilterMenuOpen && filterConfig && filterConfig.length > 0 && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-sm shadow-slate-200 rounded-xl z-50 py-2">
                                <div className="px-4 py-1.5 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-400 tracking-wider">
                                        Filters
                                    </span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline transition-colors cursor-pointer"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div className="border-t border-slate-50 mt-1 pt-1 max-h-80 overflow-y-auto">
                                    {filterConfig.map((filterGroup, groupIndex) => (
                                        <div key={groupIndex}>
                                            <div className="px-4 py-1.5 mt-1 text-xs font-bold text-slate-500 tracking-wider">
                                                {filterGroup.label}
                                            </div>
                                            {filterGroup.options.map((option, optIndex) => {
                                                const accessorKey = String(filterGroup.accessorKey);
                                                const isChecked = isFilterSelected(accessorKey, option.value);
                                                return (
                                                    <button
                                                        key={optIndex}
                                                        onClick={() => toggleFilterOption(accessorKey, option.value)}
                                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                                                    >
                                                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked
                                                            ? 'bg-brand-primary border-brand-primary'
                                                            : 'border-slate-300'
                                                            }`}>
                                                            {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                                                        </span>
                                                        <span className="truncate">{option.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* 📦 LE CONTENEUR DU TABLEAU SKINNÉ */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="bg-slate-100/60 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {visibleColumns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`py-3 px-3 sm:px-5 ${column.headerClassName || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {visibleColumns.map((_, colIndex) => (
                                        <td key={colIndex} className="py-3 px-3 sm:px-5">
                                            <div className="h-4 rounded-lg bg-slate-200/60 dark:bg-slate-800 animate-pulse" style={{ width: `${60 + ((rowIndex + colIndex) % 3) * 15}%` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleColumns.length}
                                    className="py-16 px-6 text-center"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <motion.div
                                            className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center"
                                            animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                            <Inbox size={22} />
                                        </motion.div>
                                        <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <AnimatePresence initial={false}>
                                {filteredData.map((row, rowIndex) => (
                                    <motion.tr
                                        key={row.id}
                                        layout={!reduceMotion}
                                        initial={reduceMotion ? undefined : { opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={reduceMotion ? undefined : { opacity: 0 }}
                                        transition={{ duration: 0.2, delay: reduceMotion ? 0 : Math.min(rowIndex, 8) * 0.03, ease: 'easeOut' }}
                                        className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors group cursor-pointer"
                                    >
                                        {visibleColumns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`py-3 px-3 sm:px-5 antialiased ${column.cellClassName || ''}`}
                                            >
                                                {column.render
                                                    ? column.render(row)
                                                    : column.accessorKey
                                                        ? String(row[column.accessorKey] || '')
                                                        : null
                                                }
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 📑 FOOTER DE PAGINATION CENTRALISÉ */}
            <div className="p-4 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Showing <span className="text-slate-900 dark:text-white font-extrabold">{filteredData.length}</span> of <span className="text-slate-900 dark:text-white font-extrabold">{totalItems || data.length}</span> items</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevPage}
                        disabled={!hasPrevPage}
                        className="px-4 py-2 border border-slate-200/80 dark:border-slate-700/80 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer shadow-sm disabled:shadow-none"
                    >
                        Previous
                    </button>
                    <button
                        onClick={onNextPage}
                        disabled={!hasNextPage}
                        className="px-4 py-2 border border-slate-200/80 dark:border-slate-700/80 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer shadow-sm disabled:shadow-none"
                    >
                        Next
                    </button>
                </div>
            </div>

        </div>
    );
}