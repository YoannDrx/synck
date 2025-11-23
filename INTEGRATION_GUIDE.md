# 🚀 GUIDE D'INTÉGRATION - Features Implémentées

## 📋 CHECKLIST PRÉ-INTÉGRATION

### 1. Migration Database (OBLIGATOIRE)
```bash
# Génère la migration
pnpm db:migrate

# Vérifie que tout est OK
pnpm db:studio
```

**Nouveaux modèles** : `AuditLog`, `WorkVersion`, `Notification`, `PreviewToken`

---

## ✅ INTÉGRATIONS RAPIDES (< 30min)

### 1. **Exports** - Déjà intégré dans `/admin/projets` ✅

Ajoutez dans les autres pages :

**`/admin/compositeurs/page.tsx`**
```tsx
import { ExportButton } from "@/components/admin/export-button";

// Dans le header
<ExportButton entity="composers" />
```

**`/admin/medias/page.tsx`**
```tsx
<ExportButton
  entity="assets"
  filters={{ ...(orphansOnly && { orphansOnly: "true" }) }}
/>
```

**`/admin/categories/page.tsx`**
```tsx
<ExportButton entity="categories" />
```

**`/admin/labels/page.tsx`**
```tsx
<ExportButton entity="labels" />
```

**`/admin/expertises/page.tsx`**
```tsx
<ExportButton entity="expertises" />
```

---

### 2. **Imports** - Dialog créé ✅

**`/admin/projets/page.tsx`**
```tsx
import { ImportDialog } from "@/components/admin/import-dialog";

// Dans le header, à côté d'ExportButton
<ImportDialog
  entity="projects"
  onSuccess={() => {
    void fetchData(); // Refresh data après import
  }}
/>
```

---

### 3. **Bulk Operations** - Toolbar créée ✅

**`/admin/projets/page.tsx`**
```tsx
import { BulkActionsToolbar } from "@/components/admin/bulk-actions-toolbar";

// Ajoutez state pour sélection
const [selectedIds, setSelectedIds] = useState<string[]>([]);

// Ajoutez checkbox "Select All"
<Checkbox
  checked={selectedIds.length === filteredWorks.length}
  onCheckedChange={(checked) => {
    if (checked) {
      setSelectedIds(filteredWorks.map(w => w.id));
    } else {
      setSelectedIds([]);
    }
  }}
/>

// Checkbox par row dans DataTable
<Checkbox
  checked={selectedIds.includes(work.id)}
  onCheckedChange={(checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, work.id]);
    } else {
      setSelectedIds(selectedIds.filter(id => id !== work.id));
    }
  }}
/>

// En bas de page
<BulkActionsToolbar
  selectedIds={selectedIds}
  onSuccess={() => {
    void fetchData();
  }}
  onClear={() => setSelectedIds([])}
/>
```

---

### 4. **Keyboard Shortcuts** - Hook créé ✅

**`/app/[locale]/admin/layout.tsx`**
```tsx
"use client";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState("fr");

  useEffect(() => {
    void params.then(p => setLocale(p.locale));
  }, [params]);

  useKeyboardShortcuts(locale);

  return <>{children}</>;
}
```

**Shortcuts disponibles** :
- `G + D` : Dashboard
- `G + P` : Projets
- `G + C` : Compositeurs
- `G + M` : Médias

---

### 5. **Notifications Bell** - Component créé ✅

**`/components/admin/layout/admin-topbar.tsx`**
```tsx
import { NotificationsBell } from "@/components/admin/notifications-bell";

// Dans la topbar
<div className="flex items-center gap-2">
  <NotificationsBell />
  {/* Autres icônes */}
</div>
```

---

### 6. **Theme Toggle** - Component créé ✅

**`/components/admin/layout/admin-topbar.tsx`**
```tsx
import { ThemeToggle } from "@/components/admin/theme-toggle";

// Dans la topbar
<div className="flex items-center gap-2">
  <ThemeToggle />
  <NotificationsBell />
</div>
```

**CSS Light Mode** - Ajoutez dans `globals.css` :
```css
html.light {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  /* Autres variables */
}

html.light body {
  background: white;
  color: black;
}
```

---

### 7. **Color Picker** - Component créé ✅

