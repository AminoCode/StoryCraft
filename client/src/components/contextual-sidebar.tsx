import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, MapPin, Clock, Edit3, Trash2, RefreshCw, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Character, Location, TimelineEvent, InsertCharacter, InsertLocation, InsertTimelineEvent } from "@shared/schema";

interface ContextualSidebarProps {
  documentId: string;
  projectId?: string;
  isBottomLayout?: boolean;
}

export default function ContextualSidebar({ documentId, projectId, isBottomLayout = false }: ContextualSidebarProps) {
  const [activeTab, setActiveTab] = useState("characters");
  const [showNewCharacterDialog, setShowNewCharacterDialog] = useState(false);
  const [showNewLocationDialog, setShowNewLocationDialog] = useState(false);
  const [showNewTimelineDialog, setShowNewTimelineDialog] = useState(false);
  const [newCharacter, setNewCharacter] = useState<Partial<InsertCharacter>>({});
  const [newLocation, setNewLocation] = useState<Partial<InsertLocation>>({});
  const [newTimelineEvent, setNewTimelineEvent] = useState<Partial<InsertTimelineEvent>>({});
  
  const { toast } = useToast();

  // Use project-based queries if projectId is provided, otherwise fallback to document-based
  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: projectId ? ["/api/projects", projectId, "characters"] : ["/api/documents", documentId, "characters"],
  });

  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: projectId ? ["/api/projects", projectId, "locations"] : ["/api/documents", documentId, "locations"],
  });

  const { data: timeline = [], isLoading: timelineLoading } = useQuery<TimelineEvent[]>({
    queryKey: projectId ? ["/api/projects", projectId, "timeline"] : ["/api/documents", documentId, "timeline"],
  });

  // Mutations for creating new story elements
  const createCharacterMutation = useMutation({
    mutationFn: async (data: InsertCharacter) => {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create character");
      return response.json();
    },
    onSuccess: () => {
      const queryKey = projectId ? ["/api/projects", projectId, "characters"] : ["/api/documents", documentId, "characters"];
      queryClient.invalidateQueries({ queryKey });
      setShowNewCharacterDialog(false);
      setNewCharacter({});
      toast({ title: "Character created", description: "New character added successfully." });
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: InsertLocation) => {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create location");
      return response.json();
    },
    onSuccess: () => {
      const queryKey = projectId ? ["/api/projects", projectId, "locations"] : ["/api/documents", documentId, "locations"];
      queryClient.invalidateQueries({ queryKey });
      setShowNewLocationDialog(false);
      setNewLocation({});
      toast({ title: "Location created", description: "New location added successfully." });
    },
  });

  const createTimelineEventMutation = useMutation({
    mutationFn: async (data: InsertTimelineEvent) => {
      const response = await fetch("/api/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create timeline event");
      return response.json();
    },
    onSuccess: () => {
      const queryKey = projectId ? ["/api/projects", projectId, "timeline"] : ["/api/documents", documentId, "timeline"];
      queryClient.invalidateQueries({ queryKey });
      setShowNewTimelineDialog(false);
      setNewTimelineEvent({});
      toast({ title: "Timeline event created", description: "New timeline event added successfully." });
    },
  });

  const handleCreateCharacter = () => {
    if (newCharacter.name?.trim()) {
      createCharacterMutation.mutate({
        name: newCharacter.name,
        projectId: projectId || "default-project",
        role: newCharacter.role || null,
        age: newCharacter.age || null,
        appearance: newCharacter.appearance || null,
        traits: newCharacter.traits || null,
        relationships: newCharacter.relationships || null,
        lastMentioned: newCharacter.lastMentioned || null,
      });
    }
  };

  const handleCreateLocation = () => {
    if (newLocation.name?.trim()) {
      createLocationMutation.mutate({
        name: newLocation.name,
        projectId: projectId || "default-project",
        type: newLocation.type || null,
        description: newLocation.description || null,
        keyFeatures: newLocation.keyFeatures || null,
        firstMentioned: newLocation.firstMentioned || null,
      });
    }
  };

  const handleCreateTimelineEvent = () => {
    if (newTimelineEvent.title?.trim()) {
      const nextOrder = Math.max(...timeline.map(e => e.order), 0) + 1;
      createTimelineEventMutation.mutate({
        title: newTimelineEvent.title,
        projectId: projectId || "default-project",
        chapter: newTimelineEvent.chapter || null,
        description: newTimelineEvent.description || null,
        order: nextOrder,
      });
    }
  };

  return (
    <div className={`bg-white border-gray-200 flex flex-col h-full overflow-hidden ${
      isBottomLayout 
        ? 'w-full border-t flex-row' 
        : 'w-full'
    }`}>
      {/* Sidebar Header */}
      <div className={`border-gray-200 p-4 flex-shrink-0 ${
        isBottomLayout ? 'border-r' : 'border-b'
      }`}>
        <h2 className="font-semibold text-gray-900">Story Elements</h2>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className={`flex-1 flex min-h-0 ${
        isBottomLayout ? 'flex-row' : 'flex-col'
      }`}>
        <TabsList className={`grid border-gray-200 rounded-none h-auto bg-transparent flex-shrink-0 ${
          isBottomLayout 
            ? 'grid-rows-3 w-auto border-r' 
            : 'grid-cols-3 w-full border-b'
        }`}>
          <TabsTrigger 
            value="characters" 
            className="flex items-center space-x-1 px-3 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <Users size={16} />
            <span>Characters</span>
          </TabsTrigger>
          <TabsTrigger 
            value="locations"
            className="flex items-center space-x-1 px-3 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <MapPin size={16} />
            <span>Locations</span>
          </TabsTrigger>
          <TabsTrigger 
            value="timeline"
            className="flex items-center space-x-1 px-3 py-3 text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
          >
            <Clock size={16} />
            <span>Timeline</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0 relative">

          <TabsContent value="characters" className="absolute inset-0 p-0 m-0">
            <div className="p-4 space-y-4 h-full overflow-y-auto">
              {charactersLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg h-32"></div>
                  ))}
                </div>
              ) : (
              <div className="space-y-4">
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
                      {character.relationships && Array.isArray(character.relationships) && character.relationships.length > 0 ? (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-2">Relationships:</div>
                          <div className="flex flex-wrap gap-2">
                            {(character.relationships as string[]).map((rel, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {rel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Character */}
                <Dialog open={showNewCharacterDialog} onOpenChange={setShowNewCharacterDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full p-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                    >
                      <Plus size={16} className="mr-2" />
                      Add New Character
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Character</DialogTitle>
                      <DialogDescription>
                        Create a new character for your story.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="character-name">Name *</Label>
                        <Input
                          id="character-name"
                          value={newCharacter.name || ""}
                          onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                          placeholder="Character name..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="character-role">Role</Label>
                        <Input
                          id="character-role"
                          value={newCharacter.role || ""}
                          onChange={(e) => setNewCharacter({...newCharacter, role: e.target.value})}
                          placeholder="Protagonist, Antagonist, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="character-age">Age</Label>
                        <Input
                          id="character-age"
                          value={newCharacter.age || ""}
                          onChange={(e) => setNewCharacter({...newCharacter, age: e.target.value})}
                          placeholder="Age or age range..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="character-appearance">Appearance</Label>
                        <Textarea
                          id="character-appearance"
                          value={newCharacter.appearance || ""}
                          onChange={(e) => setNewCharacter({...newCharacter, appearance: e.target.value})}
                          placeholder="Physical description..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="character-traits">Personality Traits</Label>
                        <Textarea
                          id="character-traits"
                          value={newCharacter.traits || ""}
                          onChange={(e) => setNewCharacter({...newCharacter, traits: e.target.value})}
                          placeholder="Key personality traits..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewCharacterDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateCharacter}
                        disabled={!newCharacter.name?.trim() || createCharacterMutation.isPending}
                      >
                        {createCharacterMutation.isPending ? "Creating..." : "Create Character"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="absolute inset-0 p-0 m-0">
            <div className="p-4 space-y-4 h-full overflow-y-auto">
              {locationsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg h-32"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
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

                {/* Current Location Highlight - Only show if there are locations */}
                {locations.length > 0 && (
                  <Card className="bg-blue-50 border border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="text-blue-500" size={16} />
                        <h3 className="font-semibold text-blue-700">Recently Mentioned</h3>
                      </div>
                      <p className="text-sm text-blue-600">{locations[0]?.name} - Featured in current writing</p>
                    </CardContent>
                  </Card>
                )}

                <Dialog open={showNewLocationDialog} onOpenChange={setShowNewLocationDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full p-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                    >
                      <Plus size={16} className="mr-2" />
                      Add New Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Location</DialogTitle>
                      <DialogDescription>
                        Create a new location for your story.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="location-name">Name *</Label>
                        <Input
                          id="location-name"
                          value={newLocation.name || ""}
                          onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                          placeholder="Location name..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="location-type">Type</Label>
                        <Input
                          id="location-type"
                          value={newLocation.type || ""}
                          onChange={(e) => setNewLocation({...newLocation, type: e.target.value})}
                          placeholder="Building, City, Forest, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="location-description">Description</Label>
                        <Textarea
                          id="location-description"
                          value={newLocation.description || ""}
                          onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                          placeholder="Describe this location..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="location-features">Key Features</Label>
                        <Textarea
                          id="location-features"
                          value={newLocation.keyFeatures || ""}
                          onChange={(e) => setNewLocation({...newLocation, keyFeatures: e.target.value})}
                          placeholder="Notable features or landmarks..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewLocationDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateLocation}
                        disabled={!newLocation.name?.trim() || createLocationMutation.isPending}
                      >
                        {createLocationMutation.isPending ? "Creating..." : "Create Location"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="absolute inset-0 p-0 m-0">
            <div className="p-4 h-full overflow-y-auto">
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

                {/* Add New Timeline Event */}
                <Dialog open={showNewTimelineDialog} onOpenChange={setShowNewTimelineDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full p-3 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-600 hover:text-blue-600"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Timeline Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Timeline Event</DialogTitle>
                      <DialogDescription>
                        Add a new event to your story timeline.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="event-title">Title *</Label>
                        <Input
                          id="event-title"
                          value={newTimelineEvent.title || ""}
                          onChange={(e) => setNewTimelineEvent({...newTimelineEvent, title: e.target.value})}
                          placeholder="Event title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-chapter">Chapter</Label>
                        <Input
                          id="event-chapter"
                          value={newTimelineEvent.chapter || ""}
                          onChange={(e) => setNewTimelineEvent({...newTimelineEvent, chapter: e.target.value})}
                          placeholder="Chapter name or number..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="event-description">Description</Label>
                        <Textarea
                          id="event-description"
                          value={newTimelineEvent.description || ""}
                          onChange={(e) => setNewTimelineEvent({...newTimelineEvent, description: e.target.value})}
                          placeholder="Describe what happens in this event..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewTimelineDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateTimelineEvent}
                        disabled={!newTimelineEvent.title?.trim() || createTimelineEventMutation.isPending}
                      >
                        {createTimelineEventMutation.isPending ? "Creating..." : "Add Event"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Sidebar Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>AI Auto-Extract: Active</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
