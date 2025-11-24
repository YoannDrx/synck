export type Severity = "error" | "warning" | "info";

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "error":
      return "red";
    case "warning":
      return "orange";
    case "info":
      return "blue";
    default:
      return "gray";
  }
}

export function getSeverityBorderColor(severity: Severity): string {
  switch (severity) {
    case "error":
      return "border-red-500/20";
    case "warning":
      return "border-orange-500/20";
    case "info":
      return "border-blue-500/20";
    default:
      return "border-white/10";
  }
}

export function getSeverityBadgeColor(severity: Severity): string {
  switch (severity) {
    case "error":
      return "bg-red-500/20 text-red-400";
    case "warning":
      return "bg-orange-500/20 text-orange-400";
    case "info":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-white/10 text-white";
  }
}

export function getSeverityIconColor(severity: Severity): string {
  switch (severity) {
    case "error":
      return "text-red-400";
    case "warning":
      return "text-orange-400";
    case "info":
      return "text-blue-400";
    default:
      return "text-white/50";
  }
}

export function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case "error":
      return "Erreur";
    case "warning":
      return "Attention";
    case "info":
      return "Info";
    default:
      return "Unknown";
  }
}
