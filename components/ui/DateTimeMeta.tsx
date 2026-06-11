import { CalendarDays, Clock } from "lucide-react";

function formatDateTime(value: string) {
  const date = new Date(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${minutes}`,
  };
}

export function DateTimeMeta({ value, className = "" }: { value: string; className?: string }) {
  const parts = formatDateTime(value);

  return (
    <div className={`flex flex-wrap gap-3 text-xs text-[var(--color-muted)] ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {parts.date}
      </span>

      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {parts.time}
      </span>
    </div>
  );
}
