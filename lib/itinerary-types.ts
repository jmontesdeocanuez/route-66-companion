import type { Flight, Hotel, Stop } from "@/app/generated/prisma/client";

export type ItineraryItemType = "flight" | "hotel" | "stop";

export interface ItineraryItemData {
  id: string;
  date: Date | string;
  sortOrder: number;
  completed: boolean;
  type: string;
  flightId: string | null;
  hotelId: string | null;
  stopId: string | null;
  flight: Flight | null;
  hotel: Hotel | null;
  stop: Stop | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
