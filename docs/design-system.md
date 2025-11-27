# Design System Synck

## Couleur signature

**Neon Yellow**: `#D5FF0A` (`var(--brand-neon)`)

## Tokens CSS

### Couleurs Brand

```css
--brand-neon: #d5ff0a /* Couleur principale */ --brand-green: #5ce462 --brand-emerald: #00c18b
  --brand-teal: #009998 --brand-ocean: #006f84 --brand-slate: #2f4858;
```

### Echelles

```css
--neon-50 à --neon-950     /* Nuances neon */
--teal-50 à --teal-950     /* Nuances teal */
--neutral-0 à --neutral-950 /* Gris */
```

### Couleurs semantiques

```css
--color-background         /* Fond principal */
--color-surface            /* Surfaces elevees */
--color-text-primary       /* Texte principal */
--color-text-secondary     /* Texte secondaire */
--color-text-muted         /* Texte attenue */
--color-border             /* Bordures */
--color-border-subtle      /* Bordures subtiles */
```

### Utilitaires

```css
--radius-sm, -md, -lg, -xl /* Border radius */
--shadow-sm, -md, -lg      /* Ombres */
--shadow-glow-neon         /* Glow neon */
--gradient-brand-short     /* Gradient neon → emerald */
```

## Regles d'utilisation

### TOUJOURS utiliser

```tsx
// Couleurs brand
className = 'text-[var(--brand-neon)]'
className = 'bg-[var(--brand-emerald)]'

// Couleurs texte
className = 'text-[var(--color-text-primary)]'
className = 'text-[var(--color-text-secondary)]'

// Bordures
className = 'border-[var(--color-border)]'
```

### JAMAIS utiliser

```tsx
// Couleurs Tailwind directes
className = 'text-lime-300' // NON
className = 'bg-emerald-400' // NON
className = 'text-white' // NON (sauf exceptions)
className = 'border-white/25' // NON
```

## Composants UI (shadcn/ui)

Style: **New York**

### Disponibles

- Button, Input, Textarea, Label
- Select, Checkbox, Switch
- Card, Table, Scroll Area
- Dialog, Alert Dialog, Popover
- Dropdown Menu, Tabs, Accordion
- Badge, Sonner (toast)
- Command (search)

### Pattern CVA

```tsx
import { cva } from 'class-variance-authority'

const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'bg-[var(--brand-neon)] ...',
      secondary: 'bg-[var(--brand-emerald)] ...',
    },
  },
})
```

## Theme clair/sombre

```css
:root,
[data-theme='dark'] {
  /* Theme sombre (defaut) */
}
[data-theme='light'] {
  /* Theme clair */
}
```

## Animations

Framework: **Framer Motion 12**

```tsx
import { motion } from 'framer-motion'

;<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
/>
```
