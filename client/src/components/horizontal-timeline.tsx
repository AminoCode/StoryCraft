import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { TimelineEvent } from "@shared/schema";

interface HorizontalTimelineProps {
  projectId: string;
}

export default function HorizontalTimeline({ projectId }: HorizontalTimelineProps) {
  const { data: timeline = [], isLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/projects", projectId, "timeline"],
  });

  if (isLoading) {
    return (
      <div className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse border" />
    );
  }

  if (!timeline.length) {
    return (
      <div className="w-full h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Clock size={24} className="mx-auto mb-2" />
          <p className="text-sm">No timeline events yet</p>
        </div>
      </div>
    );
  }

  const sortedEvents = [...timeline].sort((a, b) => a.order - b.order);

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-4">
        <div className="flex items-center space-x-6 min-w-max px-4">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="flex items-center">
              <Card className="w-48 flex-shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                      index === sortedEvents.length - 1 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {event.title}
                      </h4>
                      {event.chapter && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {event.chapter}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {index < sortedEvents.length - 1 && (
                <div className="flex items-center mx-3">
                  <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
                  <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mx-1" />
                  <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}