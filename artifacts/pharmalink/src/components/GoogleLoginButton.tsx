import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  onSuccess: (credential: string) => void;
  disabled?: boolean;
  label?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (el: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
    handleGoogleCredential?: (response: { credential: string }) => void;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export default function GoogleLoginButton({ onSuccess, disabled, label = "الدخول بحساب Google" }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || initialized.current || !btnRef.current) return;

    const init = () => {
      if (!window.google || !btnRef.current) return;
      initialized.current = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res: { credential: string }) => onSuccess(res.credential),
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: btnRef.current.offsetWidth,
        text: "continue_with",
        locale: "ar",
        shape: "rectangular",
      });
    };

    if (window.google) {
      init();
    } else {
      // Load Google script
      const existing = document.getElementById("google-gsi-script");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = init;
        document.head.appendChild(script);
      } else {
        existing.addEventListener("load", init);
      }
    }
  }, [onSuccess]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-white hover:bg-muted/30 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-60 transition-colors"
        title="Google Client ID غير مضبوط بعد"
      >
        <GoogleIcon />
        {label}
        <span className="text-xs opacity-70">(قريباً)</span>
      </button>
    );
  }

  return (
    <div className="relative w-full min-h-[44px]">
      {disabled && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={btnRef} className="w-full" style={{ minHeight: 44 }} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
