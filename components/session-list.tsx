import { Session } from "@/lib/types";
import SessionCard from "./session-card";

export default async function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div className="space-y-4">
      {sessions.map((s) => (
        <SessionCard key={s.id} session={s} />
      ))}
    </div>
  )
}
