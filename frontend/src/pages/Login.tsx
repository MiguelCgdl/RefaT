import { useState } from "react";
import { useForm } from "react-hook-form";

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  const { register, handleSubmit } = useForm<{ username: string; password: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    try {
      await onLogin(data.username, data.password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="login-page">
      <h2>Iniciar sesión — Refa</h2>
      <form onSubmit={onSubmit}>
        <label>
          Usuario
          <input {...register("username", { required: true })} autoComplete="username" />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            {...register("password", { required: true })}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
