import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const travelers = [
  { name: "Alvaro Deniz Santana", displayName: "Álvaro", email: "alvaro@example.com", isAdmin: false },
  { name: "Benjamin Francisco Davila Rodriguez", displayName: "Benjamín", email: "benjamin@example.com", isAdmin: false },
  { name: "Irene Del Mar Dominguez Cabrera", displayName: "Irene", email: "irene@example.com", isAdmin: false },
  { name: "Iris Garcia Montesdeoca", displayName: "Iris", email: "iris@example.com", isAdmin: false },
  { name: "Juan Francisco Montesdeoca Nuez", displayName: "Jofra", email: "juan@example.com", isAdmin: true },
  { name: "Nestor Manuel Lopez Perez", displayName: "Néstor", email: "nestor@example.com", isAdmin: false },
  { name: "Paula Maria Montesdeoca Quintana", displayName: "Paula", email: "paula@example.com", isAdmin: false },
];

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 12);

  for (const traveler of travelers) {
    const user = await prisma.user.upsert({
      where: { email: traveler.email },
      update: { name: traveler.name, displayName: traveler.displayName, isAdmin: traveler.isAdmin },
      create: { ...traveler, password: hashedPassword, mustChangePassword: false },
    });
    console.log("Seeded user:", user.email, `(${user.displayName})`);
  }

  const tripConfig = await prisma.tripConfig.upsert({
    where: { key: "default" },
    update: {},
    create: {
      key: "default",
      startDate: new Date("2026-03-20T00:00:00"),
      endDate: new Date("2026-04-08T00:00:00"),
    },
  });

  console.log("Seeded trip config:", tripConfig.key, tripConfig.startDate, "→", tripConfig.endDate);

  await prisma.hotel.deleteMany();

  const hotels = await prisma.hotel.createMany({
    data: [
      {
        id: "hotel-hostelfly-20260320",
        name: "Hostelfly",
        city: "Madrid",
        boardPlan: "ROOM_ONLY",
        rooms: 1,
        roomType: "Habitación 8 camas",
        checkIn: new Date("2026-03-20"),
        nights: 1,
        imageUrl: "https://media-cdn.tripadvisor.com/media/photo-s/2c/a3/32/ba/hostelfly-entrance.jpg",
      },
      {
        name: "Warwick Allerton Chicago",
        city: "Chicago",
        boardPlan: "Solo alojamiento",
        rooms: 4,
        roomType: "Habitación doble 1 cama",
        checkIn: new Date("2026-03-21"),
        nights: 2,
        imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/06/a4/c5/f3/historic-hotel.jpg?w=900&h=-1&s=1",
        resortFeePerRoomPerNight: 30,
      },
      {
        name: "La Quinta Inn & Suites by Wyndham St Louis Route 66",
        city: "Saint Louis",
        boardPlan: "Alojamiento y desayuno",
        rooms: 4,
        roomType: "1 King Bed Non-Smoking",
        checkIn: new Date("2026-03-23"),
        nights: 1,
        imageUrl: "https://www.wyndhamhotels.com/content/dam/property-images/en-us/lq/us/mo/st-louis/53782/53782_exterior_view_4.jpg",
      },
      {
        name: "Baymont by Wyndham Springfield I-44",
        city: "Springfield (MO)",
        boardPlan: "Alojamiento y desayuno",
        rooms: 4,
        roomType: "1 King Bed Non-Smoking",
        checkIn: new Date("2026-03-24"),
        nights: 1,
        imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max500/288865511.jpg?k=78441f9b3667ee6ca59dd90402d4d869d8539edd030529250aee54af5d396b30&o=&hp=1",
      },
      {
        name: "Super 8 Oklahoma City",
        city: "Oklahoma City",
        boardPlan: "Alojamiento y desayuno",
        rooms: 4,
        roomType: "1 King Bed Non-Smoking",
        checkIn: new Date("2026-03-25"),
        nights: 1,
        imageUrl: "https://www.wyndhamhotels.com/content/dam/property-images/en-us/se/us/ok/oklahoma-city/14851/14851_exterior_view_2.jpg?downsize=720:*",
      },
      {
        name: "Microtel Inn & Suites by Wyndham Amarillo",
        city: "Amarillo",
        boardPlan: "Alojamiento y desayuno",
        rooms: 4,
        roomType: "2 Queen Beds Non-Smoking",
        checkIn: new Date("2026-03-26"),
        nights: 1,
        imageUrl: "https://www.wyndhamhotels.com/content/dam/property-images/en-us/mt/us/tx/amarillo/29278/29278_exterior_day_1.jpg",
      },
      {
        name: "Super 8 by Wyndham Albuquerque Downtown Area",
        city: "Albuquerque",
        boardPlan: "Alojamiento y desayuno",
        rooms: 4,
        roomType: "King Bed Non-Smoking",
        checkIn: new Date("2026-03-27"),
        nights: 1,
        imageUrl: "https://www.wyndhamhotels.com/content/dam/property-images/en-us/se/us/nm/albuquerque/59222/59222_exterior_view_1.jpg?downsize=720:*",
      },
      {
        name: "Holiday Inn Resort The Squire at Grand Canyon",
        city: "Grand Canyon",
        boardPlan: "Solo alojamiento",
        rooms: 4,
        roomType: "2 Queen Standard",
        checkIn: new Date("2026-03-28"),
        nights: 2,
        imageUrl: "https://digital.ihg.com/is/image/ihg/holiday-inn-resort-grand-canyon-village-10244493375-2x1",
        resortFeePerRoomPerNight: 25,
      },
      {
        name: "Gouldings Lodge",
        city: "Monument Valley",
        boardPlan: "Solo alojamiento",
        rooms: 4,
        roomType: "Habitación con vistas",
        checkIn: new Date("2026-03-30"),
        nights: 1,
        imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/432653189.jpg?k=d84e6ef311e938214dad4045d56202efe37cec2b58a8124aeb7c4a33844d8ef1&o=",
      },
      {
        name: "Super 8 by Wyndham Page/Lake Powell",
        city: "Page",
        boardPlan: "Alojamiento y desayuno",
        rooms: 4,
        roomType: "2 Queen Beds Non-Smoking",
        checkIn: new Date("2026-03-31"),
        nights: 1,
        imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/137131230.jpg?k=27885fb9a5d16c06f44974289cfc2d2e9d20526a616d651e732fd8179e8f5053&o=",
      },
      {
        name: "Bumbleberry Inn",
        city: "Springdale",
        boardPlan: "Alojamiento y desayuno",
        rooms: 4,
        roomType: "Doble Economy",
        checkIn: new Date("2026-04-01"),
        nights: 1,
        imageUrl: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/207883556.jpg?k=92dc144c3d06e7c0fbbfc654632b5224912c96a869edc0d0bd1ed4318fdd3470&o=",
      },
      {
        name: "Paris Las Vegas Casino Resort",
        city: "Las Vegas",
        boardPlan: "Solo alojamiento",
        rooms: 4,
        roomType: "Room type assigned on arrival",
        checkIn: new Date("2026-04-02"),
        nights: 2,
        imageUrl: "https://images.trvl-media.com/lodging/1000000/210000/200800/200710/c9e8bc65.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill",
        resortFeePerRoomPerNight: 55,
      },
      {
        name: "Hollywood Historic Hotel",
        city: "Los Angeles",
        boardPlan: "Solo alojamiento",
        rooms: 4,
        roomType: "Double Deluxe cama Queen Size",
        checkIn: new Date("2026-04-04"),
        nights: 3,
        imageUrl: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/01/e8/ec/exterior-of-hotel.jpg?w=900&h=-1&s=1",
      },
    ],
  });

  console.log(`Seeded ${hotels.count} hotels`);

  await prisma.flight.deleteMany();

  const flights = await prisma.flight.createMany({
    data: [
      {
        id: "flight-lpa-mad-20260320",
        airline: "Binter",
        flightNumber: "NT6014",
        flightIata: "NT6014",
        originCode: "LPA",
        originCity: "Gran Canaria",
        originCountry: "España",
        destinationCode: "MAD",
        destinationCity: "Madrid",
        destinationCountry: "España",
        departureDate: "2026-03-20",
        departureTime: "19:05",
        arrivalDate: "2026-03-20",
        arrivalTime: "22:45",
        duration: "2h 40m",
        cabinClass: "Turista",
        passengers: 7,
        sortOrder: 0,
      },
      {
        id: "flight-mad-ord-20260321",
        airline: "Iberia",
        flightNumber: "IB341",
        flightIata: "IB341",
        originCode: "MAD",
        originCity: "Madrid",
        originCountry: "España",
        destinationCode: "ORD",
        destinationCity: "Chicago",
        destinationCountry: "Estados Unidos",
        departureDate: "2026-03-21",
        departureTime: "11:35",
        arrivalDate: "2026-03-21",
        arrivalTime: "15:30",
        duration: "9h 55m",
        cabinClass: "Turista",
        passengers: 7,
        sortOrder: 1,
      },
      {
        id: "flight-lax-mad-20260407",
        airline: "American Airlines (operado por Iberia)",
        flightNumber: "IB352",
        flightIata: "IB352",
        originCode: "LAX",
        originCity: "Los Angeles",
        originCountry: "Estados Unidos",
        destinationCode: "MAD",
        destinationCity: "Madrid",
        destinationCountry: "España",
        departureDate: "2026-04-07",
        departureTime: "17:50",
        arrivalDate: "2026-04-08",
        arrivalTime: "13:50",
        duration: "11h",
        cabinClass: "Turista",
        passengers: 7,
        sortOrder: 2,
      },
      {
        id: "flight-mad-lpa-20260408",
        airline: "Iberia Express",
        flightNumber: "I21625",
        flightIata: "I21625",
        originCode: "MAD",
        originCity: "Madrid",
        originCountry: "España",
        destinationCode: "LPA",
        destinationCity: "Gran Canaria",
        destinationCountry: "España",
        departureDate: "2026-04-08",
        departureTime: "18:35",
        arrivalDate: "2026-04-08",
        arrivalTime: "20:25",
        duration: "2h 50m",
        cabinClass: "Turista",
        passengers: 7,
        sortOrder: 3,
      },
    ],
  });

  console.log(`Seeded ${flights.count} flights`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
