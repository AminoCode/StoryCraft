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
      <div className="w-full h-32 bg-gray-50 rounded-lg animate-pulse border" />
    );
  }

  if (!timeline.length) {
    return (
      <div className="w-full h-32 bg-gray-50 rounded-lg border flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Clock size={24} className="mx-auto mb-2" />
          <p className="text-sm">No timeline events yet</p>
        </div>
      </div>
    );
  }

  const sortedEvents = [...timeline].sort((a, b) => a.order - b.order);

  return (
    <div 
      className="w-full h-full flex items-center"
      style={{ 
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '16px'
      }}
    >
      <div 
        className="flex items-center space-x-4"
        style={{ 
          minWidth: 'max-content',
          height: 'fit-content'
        }}
      >
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="flex items-center">
            <Card 
              className="bg-white border-gray-200 shadow-sm"
              style={{ 
                width: '180px',
                minWidth: '180px',
                flexShrink: 0
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-2 mb-2">
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    index === sortedEvents.length - 1 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
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
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                )}
              </CardContent>
            </Card>
            
            {index < sortedEvents.length - 1 && (
              <div className="flex items-center mx-2" style={{ minWidth: '32px' }}>
                <div className="w-4 h-px bg-gray-300" />
                <div className="w-1 h-1 bg-gray-400 rounded-full mx-1" />
                <div className="w-4 h-px bg-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}