import { Metadata } from "next";
import ConnectClient from "./ConnectClient";

export const metadata: Metadata = {
  title: "GitGraph Console",
};

export default function Page() {
  return <ConnectClient />;
}