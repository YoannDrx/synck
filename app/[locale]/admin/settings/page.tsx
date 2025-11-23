import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldIcon, BellIcon, SmartphoneIcon, ActivityIcon } from "lucide-react";
import { ProfileSettings } from "@/components/admin/settings/profile-settings";
import { PasswordSettings } from "@/components/admin/settings/password-settings";

export default async function AdminSettingsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-white/60">
            Gérez votre compte administrateur et la sécurité.
          </p>
        </div>
        <Badge className="w-fit bg-lime-300 text-black">
          {session.user.email}
        </Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldIcon className="h-5 w-5 text-lime-300" />
              Profil & identité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-white/70">
            <ProfileSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <SmartphoneIcon className="h-5 w-5 text-lime-300" />
              Mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-white/70">
            <PasswordSettings />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BellIcon className="h-5 w-5 text-lime-300" />
              Notifications & alertes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-white/70">
            <p>
              Choisissez quoi recevoir : tentatives de connexion, imports, erreurs de
              traitement, etc. (préférences à venir).
            </p>
            <Badge variant="outline" className="border-white/20 text-white/80">
              Préférences à venir
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ActivityIcon className="h-5 w-5 text-lime-300" />
              Journal & sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-white/70">
            <p>
              Historique des connexions et audit des actions sensibles pour les
              administrateurs. (À implémenter)
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/20 text-white/80">
                Connexions récentes
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/80">
                Journal des actions
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
