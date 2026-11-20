// Display metadata shared by the Inbox components (labels, icons, colors).
import { faEnvelopeOutline, faLinkedinBrand, faPhoneOutline, faHeartOutline } from "@l3mpire/icons";
import { faWhatsappBrand, faSmsOutline, faHeartCrackOutline, faCircleQuestionOutline } from "../icons";
import type { Channel, Interest, MessageSource } from "../types";

export const CHANNEL_META: Record<Channel, { label: string; icon: string; color: string }> = {
  email: { label: "Email", icon: faEnvelopeOutline, color: "var(--core-text-specific-tags-blue)" },
  linkedin: { label: "LinkedIn", icon: faLinkedinBrand, color: "var(--core-bg-specific-brands-logo-linkedin)" },
  whatsapp: { label: "WhatsApp", icon: faWhatsappBrand, color: "var(--core-text-specific-tags-green)" },
  sms: { label: "SMS", icon: faSmsOutline, color: "var(--core-text-specific-tags-pink)" },
  call: { label: "Call", icon: faPhoneOutline, color: "var(--core-text-specific-tags-orange)" },
};

export const INTEREST_META: Record<Interest, { label: string; pill: "success" | "critical" | "neutral"; icon: string; key: string }> = {
  interested: { label: "Interested", pill: "success", icon: faHeartOutline, key: "I" },
  not_interested: { label: "Not interested", pill: "critical", icon: faHeartCrackOutline, key: "N" },
  neutral: { label: "Neutral", pill: "neutral", icon: faCircleQuestionOutline, key: "U" },
};

export const SOURCE_LABEL: Record<MessageSource, string> = {
  campaign: "Campaign",
  manual: "Sent from lemlist",
  external: "Logged from",
};

export function sourceLabel(source: MessageSource, channel: Channel, direction: "in" | "out"): string {
  if (source !== "external") return SOURCE_LABEL[source];
  const where = channel === "email" ? "Gmail" : CHANNEL_META[channel].label;
  return direction === "out" ? `Sent from ${where}` : `Logged from ${where}`;
}

export const kbd = "inline-flex items-center justify-center min-w-5 h-5 px-xs rounded-xs border border-[var(--core-border-main-primary)] bg-[var(--core-bg-main-secondary)] text-xs leading-xs text-[var(--core-text-main-secondary)]";
