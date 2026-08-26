import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Star, Archive, XCircle, Trash2, CheckCircle2, Tag, Pencil, UserCog } from 'lucide-react';

interface ActionDropdownProps {
    canReview?: boolean;
    canPromote?: boolean;
    canUnpublish?: boolean;
    canArchive?: boolean;
    canDelete?: boolean;
    canMarkSold?: boolean;
    canApprove?: boolean;
    canReject?: boolean;
    canEdit?: boolean;
    canImpersonate?: boolean;
    onReview?: () => void;
    onPromote?: () => void;
    onUnpublish?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
    onMarkSold?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onEdit?: () => void;
    onImpersonate?: () => void;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
    canReview = false,
    canPromote = false,
    canUnpublish = false,
    canArchive = false,
    canDelete = false,
    canMarkSold = false,
    canApprove = false,
    canReject = false,
    canEdit = false,
    canImpersonate = false,
    onReview,
    onPromote,
    onUnpublish,
    onArchive,
    onDelete,
    onMarkSold,
    onApprove,
    onReject,
    onEdit,
    onImpersonate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fermeture au clic en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const closeDropdown = () => setIsOpen(false);

    const handleAction = (action?: () => void) => () => {
        action?.();
        closeDropdown();
    };

    const hasAnyAction = canReview || canPromote || canUnpublish || canArchive || canDelete || canMarkSold || canApprove || canReject || canEdit || canImpersonate;
    if (!hasAnyAction) return null;

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white shadow-sm shadow-slate-250 rounded-xl z-50 py-2">
                    <div className="px-4 py-1.5 text-xs font-medium text-slate-400 tracking-wider">
                        Actions
                    </div>
                    <div className="border-t border-slate-50 mt-1 pt-1">
                        {canReview && (
                            <button
                                onClick={handleAction(onReview)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-600 transition-colors text-left cursor-pointer"
                            >
                                <Eye size={15} />
                                <span>Review</span>
                            </button>
                        )}
                        {canApprove && (
                            <button
                                onClick={handleAction(onApprove)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-left cursor-pointer"
                            >
                                <CheckCircle2 size={15} />
                                <span>Approve</span>
                            </button>
                        )}
                        {canReject && (
                            <button
                                onClick={handleAction(onReject)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left cursor-pointer"
                            >
                                <XCircle size={15} />
                                <span>Reject</span>
                            </button>
                        )}
                        {canMarkSold && (
                            <button
                                onClick={handleAction(onMarkSold)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                            >
                                <Tag size={15} />
                                <span>Mark Sold</span>
                            </button>
                        )}
                        {canPromote && (
                            <button
                                onClick={handleAction(onPromote)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-brand-primary/5 hover:text-brand-primary transition-colors text-left cursor-pointer"
                            >
                                <Star size={15} />
                                <span>Promote</span>
                            </button>
                        )}
                        {canUnpublish && (
                            <button
                                onClick={handleAction(onUnpublish)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left cursor-pointer"
                            >
                                <XCircle size={15} />
                                <span>Unpublish</span>
                            </button>
                        )}
                        {canArchive && (
                            <button
                                onClick={handleAction(onArchive)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-600 transition-colors text-left cursor-pointer"
                            >
                                <Archive size={15} />
                                <span>Archive</span>
                            </button>
                        )}
                        {canEdit && (
                            <button
                                onClick={handleAction(onEdit)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left cursor-pointer"
                            >
                                <Pencil size={15} />
                                <span>Edit</span>
                            </button>
                        )}
                        {canImpersonate && (
                            <button
                                onClick={handleAction(onImpersonate)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors text-left cursor-pointer"
                            >
                                <UserCog size={15} />
                                <span>Log in as</span>
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={handleAction(onDelete)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left cursor-pointer"
                            >
                                <Trash2 size={15} />
                                <span>Delete</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};