// Server component
export const metadata = {
  title: 'North Lub',
  icons: { icon: '/images/logo.png' },
};

import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.22)_0%,_rgba(2,6,23,1)_28%,_rgba(2,6,23,1)_100%)] px-6 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent_35%,rgba(59,130,246,0.06)_100%)]" />
        <div className="absolute left-1/2 top-[-8rem] h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-[-4rem] h-56 w-56 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="absolute right-[-4rem] top-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto px-4 animate-in space-y-7 fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src="/images/logo.png" alt="North Lub logo" className="h-20 w-auto" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              North Lub
            </h1>
            <p className="mx-auto max-w-md text-sm font-medium leading-6 text-slate-400 sm:text-base">
              Sistema de gestion con una interfaz sobria, moderna y enfocada en operacion.
            </p>
          </div>
        </div>

        <LoginForm />
        <p className="text-center text-xs font-medium text-slate-600">
          &copy; {new Date().getFullYear()} North Lub. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
