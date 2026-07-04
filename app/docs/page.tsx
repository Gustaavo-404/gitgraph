import type { Metadata } from "next";
import DocsPageClient from "./DocsPageClient";

export const metadata: Metadata = {
  title: "GitGraph Docs",
};

export default function DocsPage() {
  return <DocsPageClient />;
}