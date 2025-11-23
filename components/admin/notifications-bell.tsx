"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          notifications: Notification[];
          unreadCount: number;
        };
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Silent fail
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
        credentials: "include",
      });
      void fetchNotifications();
    } catch {
      // Silent fail
    }
  };

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000); // Poll every 30s
    return () => { clearInterval(interval); };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-lime-300 p-0 text-xs text-black">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0">
        <div className="border-b border-white/20 p-4">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-white/50">
              Aucune notification
            </p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`border-b border-white/10 p-4 hover:bg-white/5 ${!notif.read ? "bg-lime-300/10" : ""}`}
                onClick={() => {
                  if (!notif.read) void markAsRead([notif.id]);
                }}
              >
                <h4 className="text-sm font-medium">{notif.title}</h4>
                <p className="mt-1 text-xs text-white/70">{notif.message}</p>
                <p className="mt-2 text-xs text-white/50">
                  {new Date(notif.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
