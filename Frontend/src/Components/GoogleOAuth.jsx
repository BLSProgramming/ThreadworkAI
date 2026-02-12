import { useState, useEffect, useRef } from 'react';
import { AiOutlineLoading3Quarters } from '../assets/Icons';

/* ───────────────────────────────────────────────────────────
 * Module-level singleton state
 *
 * google.accounts.id.initialize() must only be called ONCE per
 * page-load.  In a React SPA the GoogleOAuth component mounts /
 * unmounts on every route change (Signup ↔ Login), so we keep
 * the callback pointer and page-context at module scope.
 * Each mount synchronously updates these variables before the
 * user can interact with the button, so the singleton callback
 * always acts on behalf of the currently-mounted page.
 * ─────────────────────────────────────────────────────────── */
let _onSuccess = null;
let _isSignup = false;
let _gsiInitialized = false;

async function _handleCredentialResponse(response) {
  const currentIsSignup = _isSignup;
  const currentOnSuccess = _onSuccess;

  try {
    const endpoint = currentIsSignup ? '/api/google-signup' : '/api/google-login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      currentOnSuccess?.(data);
    } else {
      throw new Error(
        data.message || data.error || `Google ${currentIsSignup ? 'signup' : 'login'} failed`
      );
    }
  } catch (err) {
    console.error(`Google ${currentIsSignup ? 'signup' : 'login'} error:`, err);
    alert(`Failed to ${currentIsSignup ? 'sign up' : 'sign in'} with Google. Please try again.`);
  }
}

function GoogleOAuth({ onSuccess, isSignup = false }) {
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const googleButtonRef = useRef(null);

  // Synchronously keep module-level pointers current so the
  // singleton callback always acts on behalf of the *mounted* page.
  _onSuccess = onSuccess;
  _isSignup = isSignup;

  useEffect(() => {
    let cancelled = false;

    const renderButton = () => {
      if (!window.google || cancelled || !googleButtonRef.current) return;

      // Initialize GIS exactly once per page-load
      if (!_gsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: _handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        _gsiInitialized = true;
      }

      // (Re-)render the button with the correct text for this page
      googleButtonRef.current.innerHTML = '';
      const buttonWidth = googleButtonRef.current.offsetWidth || 360;
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: buttonWidth,
        text: isSignup ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });

      setIsGoogleReady(true);
    };

    if (window.google) {
      renderButton();
    } else {
      const poll = setInterval(() => {
        if (window.google) {
          clearInterval(poll);
          renderButton();
        }
      }, 100);
      return () => { cancelled = true; clearInterval(poll); };
    }

    return () => { cancelled = true; };
  }, [isSignup]);

  return (
    <>
      {/* Google Button Container */}
      <div
        ref={googleButtonRef}
        className="w-full mb-6"
        style={{ minHeight: '44px' }}
      ></div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or</span>
        </div>
      </div>
    </>
  );
}

export default GoogleOAuth;