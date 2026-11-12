import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function getApiErrorMessage(error: unknown): string | null {
    if (!axios.isAxiosError<unknown>(error)) {
        return null;
    }

    const data = error.response?.data;
    if (!data || typeof data !== "object") {
        return null;
    }

    const payload = data as Record<string, unknown>;
    const candidates = [
        payload.detail,
        payload.error_description,
        payload.error,
        payload.non_field_errors,
    ];

    for (const candidate of candidates) {
        const message = typeof candidate === "string"
            ? candidate
            : Array.isArray(candidate)
                ? candidate.filter((item): item is string => typeof item === "string").join(" ")
                : "";
        if (message.trim()) {
            return message.trim().slice(0, 500);
        }
    }

    return null;
}

export function GoogleCallback(){
    const location = useLocation();
    const navigate = useNavigate();
    const {loginWithGoogle} = useAuth();
    const started = useRef(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (started.current){
            return;
        }
        started.current = true;

        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const returnedState = params.get("state");
        const expectedState = window.sessionStorage.getItem("google_oauth_state");
        window.sessionStorage.removeItem("google_oauth_state");
        window.history.replaceState({}, document.title, location.pathname);

        const providerError = params.get("error_description") || params.get("error");
        if (providerError){
            setError(providerError.slice(0, 500));
            return;
        }

        if (!code || !returnedState || returnedState !== expectedState){
            setError("Google sign-in could not be verified. Please try again.");
            return;
        }

        void loginWithGoogle(code)
            .then(() => navigate("/", {replace:true}))
            .catch((cause: unknown) => setError(
                getApiErrorMessage(cause) || "Google sign-in failed. Please try again.",
            ));
    }, [location.pathname, location.search, loginWithGoogle, navigate]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
            <section className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl shadow-black/30">
                <h1 className="text-2xl font-bold">{error ? "Sign-in failed" : "Signing you in"}</h1>
                <p role={error ? "alert" : undefined} className="text-sm text-slate-300">
                    {error || "Completing Google sign-in..."}
                </p>
                {error && <Link className="inline-block font-medium text-indigo-400 hover:text-indigo-300" to="/login">Return to login</Link>}
            </section>
        </main>
    );
}