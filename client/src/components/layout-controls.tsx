import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sidebar, 
  Monitor, 
  Users, 
  Search, 
  Clock, 
  Moon, 
  Sun,
  MoreVertical,
  Layout
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import HorizontalTimeline from "@/components/horizontal-timeline";

interface LayoutControlsProps {
  layoutMode: "sidebar" | "bottom";
  onLayoutChange: (mode: "sidebar" | "bottom") => void;
  onRelationshipViewToggle: () => void;
  showRelationshipView: boolean;
  showHorizontalTimeline: boolean;
  onHorizontalTimelineToggle: () => void;
  projectId: string;
}

export default function LayoutControls({
  layoutMode,
  onLayoutChange,
  onRelationshipViewToggle,
  showRelationshipView,
  showHorizontalTimeline,
  onHorizontalTimelineToggle,
  projectId
}: LayoutControlsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Main Controls Bar */}
      <div className="flex items-center justify-between p-3 space-x-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Layout & Tools
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search story elements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs w-48"
            />
          </div>

          {/* Layout Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 px-2">
                <Layout size={14} className="mr-1" />
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                opacity: 1
              }}
            >
              <DropdownMenuItem onClick={() => onLayoutChange("sidebar")}>
                <Sidebar size={14} className="mr-2" />
                Sidebar Layout
                {layoutMode === "sidebar" && <Badge variant="secondary" className="ml-2 text-xs">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onLayoutChange("bottom")}>
                <Monitor size={14} className="mr-2" />
                Bottom Panel
                {layoutMode === "bottom" && <Badge variant="secondary" className="ml-2 text-xs">Active</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tools Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 px-2">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end"
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                opacity: 1
              }}
            >
              <DropdownMenuItem onClick={onRelationshipViewToggle}>
                <Users size={14} className="mr-2" />
                Character Relationships
                {showRelationshipView && <Badge variant="secondary" className="ml-2 text-xs">Open</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHorizontalTimelineToggle}>
                <Clock size={14} className="mr-2" />
                Horizontal Timeline
                {showHorizontalTimeline && <Badge variant="secondary" className="ml-2 text-xs">Active</Badge>}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? <Sun size={14} className="mr-2" /> : <Moon size={14} className="mr-2" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Horizontal Timeline */}
      {showHorizontalTimeline && (
        <div 
          className="border-t border-gray-200 bg-gray-50"
          style={{ 
            height: '140px',
            maxHeight: '140px',
            overflowX: 'auto',
            overflowY: 'hidden'
          }}
        >
          <HorizontalTimeline projectId={projectId} />
        </div>
      )}
    </div>
  );
}