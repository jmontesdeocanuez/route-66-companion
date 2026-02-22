-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "dietaryRestrictions" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "phone" TEXT;
