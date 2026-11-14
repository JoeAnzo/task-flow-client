const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

function createOAuthState():string {
    const bytes = window.crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function GoogleLoginButton(){
    const startGoogleLogin = () => {
        if (!googleClientId){
            return;
        }

        const redirectUri = googleRedirectUri || `${window.location.origin}/auth/google/callback`;
        const state = createOAuthState();
        window.sessionStorage.setItem("google_oauth_state", state);

        const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authorizationUrl.search = new URLSearchParams({
            client_id: googleClientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: "openid email profile",
            state,
        }).toString();

        window.location.assign(authorizationUrl.toString());
    };

    if (!googleClientId){
        return null;
    }

    return (
        <button
            className="w-full rounded-lg border border-slate-600 bg-white px-4 py-2.5 font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            type="button"
            onClick={startGoogleLogin}
        >
            <svg xmlns="http://w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/>
            </svg>
            Continue with Google
        </button>
    );
}