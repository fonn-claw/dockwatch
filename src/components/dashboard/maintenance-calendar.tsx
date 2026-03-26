"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface CalendarEntry {
  date: Date;
  status: "overdue" | "due_soon" | "on_track";
  scheduleName: string;
}

interface MaintenanceCalendarProps {
  data: CalendarEntry[];
}

const STATUS_DOT: Record<string, string> = {
  overdue: "bg-red-500",
  due_soon: "bg-yellow-500",
  on_track: "bg-green-500",
};

const STATUS_LABEL: Record<string, string> = {
  overdue: "Overdue",
  due_soon: "Due Soon",
  on_track: "On Track",
};

export function MaintenanceCalendar({ data }: MaintenanceCalendarProps) {
  const [month, setMonth] = useState(new Date());

  // Group entries by date string for modifiers
  const { overdueDates, dueSoonDates, onTrackDates } = useMemo(() => {
    const overdue: Date[] = [];
    const dueSoon: Date[] = [];
    const onTrack: Date[] = [];

    for (const entry of data) {
      const d = new Date(entry.date);
      if (entry.status === "overdue") overdue.push(d);
      else if (entry.status === "due_soon") dueSoon.push(d);
      else onTrack.push(d);
    }

    return { overdueDates: overdue, dueSoonDates: dueSoon, onTrackDates: onTrack };
  }, [data]);

  // Compact list for mobile
  const upcomingItems = useMemo(() => {
    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return data
      .filter((d) => {
        const date = new Date(d.date);
        return date <= sevenDays;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 7);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Upcoming Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: Calendar */}
        <div className="hidden sm:block">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            modifiers={{
              overdue: overdueDates,
              dueSoon: dueSoonDates,
              onTrack: onTrackDates,
            }}
            modifiersClassNames={{
              overdue: "calendar-dot-red",
              dueSoon: "calendar-dot-yellow",
              onTrack: "calendar-dot-green",
            }}
          />
          <style>{`
            .calendar-dot-red button::after,
            .calendar-dot-yellow button::after,
            .calendar-dot-green button::after {
              content: '';
              position: absolute;
              bottom: 2px;
              left: 50%;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              border-radius: 50%;
            }
            .calendar-dot-red button::after { background-color: #ef4444; }
            .calendar-dot-yellow button::after { background-color: #eab308; }
            .calendar-dot-green button::after { background-color: #22c55e; }
          `}</style>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Overdue
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" /> Due Soon
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" /> On Track
            </span>
          </div>
        </div>

        {/* Mobile: Compact list */}
        <div className="block sm:hidden">
          {upcomingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming maintenance</p>
          ) : (
            <ul className="space-y-2">
              {upcomingItems.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[item.status]}`} />
                  <span className="truncate font-medium">{item.scheduleName}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {format(new Date(item.date), "MMM d")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
