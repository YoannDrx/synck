import QRCode from "qrcode";
import { authenticator } from "otplib";

export async function generate2FASecret(email: string): Promise<{
  secret: string;
  qrCode: string;
  backupCodes: string[];
}> {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(email, "Caroline Senyk Admin", secret);
  const qrCode = await QRCode.toDataURL(otpauth);
  const backupCodes = Array.from({ length: 10 }, () =>
    Math.random().toString(36).substring(2, 10).toUpperCase(),
  );

  return { secret, qrCode, backupCodes };
}

export function verify2FAToken(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export function verifyBackupCode(
  code: string,
  backupCodes: string[],
): { valid: boolean; remainingCodes: string[] } {
  const index = backupCodes.indexOf(code.toUpperCase());
  if (index === -1) {
    return { valid: false, remainingCodes: backupCodes };
  }

  const remainingCodes = backupCodes.filter((_, i) => i !== index);
  return { valid: true, remainingCodes };
}
