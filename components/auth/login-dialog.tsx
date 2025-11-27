'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

import { signIn } from '@/lib/auth-client'
import type { Locale } from '@/lib/i18n-config'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type LoginDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: Locale
}

export function LoginDialog({ open, onOpenChange, locale }: LoginDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message ?? 'Erreur de connexion')
      } else {
        // Connexion réussie, fermer la dialog et rediriger vers admin
        onOpenChange(false)
        router.push(`/${locale}/admin`)
        router.refresh()
      }
    } catch (err) {
      setError('Une erreur est survenue')
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    void handleSubmit(e)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/20 bg-black/95 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[var(--brand-neon)]">
            Connexion Admin
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Accédez à l'interface d'administration
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white transition placeholder:text-white/40 focus:border-transparent focus:ring-2 focus:ring-[var(--brand-neon)]"
              placeholder="admin@carolinesenyk.fr"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              required
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white transition placeholder:text-white/40 focus:border-transparent focus:ring-2 focus:ring-[var(--brand-neon)]"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--brand-neon)] px-4 py-3 font-semibold text-black transition duration-200 hover:bg-[var(--neon-400)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
