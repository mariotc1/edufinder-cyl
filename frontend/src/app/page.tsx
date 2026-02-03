import { Suspense } from 'react';
import SearchContent from '@/components/home/SearchContent';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-gradient">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
        </div>
      }>
        <SearchContent />
      </Suspense>
    </div>
  );
}