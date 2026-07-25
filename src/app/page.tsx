import type { Metadata } from "next";
import LandingPage from "./LandingPage";

export const metadata: Metadata = {
  title: "Carwaj — Car wash operations, handled",
  description:
    "Schedules, cleaners, clients and payments for car washing companies in the UAE. Clients stay updated on WhatsApp. One app, no spreadsheets.",
};

export default function Home() {
  return <LandingPage />;
}
