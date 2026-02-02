
import { Suspense } from 'react';
import ResetPasswordContent from './ResetPasswordContent';
import { Loader2 } from 'lucide-react';

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-brand-gradient flex items-center justify-center text-white">
                <Loader2 className="w-12 h-12 animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
