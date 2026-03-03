/*
  Warnings:

  - You are about to drop the column `confirmationCode` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerPerson` on the `Flight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Flight" DROP COLUMN "confirmationCode",
DROP COLUMN "pricePerPerson";
