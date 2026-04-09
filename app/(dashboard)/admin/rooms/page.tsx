import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllRooms } from "@/lib/queries";
import { PageIntro } from "../../_components/page-intro";
import { RoomManager } from "./_components/room-manager";

export default async function AdminRoomsPage() {
  const session = await auth();

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <main className="grid gap-6">
      <PageIntro
        eyebrow="Admin"
        title="Room inventory"
        description="Add, edit, and deactivate spaces while keeping the palette and capacity details organized."
      />
      <RoomManager rooms={getAllRooms()} />
    </main>
  );
}
