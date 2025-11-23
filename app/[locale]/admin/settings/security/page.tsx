"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShieldCheckIcon, ShieldOffIcon, KeyIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { logger } from "@/lib/logger";

type TwoFactorData = {
  secret: string;
  qrCode: string;
  otpauth: string;
};

export default function SecuritySettingsPage() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(
    null,
  );
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);

  // Generate 2FA QR code
  const handleGenerate2FA = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth("/api/admin/auth/2fa");

      if (!res.ok) {
        throw new Error("Failed to generate 2FA");
      }

      const data = (await res.json()) as TwoFactorData;
      setTwoFactorData(data);
    } catch (error) {
      logger.error("Error generating 2FA setup", error);
      toast.error("Erreur lors de la génération du QR code");
    } finally {
      setIsLoading(false);
    }
  };

  // Enable 2FA
  const handleEnable2FA = async () => {
    if (!twoFactorData || !verificationCode) {
      toast.error("Veuillez entrer le code de vérification");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetchWithAuth("/api/admin/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: twoFactorData.secret,
          token: verificationCode,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to enable 2FA");
      }

      setIs2FAEnabled(true);
      setTwoFactorData(null);
      setVerificationCode("");
      toast.success("2FA activée avec succès");
    } catch (error) {
      logger.error("Error enabling 2FA", error);
      toast.error("Code invalide ou erreur lors de l'activation");
    } finally {
      setIsLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth("/api/admin/auth/2fa", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to disable 2FA");
      }

      setIs2FAEnabled(false);
      setShowDisableDialog(false);
      toast.success("2FA désactivée avec succès");
    } catch (error) {
      logger.error("Error disabling 2FA", error);
      toast.error("Erreur lors de la désactivation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Sécurité</h1>
        <p className="mt-2 text-white/50">
          Gérez les paramètres de sécurité de votre compte
        </p>
      </div>

      {/* 2FA Card */}
      <Card className="border-white/10 bg-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            {is2FAEnabled ? (
              <ShieldCheckIcon className="h-6 w-6 text-lime-300" />
            ) : (
              <ShieldOffIcon className="h-6 w-6 text-white/30" />
            )}
            Authentification à deux facteurs (2FA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div>
              <p className="font-medium text-white">
                {is2FAEnabled ? "2FA activée" : "2FA désactivée"}
              </p>
              <p className="text-sm text-white/50">
                {is2FAEnabled
                  ? "Votre compte est protégé par l'authentification à deux facteurs"
                  : "Renforcez la sécurité de votre compte avec la 2FA"}
              </p>
            </div>
            {is2FAEnabled ? (
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisableDialog(true);
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                Désactiver
              </Button>
            ) : (
              <Button
                onClick={() => {
                  void handleGenerate2FA();
                }}
                disabled={isLoading || Boolean(twoFactorData)}
                className="bg-lime-300 text-black hover:bg-lime-400"
              >
                Activer la 2FA
              </Button>
            )}
          </div>

          {/* Setup 2FA */}
          {twoFactorData && !is2FAEnabled && (
            <div className="space-y-6 rounded-lg border border-lime-300/20 bg-lime-300/5 p-6">
              <div>
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Configuration de la 2FA
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 text-sm font-bold text-black">
                      1
                    </span>
                    <div>
                      <p className="font-medium text-white">
                        Téléchargez une application d'authentification
                      </p>
                      <p className="text-sm text-white/70">
                        Google Authenticator, Authy, ou Microsoft Authenticator
                      </p>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 text-sm font-bold text-black">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="mb-4 font-medium text-white">
                        Scannez ce QR code
                      </p>
                      <div className="inline-block rounded-lg bg-white p-4">
                        <Image
                          src={twoFactorData.qrCode}
                          alt="QR Code 2FA"
                          width={200}
                          height={200}
                        />
                      </div>
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-white/70 hover:text-white">
                          Impossible de scanner ? Utilisez ce code
                        </summary>
                        <div className="mt-2 rounded border border-white/10 bg-black p-3">
                          <p className="break-all font-mono text-xs text-white">
                            {twoFactorData.secret}
                          </p>
                        </div>
                      </details>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 text-sm font-bold text-black">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="mb-3 font-medium text-white">
                        Entrez le code de vérification
                      </p>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label htmlFor="code" className="sr-only">
                            Code de vérification
                          </Label>
                          <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => {
                              setVerificationCode(e.target.value);
                            }}
                            className="border-white/20 bg-black font-mono text-lg tracking-widest text-white"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            void handleEnable2FA();
                          }}
                          disabled={isLoading || verificationCode.length !== 6}
                          className="bg-lime-300 text-black hover:bg-lime-400"
                        >
                          <KeyIcon className="mr-2 h-4 w-4" />
                          Vérifier
                        </Button>
                      </div>
                    </div>
                  </li>
                </ol>
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  setTwoFactorData(null);
                  setVerificationCode("");
                }}
                className="text-white/50 hover:text-white"
              >
                Annuler
              </Button>
            </div>
          )}

          {/* 2FA Info */}
          {!twoFactorData && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="mb-2 font-medium text-white">
                Qu'est-ce que la 2FA ?
              </h4>
              <p className="text-sm text-white/70">
                L'authentification à deux facteurs ajoute une couche de sécurité
                supplémentaire à votre compte. Même si quelqu'un obtient votre
                mot de passe, il ne pourra pas se connecter sans le code généré
                par votre application d'authentification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disable 2FA Dialog */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent className="border-lime-300/20 bg-black">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Désactiver la 2FA ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir désactiver l'authentification à deux
              facteurs ? Cela réduira la sécurité de votre compte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/20 text-white hover:bg-white/5"
              disabled={isLoading}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                void handleDisable2FA();
              }}
              disabled={isLoading}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isLoading ? "Désactivation..." : "Désactiver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
