import { ShieldCheck, X, Check } from 'lucide-react';

export const TermsModal = ({ open, onClose, onAccept }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#12B7D4]/10 text-[#12B7D4] flex items-center justify-center">
              <ShieldCheck size={17} />
            </div>
            <div>
              <h3 id="terms-modal-title" className="text-sm font-extrabold text-slate-900 dark:text-white">
                Terms &amp; Conditions and Privacy Policy
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                RiseWithMedia Agency OS Platform Agreement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Close Terms modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">1. Authorized Workspace Access</h4>
            <p>
              You agree to access only the workspace, client portals, tasks, and financial records assigned to your account role. Credentials and session tokens must not be shared with unauthorized users.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">2. Data Confidentiality &amp; Security</h4>
            <p>
              All client credentials, project assets, invoices, vendor payouts, and reports stored in RiseWithMedia are strictly isolated per organization and subject to audit logging for account protection.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">3. Cookies, Local Storage &amp; Browser Cache</h4>
            <p>
              Essential cookies and local browser storage are used to keep you authenticated securely, enforce anti-bot CAPTCHA checks, and store UI/theme preferences. Optional cache and analytics settings can be adjusted anytime via Cookie &amp; Cache Settings.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">4. Compliance &amp; Acceptable Use</h4>
            <p>
              Automated scraping, credential stuffing, bypassing role-based restrictions, or uploading malicious content is prohibited and may result in immediate account suspension.
            </p>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-[#12B7D4] hover:bg-[#0ea5c6] shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>I Accept Terms</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
