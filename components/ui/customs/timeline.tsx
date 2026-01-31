import { Calendar, Settings } from "lucide-react";

export default function Timeline({
  index,
  title,
  by,
  date,
  description,
}: {
  index: number;
  title: string;
  by: string;
  date: string;
  description: string;
}) {
  return (
    <div>
      <div className="relative ml-3 pb-8">
        {/* Timeline line */}
        <div className="absolute top-0 bottom-0 left-0 border-l-2" />
        <div className="relative pb-12 pl-8 last:pb-0" key={index}>
          {/* Timeline dot */}
          <div className="absolute top-0 left-px h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background" />
          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="font-medium text-base">{title}</span>
            </div>
            <div>
              <h3 className="font-semibold text-xl tracking-[-0.01em]">{by}</h3>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{date}</span>
              </div>
            </div>
            <p className="text-pretty text-muted-foreground text-sm sm:text-base">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
