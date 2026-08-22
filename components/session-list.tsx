import { Session } from "@/lib/types";
import SessionCard from "./session-card";

export default async function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-card-foreground">{sessions.length} Results</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </div >
  )
}
