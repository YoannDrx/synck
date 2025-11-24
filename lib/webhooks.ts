import { logger } from "@/lib/logger";

type WebhookEvent = {
  type: "PROJECT_PUBLISHED" | "PROJECT_DELETED" | "ASSET_ORPHANED";
  data: Record<string, unknown>;
  timestamp: string;
};

export async function sendWebhook(event: WebhookEvent): Promise<void> {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch (error) {
    logger.warn("Webhook call failed", error);
  }
}

export async function sendDiscordNotification(message: string): Promise<void> {
  const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
  if (!discordWebhook) return;

  try {
    await fetch(discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch (error) {
    logger.warn("Discord webhook failed", error);
  }
}
