"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

export function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit comporter au moins 8 caractères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La confirmation ne correspond pas");
      return;
    }
    try {
      setSaving(true);
      const res = await fetchWithAuth("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la mise à jour");
      }
      toast.success("Mot de passe mis à jour");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Mot de passe actuel</Label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
          }}
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <Label>Nouveau mot de passe</Label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
          }}
          placeholder="Au moins 8 caractères"
        />
      </div>
      <div className="space-y-2">
        <Label>Confirmation</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
          placeholder="Répéter le mot de passe"
        />
      </div>
      <Button
        onClick={() => {
          void handleSave();
        }}
        disabled={saving}
        className="bg-lime-300 text-black hover:bg-lime-400"
      >
        {saving ? "Mise à jour..." : "Mettre à jour le mot de passe"}
      </Button>
    </div>
  );
}
