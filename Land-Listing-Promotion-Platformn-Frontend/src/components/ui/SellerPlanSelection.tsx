import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { DashboardButton } from './DashboardButton';
import { CheckoutModal } from '@/components/dashboard/CheckoutModal';

interface PlanProps {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isCurrent?: boolean;
  renewalDays?: number;
}

export const SellerPlanSelection: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanProps | null>(null);
  // Structure des données calquée sur l'image image_bbb202.png avec des features adaptées à GW Land
  const plans: PlanProps[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 10,
      description: 'Up to 10 members',
      isCurrent: true,
      renewalDays: 14,
      features: ['10 Team Members', 'Basic Property Listings', 'Standard Support'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 24,
      description: 'Up to 30 members',
      features: ['30 Team Members', 'Premium Property Badge', 'Advanced Seller Analytics', 'Priority Support'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 59,
      description: 'Unlimited members & SSO',
      features: ['Unlimited Members', 'Dedicated Account Manager', 'SSO & Advanced Security', 'API Access for Listings'],
    },
  ];

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 💳 PLAN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${plan.isCurrent
                ? 'border border-slate-200 shadow-slate-200 shadow-md'
                : 'shadow-sm shadow-slate-200 hover:shadow-md'
              }`}
          >
            {/* TOP CARD CONTENT */}
            <div className="space-y-2">
              {/* Name & Badge Row */}
              <div className="flex items-center justify-between gap-2 h-6">
                <h4 className="text-base font-semibold text-slate-700 tracking-tight">{plan.name}</h4>

                {/* Badge d'expiration orange du plan Starter vu sur l'image */}
                {plan.isCurrent && plan.renewalDays && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100/50 animate-pulse">
                    Renews in {plan.renewalDays} days
                  </span>
                )}
              </div>

              {/* Description / Limitation */}
              <p className="text-xs text-slate-400 font-medium">{plan.description}</p>

              {/* Price Row */}
              <div className="pt-2 flex items-baseline gap-1 text-slate-700">
                <span className="text-3xl font-semibold tracking-tight">${plan.price}</span>
                <span className="text-xs font-medium text-slate-400">per month</span>
              </div>

              {/* Micro-features descriptives pour enrichir la carte (Optionnel mais recommandé pour les Sellers) */}
              <ul className="pt-4 space-y-2.5 border-t border-slate-50">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Check size={12} className="text-slate-400 flex-shrink-0" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ACTION BUTTON ROW (Layout boutons exact de l'image image_bbb202.png) */}
            <div className="pt-6 mt-6">
              {plan.isCurrent ? (
                <DashboardButton variant="outline" disabled>
                  Current plan
                </DashboardButton>
              ) : (
                <DashboardButton variant="primary" onClick={() => setSelectedPlan(plan)}>
                  Upgrade plan
                </DashboardButton>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          itemName={`${selectedPlan.name} Plan Subscription`}
        />
      )}
    </div>
  );
};