import { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "GitGraph Console",
};

export default function Page() {
  return <DashboardClient />;
}