**`/components/admin/category-form.tsx`**
```tsx
import { ColorPicker } from "@/components/admin/color-picker";

// Remplacez l'input color actuel
<ColorPicker
  value={color}
  onChange={setColor}
/>
```

---

### 8. **Icon Picker** - Component créé ✅

**`/components/admin/category-form.tsx`**
```tsx
import { IconPicker } from "@/components/admin/icon-picker";

// Remplacez l'input icon actuel
<IconPicker
  value={icon}
  onChange={setIcon}
/>
```

---

### 9. **Markdown Editor** - Component créé ✅

**`/components/admin/expertises/expertise-form.tsx`**
```tsx
import { MarkdownEditor } from "@/components/admin/markdown-editor";

// Remplacez le Textarea pour contentFr et contentEn
<MarkdownEditor
  value={contentFr}
  onChange={setContentFr}
  height={500}
/>
```

---

### 10. **Duplicate Button** - Component créé ✅

**`/app/[locale]/admin/projets/[id]/page.tsx`**
```tsx
import { DuplicateButton } from "@/components/admin/duplicate-button";

// Dans la toolbar du formulaire
<DuplicateButton workId={workId} />
```

---

## 🔧 INTÉGRATIONS AVANCÉES (1-2h)

### 11. **React Query** - Provider créé ✅

Déjà intégré dans `/app/[locale]/layout.tsx` ✅

**Exemple d'utilisation** :
```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Au lieu de useEffect + fetch
const { data, isLoading } = useQuery({
  queryKey: ["projects"],
  queryFn: async () => {
    const res = await fetch("/api/admin/projects");
    return res.json();
  },
});

// Pour mutations avec cache update
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: async (id: string) => {
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
  },
  onSuccess: () => {
    void queryClient.invalidateQueries({ queryKey: ["projects"] });
  },
});
```

---

### 12. **Audit Logs** - Middleware à créer

**Wrapper withAuth avec audit log** :

Créez `/lib/api/with-audit.ts` :
```tsx
import { withAuth } from "./with-auth";
import { createAuditLog } from "@/lib/audit-log";

export function withAudit(handler: AuthenticatedHandler) {
  return withAuth(async (req, context) => {
    const result = await handler(req, context);

    // Log après succès
    if (result.status < 400 && context.user) {
      const url = new URL(req.url);
      await createAuditLog({
        userId: context.user.id,
        action: req.method,
        entityType: url.pathname.split("/")[3], // "projects", "composers", etc.
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      });
    }

    return result;
  });
}
```

**Usage** :
```tsx
import { withAudit } from "@/lib/api/with-audit";

export const DELETE = withAudit(async (req, context) => {
  // Votre code
});
```

**Page Audit Logs** :

Créez `/app/[locale]/admin/logs/page.tsx` :
```tsx
export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1>Audit Logs</h1>
      <DataTable data={logs} columns={[...]} />
    </div>
  );
}
```

---

### 13. **Versionning** - Auto-save à implémenter

**Dans `/api/admin/projects/[id]/route.ts` (PATCH)** :
```tsx
export const PATCH = withAuth(async (req, context) => {
  // ... code existant ...

  // Après update réussi
  if (context.user) {
    await prisma.workVersion.create({
      data: {
        workId: id,
        userId: context.user.id,
        snapshot: updatedWork, // Full work object
      },
    });
  }

  return NextResponse.json(updatedWork);
});
```

**Page Historique** :

Créez `/app/[locale]/admin/projets/[id]/history/page.tsx` :
```tsx
export default async function HistoryPage({ params }: { params: { id: string } }) {
  const versions = await prisma.workVersion.findMany({
    where: { workId: params.id },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1>Historique</h1>
      {versions.map(v => (
        <div key={v.id}>
          <p>{v.user.name} - {v.createdAt}</p>
          <button onClick={() => restore(v.snapshot)}>Restaurer</button>
        </div>
      ))}
    </div>
  );
}
```

---

### 14. **Scheduled Publishing** - Cron configuré ✅

**Vercel Cron** déjà configuré dans `vercel.json` ✅

**Usage dans form** :

Ajoutez field `releaseDate` dans form :
```tsx
<Input
  type="datetime-local"
  value={releaseDate}
  onChange={(e) => setReleaseDate(e.target.value)}
/>
```

