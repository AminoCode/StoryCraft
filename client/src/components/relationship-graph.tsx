import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, MapPin, Clock, Link, Search, Filter } from "lucide-react";
import type { Character, Location, TimelineEvent } from "@shared/schema";

interface RelationshipGraphProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface Node {
  id: string;
  type: "character" | "location" | "event";
  name: string;
  x: number;
  y: number;
  data: Character | Location | TimelineEvent;
  connections: string[];
}

interface Connection {
  from: string;
  to: string;
  type: "interacts" | "visits" | "participates" | "related";
}

export default function RelationshipGraph({ isOpen, onClose, projectId }: RelationshipGraphProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "character" | "location" | "event">("all");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/projects", projectId, "characters"],
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/projects", projectId, "locations"],
  });

  const { data: timeline = [] } = useQuery<TimelineEvent[]>({
    queryKey: ["/api/projects", projectId, "timeline"],
  });

  // Initialize nodes when data loads with improved spacing
  useEffect(() => {
    if (!characters.length && !locations.length && !timeline.length) return;

    const newNodes: Node[] = [];
    const layoutConfig = {
      horizontalSpacing: 180,
      verticalSpacing: 120,
      sectionSpacing: 150,
      baseX: 80,
      baseY: 80
    };
    
    // Helper function to create nodes for a section
    const createSectionNodes = (
      items: any[], 
      prefix: string, 
      type: Node['type'], 
      maxCols: number, 
      startY: number,
      nameKey: string = 'name'
    ) => {
      const cols = Math.min(maxCols, Math.ceil(Math.sqrt(items.length)));
      return items.map((item, index) => ({
        id: `${prefix}-${item.id}`,
        type,
        name: item[nameKey],
        x: layoutConfig.baseX + (index % cols) * layoutConfig.horizontalSpacing,
        y: startY + Math.floor(index / cols) * layoutConfig.verticalSpacing,
        data: item,
        connections: []
      }));
    };

    // Add character nodes
    const characterNodes = createSectionNodes(characters, 'char', 'character', 4, layoutConfig.baseY);
    newNodes.push(...characterNodes);

    // Add location nodes in separate section
    const characterRows = Math.ceil(characters.length / 4);
    const locationStartY = layoutConfig.baseY + characterRows * layoutConfig.verticalSpacing + layoutConfig.sectionSpacing;
    const locationNodes = createSectionNodes(locations, 'loc', 'location', 3, locationStartY);
    newNodes.push(...locationNodes);

    // Add event nodes in bottom section
    const locationRows = Math.ceil(locations.length / 3);
    const eventStartY = locationStartY + locationRows * layoutConfig.verticalSpacing + layoutConfig.sectionSpacing;
    const eventNodes = createSectionNodes(timeline, 'event', 'event', 5, eventStartY, 'title');
    newNodes.push(...eventNodes);

    setNodes(newNodes);

    // Generate connections based on content analysis
    const newConnections: Connection[] = [];
    
    // Simple relationship detection based on name mentions
    characters.forEach(char => {
      locations.forEach(loc => {
        if (char.appearance?.toLowerCase().includes(loc.name.toLowerCase()) ||
            loc.description?.toLowerCase().includes(char.name.toLowerCase())) {
          newConnections.push({
            from: `char-${char.id}`,
            to: `loc-${loc.id}`,
            type: "visits"
          });
        }
      });

      timeline.forEach(event => {
        if (event.description?.toLowerCase().includes(char.name.toLowerCase())) {
          newConnections.push({
            from: `char-${char.id}`,
            to: `event-${event.id}`,
            type: "participates"
          });
        }
      });
    });

    setConnections(newConnections);
  }, [characters.length, locations.length, timeline.length]);

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || node.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleNodeDrag = (nodeId: string, event: React.MouseEvent) => {
    setDraggedNode(nodeId);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setNodes(prev => prev.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      ));
    };

    const handleMouseUp = () => {
      setDraggedNode(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "character": return Users;
      case "location": return MapPin;
      case "event": return Clock;
      default: return Users;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "character": return "bg-blue-100 border-blue-300 text-blue-800";
      case "location": return "bg-green-100 border-green-300 text-green-800";
      case "event": return "bg-purple-100 border-purple-300 text-purple-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-6xl h-[90vh] p-0 bg-white border border-gray-200">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Story Relationships
          </DialogTitle>
          <DialogDescription>
            Visualize connections between characters, locations, and events in your story.
          </DialogDescription>
          
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "character", "location", "event"] as const).map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative overflow-hidden">
          {/* Graph Canvas */}
          <div 
            ref={containerRef}
            className="w-full h-full relative bg-gray-50 overflow-auto"
            style={{ 
              minHeight: "800px",
              minWidth: "1200px"
            }}
          >
            {/* Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#64748b"
                    opacity="0.5"
                  />
                </marker>
              </defs>
              {connections.map((connection, index) => {
                const fromNode = nodes.find(n => n.id === connection.from);
                const toNode = nodes.find(n => n.id === connection.to);
                
                if (!fromNode || !toNode) return null;
                
                return (
                  <line
                    key={index}
                    x1={fromNode.x + 70}
                    y1={fromNode.y + 35}
                    x2={toNode.x + 70}
                    y2={toNode.y + 35}
                    stroke="#64748b"
                    strokeWidth="2"
                    strokeDasharray={connection.type === "related" ? "5,5" : "none"}
                    opacity="0.5"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </svg>

            {/* Section Headers */}
            {characters.length > 0 && (
              <div 
                className="absolute bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"
                style={{ left: 20, top: 40 }}
              >
                <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Characters
                </h3>
              </div>
            )}
            
            {locations.length > 0 && (
              <div 
                className="absolute bg-green-50 border border-green-200 rounded-lg px-4 py-2"
                style={{ 
                  left: 20, 
                  top: 80 + Math.ceil(characters.length / 4) * 120 + 110
                }}
              >
                <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Locations
                </h3>
              </div>
            )}
            
            {timeline.length > 0 && (
              <div 
                className="absolute bg-purple-50 border border-purple-200 rounded-lg px-4 py-2"
                style={{ 
                  left: 20, 
                  top: 80 + Math.ceil(characters.length / 4) * 120 + Math.ceil(locations.length / 3) * 120 + 260
                }}
              >
                <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Events
                </h3>
              </div>
            )}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const IconComponent = getNodeIcon(node.type);
              return (
                <div
                  key={node.id}
                  className={`absolute cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${getNodeColor(node.type)} ${
                    selectedNode?.id === node.id ? 'ring-2 ring-blue-500 shadow-lg scale-105' : ''
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    width: "140px",
                    minHeight: "70px",
                    zIndex: draggedNode === node.id ? 10 : selectedNode?.id === node.id ? 5 : 1
                  }}
                  onMouseDown={(e) => handleNodeDrag(node.id, e)}
                  onClick={() => setSelectedNode(node)}
                >
                  <Card className="border-2 h-full shadow-sm">
                    <CardContent className="p-3 h-full flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="h-4 w-4 flex-shrink-0" />
                        <Badge variant="outline" className="text-xs capitalize">
                          {node.type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium leading-tight" title={node.name}>
                        {node.name.length > 18 ? `${node.name.substring(0, 18)}...` : node.name}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="absolute top-4 right-4 w-80 bg-white shadow-lg rounded-lg border p-4 max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                {(() => {
                  const IconComponent = getNodeIcon(selectedNode.type);
                  return <IconComponent className="h-4 w-4" />;
                })()}
                {selectedNode.name}
              </h3>
              
              <Badge className="mb-3 capitalize">{selectedNode.type}</Badge>
              
              <div className="space-y-2 text-sm">
                {selectedNode.type === "character" && (
                  <>
                    <p><strong>Appearance:</strong> {(selectedNode.data as Character).appearance || "No appearance"}</p>
                    <p><strong>Role:</strong> {(selectedNode.data as Character).role || "No role"}</p>
                    <p><strong>Age:</strong> {(selectedNode.data as Character).age || "Unknown"}</p>
                  </>
                )}
                
                {selectedNode.type === "location" && (
                  <>
                    <p><strong>Description:</strong> {(selectedNode.data as Location).description || "No description"}</p>
                    <p><strong>Type:</strong> {(selectedNode.data as Location).type || "Unknown"}</p>
                  </>
                )}
                
                {selectedNode.type === "event" && (
                  <>
                    <p><strong>Description:</strong> {(selectedNode.data as TimelineEvent).description || "No description"}</p>
                    <p><strong>Chapter:</strong> {(selectedNode.data as TimelineEvent).chapter || "Unassigned"}</p>
                  </>
                )}
              </div>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="mt-3 w-full"
                onClick={() => setSelectedNode(null)}
              >
                Close Details
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}