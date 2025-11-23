import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/with-auth";
import * as OTPAuth from "otplib";
import * as QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

// Configure TOTP
OTPAuth.authenticator.options = {
  window: 1, // Accept tokens from 30s before/after
};

// GET /api/admin/auth/2fa - Generate 2FA secret and QR code
export const GET = withAuth(async (_request, _context, user) => {
  try {
    // Generate secret
    const secret = OTPAuth.authenticator.generateSecret();

    // Generate OTP auth URL
    const otpauth = OTPAuth.authenticator.keyuri(
      user.email,
      "Caroline Senyk Admin",
      secret,
    );

    // Generate QR code data URL
    const qrCode = await QRCode.toDataURL(otpauth);

    return NextResponse.json({
      secret,
      qrCode,
      otpauth,
    });
  } catch (error) {
    console.error("Error generating 2FA:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA" },
      { status: 500 },
    );
  }
});

// POST /api/admin/auth/2fa/enable - Enable 2FA
export const POST = withAuth(async (request, _context, user) => {
  try {
    const body = (await request.json()) as {
      secret: string;
      token: string;
    };
    const { secret, token } = body;

    // Verify token
    const isValid = OTPAuth.authenticator.verify({
      token,
      secret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 },
      );
    }

    // Save secret to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("Error enabling 2FA:", error);
    return NextResponse.json(
      { error: "Failed to enable 2FA" },
      { status: 500 },
    );
  }
});

// DELETE /api/admin/auth/2fa - Disable 2FA
export const DELETE = withAuth(async (_request, _context, user) => {
  try {
    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return NextResponse.json(
      { error: "Failed to disable 2FA" },
      { status: 500 },
    );
  }
});