**API Update** :
```tsx
data: {
  releaseDate: releaseDate,
  status: releaseDate > new Date() ? "scheduled" : "completed",
}
```

---

## 🎨 STYLE & RESPONSIVE

### 15. **Mobile DataTable**

Créez `/components/admin/data-table/mobile-card.tsx` :
```tsx
export function MobileCard({ item }: { item: Work }) {
  return (
    <div className="rounded-lg border p-4 md:hidden">
      <h3 className="font-semibold">{item.titleFr}</h3>
      <p className="text-sm text-white/70">{item.category.nameFr}</p>
      <div className="mt-2 flex gap-2">
        <Button size="sm">Éditer</Button>
        <Button size="sm" variant="destructive">Supprimer</Button>
      </div>
    </div>
  );
}
```

**Usage** :
```tsx
{/* Desktop */}
<div className="hidden md:block">
  <DataTable data={works} columns={columns} />
</div>

{/* Mobile */}
<div className="md:hidden space-y-2">
  {works.map(work => <MobileCard key={work.id} item={work} />)}
</div>
```

---

## 🔐 SÉCURITÉ

### 16. **Rate Limiting**

**Usage dans API routes** :
```tsx
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(ip, 10, 15 * 60 * 1000);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // ... suite
}
```

---

### 17. **2FA Setup**

Créez `/app/[locale]/admin/settings/security/page.tsx` :
```tsx
import { generate2FASecret } from "@/lib/2fa";

export default function SecurityPage() {
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const enablesyncFA = async () => {
    const result = await generate2FASecret(user.email);
    setQrCode(result.qrCode);
    setBackupCodes(result.backupCodes);
  };

  return (
    <div>
      <h1>Sécurité</h1>
      <button onClick={enable2FA}>Activer 2FA</button>
      {qrCode && <img src={qrCode} alt="QR Code" />}
      {backupCodes.map(code => <code key={code}>{code}</code>)}
    </div>
  );
}
```

---

## 📊 DASHBOARD EXTENSIONS

### 18. **Filtres Temporels**

**`/app/[locale]/admin/page.tsx`**
```tsx
const [period, setPeriod] = useState<"7d" | "30d" | "6m" | "1y">("30d");

<Select value={period} onValueChange={setPeriod}>
  <SelectItem value="7d">7 jours</SelectItem>
  <SelectItem value="30d">30 jours</SelectItem>
  <SelectItem value="6m">6 mois</SelectItem>
  <SelectItem value="1y">1 an</SelectItem>
</Select>
```

**API Analytics** :
```tsx
const dateFrom = {
  "7d": subDays(new Date(), 7),
  "30d": subDays(new Date(), 30),
  "6m": subMonths(new Date(), 6),
  "1y": subYears(new Date(), 1),
}[period];

const works = await prisma.work.findMany({
  where: { createdAt: { gte: dateFrom } },
});
```

---

## 🎯 WEBHOOKS

### 19. **Discord Notifications**

**`.env.local`** :
```env
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

**Usage** :
```tsx
import { sendDiscordNotification } from "@/lib/webhooks";

// Après création projet
await sendDiscordNotification(
  `✅ Nouveau projet publié : **${work.titleFr}**`
);
```

---

## ✅ COMMANDES UTILES

```bash
# Migration DB
pnpm db:migrate

# Prisma Studio
pnpm db:studio

# Dev
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Tests
pnpm test
```

---

## 🎉 RÉSULTAT FINAL

Après toutes les intégrations, vous aurez :

✅ **Exports** : 6 entités × 4 formats
✅ **Imports** : Validation + Preview
✅ **Bulk** : 5 actions multiples
✅ **Quick Wins** : Duplicate, Shortcuts, Tooltips
✅ **UI Advanced** : ColorPicker, IconPicker, MarkdownEditor
✅ **Security** : 2FA, Rate limiting, Audit logs
✅ **Features** : Scheduled, Versionning, Notifications
✅ **UX** : Dark mode, Mobile, React Query
✅ **Webhooks** : Discord/Slack

**Temps d'intégration total : 3-5h**
**Fonctionnalités ajoutées : 40+**

🚀 **Votre panel admin sera au niveau ENTERPRISE !**
