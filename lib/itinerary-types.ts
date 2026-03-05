import type { Flight, Hotel, Stop, Excursion } from "@/app/generated/prisma/client";

export type ItineraryItemType = "flight" | "hotel" | "stop" | "excursion" | "note";

export interface ItineraryItemData {
  id: string;
  date: Date | string;
  sortOrder: number;
  completed: boolean;
  type: string;
  noteText: string | null;
  flightId: string | null;
  hotelId: string | null;
  stopId: string | null;
  excursionId: string | null;
  flight: Flight | null;
  hotel: Hotel | null;
  stop: Stop | null;
  excursion: Excursion | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
