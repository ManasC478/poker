import { addTag, removeTag, updateSessionMeta } from "@/lib/actions"
import { SessionDetail } from "@/lib/types"
import { Clock, Loader2, MapPin, Plus, Tag, X } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { Badge } from "./ui/badge"

export type SessionMetaFormProps = {
  session: SessionDetail
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  pending: boolean,
  startTransition: React.TransitionStartFunction,
}

export default function SessionMetaForm({ session, setError, pending, startTransition }: SessionMetaFormProps) {
  const router = useRouter()
  const [metaDirty, setMetaDirty] = useState(false)
  const [location, setLocation] = useState(session.location ?? "")
  const [startTime, setStartTime] = useState(session.start_time)
  const [notes, setNotes] = useState(session.notes ?? "")
  const [newTag, setNewTag] = useState("")
  const [tags, setTags] = useState(session.tags)

  function saveMeta() {
    setError(null)

    const currentTags = new Set(session.tags)
    const newTags = new Set(tags)
    const tagsToAdd = newTags.difference(currentTags)
    const tagsToRemove = currentTags.difference(newTags)

    startTransition(async () => {
      const res = await updateSessionMeta({
        id: session.id,
        location: location.trim() || null,
        notes: notes.trim() || null,
        start_time: startTime.trim()
      })
      const addRes = await addTag(Array.from(tagsToAdd), session.id)
      const removeRes = await removeTag(Array.from(tagsToRemove), session.id)
      if (res.error) setError(res.error)
      else if (addRes.error) setError(addRes.error)
      else if (removeRes.error) setError(removeRes.error)
      else {
        setMetaDirty(false)
        router.refresh()
      }
    })
  }

  return (

    <section className="mb-8 space-y-4 rounded-2xl border border-border bg-card p-5">
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <MapPin className="size-4 text-muted-foreground" /> Location
        </span>
        <input
          value={location}
          onChange={(e) => {
            setLocation(e.target.value)
            setMetaDirty(true)
          }}
          placeholder="e.g. Mike's basement"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Clock className="size-4 text-muted-foreground" /> Start time
        </span>
        <input
          type="time"
          value={startTime}
          onChange={(e) => {
            setStartTime(e.target.value)
            setMetaDirty(true)
          }}
          placeholder="e.g. Mike's basement"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Tag className="size-4 text-muted-foreground" /> Tags
        </span>
        <div className="flex items-center gap-2">
          <input
            value={newTag}
            onChange={(e) => {
              setNewTag(e.target.value)
            }}
            placeholder="Full House"
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
          />
          <Button
            onClick={() => {
              const existing = tags.find(t => t === newTag)
              if (existing) {
                setError("Tag already exists")
                return
              }
              setTags([...tags, newTag])
              setMetaDirty(true)
              setNewTag("")
            }}
            size="icon-lg"
            variant="outline"
            disabled={pending}
          >
            <Plus />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {tags.map((t) => (
            <Badge
              key={t}
            >
              {t}
              <button
                onClick={() => {
                  setTags((prev) => {
                    setMetaDirty(true)
                    return prev.filter(tag => tag !== t)
                  })
                }}
              >
                <X className="size-4" />
              </button>
            </Badge>
          ))}
        </div>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value)
            setMetaDirty(true)
          }}
          placeholder="e.g. $1/$2 NLH"
          className="h-20 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </label>
      {
        metaDirty && (
          <Button size="sm" onClick={saveMeta} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Save details"}
          </Button>
        )
      }
    </section >
  )
}
