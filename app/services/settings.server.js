import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get settings from the database
 * Creates default settings if none exist using upsert
 */



export async function getSettings() {
  return await prisma.settings.upsert({
    where: {
      id: 1 // Using id: 1 since we only need one settings record
    },
    update: {}, // No updates needed when fetching
    create: {
      otpEnabled: false,
      currentPastDPercentage: 80.0,
      allowedFileFormats: ".csv,.xlsx"
    }
  });
}

/**
 * Update OTP enabled status using upsert
 */
export async function updateOTPEnabled(enabled) {
  return await prisma.settings.upsert({
    where: {
      id: 1
    },
    update: {
      otpEnabled: enabled
    },
    create: {
      otpEnabled: enabled,
      currentPastDPercentage: 80.0,
      allowedFileFormats: ".csv,.xlsx"
    }
  });
}
