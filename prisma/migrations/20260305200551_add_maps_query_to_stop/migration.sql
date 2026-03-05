-- AlterTable
ALTER TABLE "Excursion" ALTER COLUMN "details" DROP DEFAULT,
ALTER COLUMN "notes" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Stop" ADD COLUMN     "mapsQuery" TEXT;
