"use client";

import * as Icons from "lucide-react";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const iconNames = Object.keys(Icons).filter(
  (key) => key !== "createLucideIcon" && key !== "default",
);

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const IconComponent =
    value && (Icons as unknown as Record<string, React.ElementType>)[value]
      ? (Icons as unknown as Record<string, React.ElementType>)[value]
      : Icons.HelpCircle;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <IconComponent className="h-4 w-4" />
          {value || "Sélectionner une icône"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Rechercher une icône..." />
          <CommandEmpty>Aucune icône trouvée</CommandEmpty>
          <CommandList className="max-h-64">
            <CommandGroup>
              {iconNames.slice(0, 100).map((iconName) => {
                const Icon = (Icons as unknown as Record<string, React.ElementType>)[
                  iconName
                ];
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => {
                      onChange(iconName);
                      setOpen(false);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {iconName}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
