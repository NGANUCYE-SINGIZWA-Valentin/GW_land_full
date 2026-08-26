import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="bg-brand-surface dark:bg-slate-950 py-24 md:py-32 transition-colors duration-300">
      <Container>
        <div className="flex flex-col items-center text-center max-w-md mx-auto">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            You don't have access to this page
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-semibold text-sm mb-8">
            Your account doesn't have permission to view this section. If you think this is a mistake, contact support.
          </p>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};
