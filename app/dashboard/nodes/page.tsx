import { Metadata } from "next";
import NodeManagerClient from "./NodeManagerClient";

export const metadata: Metadata = {
  title: "GitGraph Console",
};

export default function NodeManagerPage() {
  return <NodeManagerClient />;
}