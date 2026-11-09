import { type signUpInput,signUpSchema } from '../schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import {useForm} from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../services/auth.service'


export const SignUpForm = () => {


const navigate = useNavigate()

const {
    register,
    handleSubmit,
    setError,
    formState:{errors,isSubmitting},
} = useForm<signUpInput>({
    resolver:zodResolver(signUpSchema)
})

const onSubmit = async (data:signUpInput) => {
    try {
        await registerUser(data);
        navigate("/")
    } catch {
        setError("root.server",{
            type:"server",
            message:"sign-up failed. Please check your details and try again"
        })
    }
}

return(
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
        <form
            className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/30"
            onSubmit={handleSubmit(onSubmit)}
        >
            <header className="space-y-2">
                <p className="text-sm font-semibold tracking-wide text-indigo-400">TaskFlow</p>
                <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
                <p className="text-sm text-slate-400">Sign up to start organizing your tasks.</p>
            </header>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200" htmlFor="username">Username</label>
                <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    type="text"
                    id="username"
                    autoComplete="username"
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={errors.username ? "username-error" : undefined}
                    {...register('username')}
                />
                {errors.username && <p className="text-sm text-rose-400" id="username-error">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200" htmlFor="email">Email</label>
                <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    type="email"
                    id="email"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    {...register('email')}
                />
                {errors.email && <p className="text-sm text-rose-400" id="email-error">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200" htmlFor="password">Password</label>
                <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    {...register('password')}
                />
                {errors.password && <p className="text-sm text-rose-400" id="password-error">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-200" htmlFor="confirmPassword">Confirm password</label>
                <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                    type="password"
                    id="confirmPassword"
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-sm text-rose-400" id="confirm-password-error">{errors.confirmPassword.message}</p>}
            </div>
            <button
                className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Signing up':'Sign up'}
            </button>
            <p className="text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link className="font-medium text-indigo-400 hover:text-indigo-300" to="/login">Log in</Link>
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