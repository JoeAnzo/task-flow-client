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
            <svg
                className="mr-2 inline-block h-5 w-5 align-[-4px]"
                viewBox="0 0 48 48"
                aria-hidden="true"
            >
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.15 7.14-17.56Z" />
                <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
                <path fill="#34A853" d="M24 48c6.47 0 11.91-2.13 15.88-5.89l-7.62-5.91c-2.12 1.42-4.83 2.26-8.26 2.26-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            Continue with Google
        </button>
    );
}