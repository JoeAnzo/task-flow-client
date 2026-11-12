
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import { loginSchema,type loginInput } from '../schemas/auth.schema'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GoogleLoginButton } from './GoogleLoginButton'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'

export const LoginForm = () => {
    const navigate = useNavigate();
    const {login} = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const {
        register,
        handleSubmit,
        setError,
        formState:{errors,isSubmitting},
    } = useForm<loginInput>({
        resolver:zodResolver(loginSchema),
})

const onSubmit =  async (data:loginInput) => {
    try {
        await login(data);
        navigate("/")
    } catch {
       setError("root.server",{
        type:"server",
        message:"Login failed. Check your Email and password"
       }) 
    }
}

return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
        <form
            className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/30"
            onSubmit={handleSubmit(onSubmit)}
        >
            <header className="space-y-2">
                <p className="text-sm font-semibold tracking-wide text-indigo-400">TaskFlow</p>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-sm text-slate-400">Sign in to continue to your tasks.</p>
            </header>
            <GoogleLoginButton />
            <div className="flex items-center gap-3 text-xs uppercase text-slate-500" aria-hidden="true">
                <span className="h-px flex-1 bg-slate-700" />
                <span>or</span>
                <span className="h-px flex-1 bg-slate-700" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200" htmlFor="email">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                    <input
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        {...register('email')}
                    />
                </div>
                {errors.email && <p className="text-sm text-rose-400" id="email-error">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200" htmlFor="password">Password</label>
                <div className="relative">
                    <input
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-11 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        {...register('password')}
                    />
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
                    <button
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-400"
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-controls="password"
                        onClick={() => setShowPassword((visible) => !visible)}
                    >
                        {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                </div>
                {errors.password && <p className="text-sm text-rose-400" id="password-error">{errors.password.message}</p>}
            </div>
            <button
                className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Logging in':'Login'}
            </button>
            <p className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{' '}
                <Link className="font-medium text-indigo-400 hover:text-indigo-300" to="/signup">Sign up</Link>
            </p>
            {errors.root?.server && (
            <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {errors.root.server.message}
            </p>
            )}
        </form>
    </main>
)
}