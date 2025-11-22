"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Locale } from "@/lib/i18n-config";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: Locale;
};

export function LoginDialog({ open, onOpenChange, locale }: LoginDialogProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Erreur de connexion");
      } else {
        // Connexion réussie, fermer la dialog et rediriger vers admin
        onOpenChange(false);
        router.push(`/${locale}/admin`);
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    void handleSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black/95 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-lime-300">
            Connexion Admin
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Accédez à l'interface d'administration
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-lime-300 focus:border-transparent transition text-white placeholder:text-white/40"
              placeholder="admin@carolinesenyk.fr"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/80 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-lime-300 focus:border-transparent transition text-white placeholder:text-white/40"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime-300 hover:bg-lime-400 text-black font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
