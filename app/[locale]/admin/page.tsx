"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/fr");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/fr");
    router.refresh();
  };

  const handleSignOutClick = () => {
    void handleSignOut();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-lime-300 mb-2">
                Administration
              </h1>
              <p className="text-white/60">
                Bienvenue, {session.user.name ?? session.user.email}
              </p>
            </div>
            <button
              onClick={handleSignOutClick}
              type="button"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition"
            >
              Se déconnecter
            </button>
          </div>

          {/* Content */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4">
              🎉 Authentification réussie !
            </h2>
            <p className="text-white/80 mb-6">
              Le système d'authentification BetterAuth fonctionne correctement.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="font-semibold mb-2 text-lime-300">
                  Informations du compte
                </h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>
                    <span className="text-white/60">Email :</span>{" "}
                    {session.user.email}
                  </li>
                  <li>
                    <span className="text-white/60">Nom :</span>{" "}
                    {session.user.name ?? "Non défini"}
                  </li>
                  <li>
                    <span className="text-white/60">ID :</span>{" "}
                    {session.user.id}
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-lime-300/10 border border-lime-300/20 rounded-lg">
                <h3 className="font-semibold mb-2 text-lime-300">
                  ✅ Prochaines étapes
                </h3>
                <ul className="space-y-2 text-sm text-white/80 list-disc list-inside">
                  <li>
                    Créer les pages de gestion (projets, compositeurs, etc.)
                  </li>
                  <li>Ajouter les formulaires CRUD</li>
                  <li>Implémenter l'upload d'images</li>
                  <li>Ajouter la gestion des utilisateurs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
