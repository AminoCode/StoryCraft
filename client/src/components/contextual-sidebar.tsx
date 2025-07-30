import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, MapPin, Clock, Brain, RefreshCw, AlertTriangle } from "lucide-react";
import type { Character, Location, TimelineEvent } from "@shared/schema";

interface ContextualSidebarProps {
  documentId: string;
}

export default function ContextualSidebar({ documentId }: ContextualSidebarProps) {
  const [activeTab, setActiveTab] = useState("characters");

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/documents", documentId, "characters"],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/documents", documentId, "locations"],
  });

  const { data: timeline = [], isLoading: timelineLoading } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/documents", documentId, "timeline"],
  });

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">Story Elements</h2>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 border-b border-gray-200 rounded-none h-auto bg-transparent">
          <TabsTrigger 
            value="characters" 
            className="flex items-center space-x-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
          >
            <Users size={16} />
            <span>Characters</span>
          </TabsTrigger>
          <TabsTrigger 
            value="locations"
            className="flex items-center space-x-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
          >
            <MapPin size={16} />
            <span>Locations</span>
          </TabsTrigger>
          <TabsTrigger 
            value="timeline"
            className="flex items-center space-x-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
          >
            <Clock size={16} />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="characters" className="p-4 space-y-4 m-0">
            {charactersLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-gray-100 rounded-lg h-32"></div>
                ))}
              </div>
            ) : (
              <>
                {characters.map((character) => (
                  <Card key={character.id} className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{character.name}</h3>
                        {character.role && (
                          <Badge variant="secondary" className="text-xs">
                            {character.role}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        {character.age && (
                          <div><strong>Age:</strong> {character.age}</div>
                        )}
                        {character.appearance && (
                          <div><strong>Appearance:</strong> {character.appearance}</div>
                        )}
                        {character.traits && (
                          <div><strong>Traits:</strong> {character.traits}</div>
                        )}
                        {character.lastMentioned && (
                          <div><strong>Last mentioned:</strong> {character.lastMentioned}</div>
                        )}
                      </div>
                      {character.relationships && Array.isArray(character.relationships) && character.relationships.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">Relationships:</div>
                          <div className="flex flex-wrap gap-2">
                            {(character.relationships as string[]).map((rel: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {String(rel)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* New Character Detection */}
                <Card className="bg-yellow-50 border-2 border-dashed border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="text-yellow-500" size={16} />
                      <h3 className="font-semibold text-yellow-700">New Character Detected</h3>
                    </div>
                    <p className="text-sm text-yellow-600 mb-3">
                      AI detected a potential new character: "Mrs. Harrington" mentioned in previous chapters.
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" className="h-8 px-3 text-xs bg-yellow-500 hover:bg-yellow-600">
                        Add Character
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        Ignore
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Add New Character */}
                <Button
                  variant="outline"
                  className="w-full p-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                >
                  <Plus size={16} className="mr-2" />
                  Add New Character
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="locations" className="p-4 space-y-4 m-0">
            {locationsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-gray-100 rounded-lg h-32"></div>
                ))}
              </div>
            ) : (
              <>
                {locations.map((location) => (
                  <Card key={location.id} className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">{location.name}</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        {location.type && (
                          <div><strong>Type:</strong> {location.type}</div>
                        )}
                        {location.description && (
                          <div><strong>Description:</strong> {location.description}</div>
                        )}
                        {location.keyFeatures && (
                          <div><strong>Key Features:</strong> {location.keyFeatures}</div>
                        )}
                        {location.firstMentioned && (
                          <div><strong>First mentioned:</strong> {location.firstMentioned}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Current Location Highlight */}
                <Card className="bg-blue-50 border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="text-blue-500" size={16} />
                      <h3 className="font-semibold text-blue-700">Current Scene Location</h3>
                    </div>
                    <p className="text-sm text-blue-600">Library - Mentioned 3 times in this chapter</p>
                  </CardContent>
                </Card>

                <Button
                  variant="outline"
                  className="w-full p-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                >
                  <Plus size={16} className="mr-2" />
                  Add New Location
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="p-4 m-0">
            {timelineLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-gray-100 rounded-lg h-20"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-3 h-3 rounded-full ${
                        index === timeline.length - 1 
                          ? 'bg-green-500 ring-4 ring-green-500 ring-opacity-20' 
                          : 'bg-blue-600'
                      }`}></div>
                      {index < timeline.length - 1 && (
                        <div className="w-px h-12 bg-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className={`text-sm font-medium ${
                        index === timeline.length - 1 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {event.title}
                      </div>
                      {event.chapter && (
                        <div className="text-xs text-gray-500">{event.chapter}</div>
                      )}
                      {event.description && (
                        <div className="text-xs text-gray-600 mt-1">{event.description}</div>
                      )}
                    </div>
                  </div>
                ))}

                {/* AI Insights */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    <Brain className="inline mr-2 text-blue-600" size={16} />
                    AI Story Insights
                  </h4>
                  <div className="space-y-3">
                    <Card className="bg-blue-50 border border-blue-200">
                      <CardContent className="p-3">
                        <div className="text-xs font-medium text-blue-700 mb-1">Plot Consistency</div>
                        <div className="text-xs text-blue-600">Timeline is consistent. No contradictions detected.</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-yellow-50 border border-yellow-200">
                      <CardContent className="p-3">
                        <div className="text-xs font-medium text-yellow-700 mb-1">Character Development</div>
                        <div className="text-xs text-yellow-600">Consider showing more of Sarah's background or motivation.</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Sidebar Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>AI Analysis: Active</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
