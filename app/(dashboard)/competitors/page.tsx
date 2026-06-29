import { redirect } from "next/navigation";

// Competitors are listed in the sidebar — the main content defaults to the global feed.
export default function CompetitorsPage() {
  redirect("/feed");
}
