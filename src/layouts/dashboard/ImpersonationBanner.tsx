import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import { useAuth, ROLE_REDIRECTS } from '@/components/auth/AuthContext';

export const ImpersonationBanner: React.FC = () => {
    const { isImpersonating, user, stopImpersonating } = useAuth();
    const navigate = useNavigate();

    if (!isImpersonating) return null;

    const handleReturn = async () => {
        const result = await stopImpersonating();
        navigate(result.role ? ROLE_REDIRECTS[result.role] : '/admin/dashboard');
    };

    return (
        <div className="flex items-center justify-between gap-3 bg-purple-600 text-white px-4 py-2 text-sm flex-shrink-0">
            <span className="flex items-center gap-2 min-w-0">
                <UserCog size={16} className="flex-shrink-0" />
                <span className="truncate">Viewing as <strong>{user?.fullName}</strong> ({user?.role})</span>
            </span>
            <button
                onClick={handleReturn}
                className="px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 font-semibold text-xs flex-shrink-0 cursor-pointer transition-colors"
            >
                Return to Admin
            </button>
        </div>
    );
};
