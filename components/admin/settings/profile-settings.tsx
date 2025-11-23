"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { ImageIcon, UploadIcon, XIcon } from "lucide-react";

type Profile = {
  email: string;
  name: string | null;
  image: string | null;
  role: string;
};

export function ProfileSettings() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [original, setOriginal] = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWithAuth("/api/admin/settings");
        if (!res.ok) {
          throw new Error("Impossible de charger le profil");
        }
        const data = (await res.json()) as Profile;
        setProfile(data);
        setOriginal(data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const persistProfile = async (next: Profile) => {
    const res = await fetchWithAuth("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: next.email,
        name: next.name ?? "",
        image: next.image ?? null,
      }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw new Error(data.error ?? "Erreur lors de la mise à jour");
    }
    setOriginal(next);
    router.refresh();
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      await persistProfile(profile);
      toast.success("Profil mis à jour");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetchWithAuth("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'upload");
      }
      const uploaded = (await res.json()) as { url: string };
      if (profile) {
        const next = { ...profile, image: uploaded.url };
        setProfile(next);
        await persistProfile(next);
      }
      toast.success("Avatar mis à jour");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'upload",
      );
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-full animate-pulse rounded bg-white/5" />
        <div className="h-10 w-full animate-pulse rounded bg-white/5" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-sm text-white/60">
        Impossible de charger les informations.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={profile.email}
            onChange={(e) => {
              setProfile({ ...profile, email: e.target.value });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Nom</Label>
          <Input
            type="text"
            value={profile.name ?? ""}
            onChange={(e) => {
              setProfile({ ...profile, name: e.target.value });
            }}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Avatar</Label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10">
                {profile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.image}
                    alt={profile.name ?? profile.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-5 w-5 text-white/40" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="avatar-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              <Button
                type="button"
                onClick={() => {
                  document.getElementById("avatar-upload")?.click();
                }}
                disabled={uploading}
                variant="outline"
                className="gap-2 border-lime-300/60 text-lime-300 hover:bg-lime-300/10"
              >
                <UploadIcon className="h-4 w-4" />
                {uploading ? "Upload..." : "Uploader"}
              </Button>
              {profile.image && (
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5"
                onClick={() => {
                    const next = { ...profile, image: null };
                    setProfile(next);
                    void persistProfile(next);
                  }}
              >
                <XIcon className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
              )}
            </div>
          </div>
          <Label>Avatar (URL)</Label>
          <Input
            type="url"
            value={profile.image ?? ""}
            onChange={(e) => {
              setProfile({ ...profile, image: e.target.value });
            }}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            void handleSave();
          }}
          disabled={saving}
          className="bg-lime-300 text-black hover:bg-lime-400"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/5"
          onClick={() => {
            if (original) setProfile(original);
          }}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
