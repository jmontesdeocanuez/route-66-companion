-- AlterTable
ALTER TABLE "ItineraryItem" ADD COLUMN     "excursionId" TEXT;

-- AddForeignKey
ALTER TABLE "ItineraryItem" ADD CONSTRAINT "ItineraryItem_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "Excursion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
