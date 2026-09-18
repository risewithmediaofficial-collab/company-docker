import { Outlet, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2 } from 'lucide-react';

const AuthLayout = () => {
  const { companySlug } = useParams();
  const [portalOrg, setPortalOrg] = useState(null);
  const [portalLoading, setPortalLoading] = useState(Boolean(companySlug));

  useEffect(() => {
    if (!companySlug) {
      setPortalOrg(null);
      setPortalLoading(false);
      return;
    }

    let isMounted = true;
    setPortalLoading(true);
    axios
      .get(`/api/auth/company-portal/${companySlug}`)
      .then((res) => {
        if (isMounted && res.data?.company) {
          setPortalOrg(res.data.company);
        }
      })
      .catch(() => {
        if (isMounted) setPortalOrg(null);
      })
      .finally(() => {
        if (isMounted) setPortalLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companySlug]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 -left-4 w-48 sm:w-72 h-48 sm:h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-48 sm:w-72 h-48 sm:h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md p-6 sm:p-8 glass rounded-2xl shadow-2xl relative z-10 mx-4">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3 flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg shadow-primary/20 overflow-hidden border border-border/80">
            {portalOrg?.logo ? (
              <img
                src={portalOrg.logo}
                alt={portalOrg.name}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/branding/rise-with-media-logo.png';
                }}
              />
            ) : portalOrg ? (
              <Building2 size={36} className="text-primary" />
            ) : (
              <img
                src="/branding/rise-with-media-logo.png"
                alt="RISE WITH MEDIA logo"
                className="h-full w-full object-contain"
              />
            )}
          </div>

          {portalOrg ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider border border-blue-500/20">
                Company Portal
              </span>
              <h1 className="text-center text-xl sm:text-2xl font-black tracking-tight text-foreground">
                {portalOrg.name} + RWM
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 text-center">
                Sign in to your team & client workspace
              </p>
            </>
          ) : (
            <>
              <h1 className="text-center text-xl sm:text-2xl font-bold tracking-tight">RISE WITH MEDIA</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Welcome back to your workspace</p>
            </>
          )}
        </div>

        <Outlet context={{ portalOrg, companySlug, portalLoading }} />
      </div>
    </div>
  );
};

export default AuthLayout;

