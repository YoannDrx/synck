"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts(locale = "fr") {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        // TODO: Show shortcuts help modal
        return;
      }

      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        const secondKey = new Promise<string>((resolve) => {
          const handler = (ev: KeyboardEvent) => {
            window.removeEventListener("keydown", handler);
            resolve(ev.key);
          };
          window.addEventListener("keydown", handler);
          setTimeout(() => {
            window.removeEventListener("keydown", handler);
            resolve("");
          }, 1000);
        });

        void secondKey.then((key) => {
          switch (key) {
            case "d":
              router.push(`/${locale}/admin`);
              break;
            case "p":
              router.push(`/${locale}/admin/projets`);
              break;
            case "c":
              router.push(`/${locale}/admin/compositeurs`);
              break;
            case "m":
              router.push(`/${locale}/admin/medias`);
              break;
          }
        });
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => { window.removeEventListener("keydown", handleKeyPress); };
  }, [router, locale]);
}
