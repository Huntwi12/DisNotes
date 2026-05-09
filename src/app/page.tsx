"use client";

import React, { useState, useEffect, useCallback } from "react";
import * as Actions from "./actions";
import { 
  Hash, 
  Settings, 
  Mic, 
  Headphones, 
  Plus, 
  Search, 
  Bell, 
  HelpCircle,
  Zap,
  Brain,
  MessageSquare,
  ChevronDown,
  UserCircle,
  Trash2,
  LayoutDashboard,
  CheckCircle2,
  BarChart3,
  Clock,
  Tag,
  Calendar,
  AlertCircle,
  Terminal,
  Activity,
  Workflow,
  Play,
  Pause,
  ExternalLink,
  Video,
  MessageCircle,
  Mail,
  History,
  TrendingUp,
  Cpu
} from "lucide-react";

// Types
type Page = {
  id: string;
  name: string;
};

type Project = {
  id: string;
  name: string;
  iconName: string;
  pages: Page[];
};

type Note = {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  pageId: string;
  tags?: string[];
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
};

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap size={28} />,
  Brain: <Brain size={28} />,
  MessageSquare: <MessageSquare size={28} />,
  Dashboard: <LayoutDashboard size={28} />,
  Terminal: <Terminal size={28} />,
  Activity: <Activity size={28} />,
  Workflow: <Workflow size={28} />,
  Cpu: <Cpu size={28} />,
};

const AVAILABLE_ICONS = ["Zap", "Brain", "MessageSquare", "Terminal", "Activity", "Workflow", "Cpu"];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [activePageId, setActivePageId] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"chat" | "dashboard" | "intelligence" | "agents">("chat");
  
  // Drag and Drop state
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  // ... (rest of state)

  // Icon Switching
  const handleCycleIcon = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault(); // Prevent context menu
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const currentIndex = AVAILABLE_ICONS.indexOf(project.iconName);
    const nextIndex = (currentIndex + 1) % AVAILABLE_ICONS.length;
    const nextIcon = AVAILABLE_ICONS[nextIndex];

    await Actions.updateProjectIcon(projectId, nextIcon);
    loadData();
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedNoteId(id);
    e.dataTransfer.setData("noteId", id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("noteId");
    if (sourceId === targetId) return;

    const pageNotes = notes.filter(n => n.pageId === activePageId);
    const sourceIndex = pageNotes.findIndex(n => n.id === sourceId);
    const targetIndex = pageNotes.findIndex(n => n.id === targetId);

    const newOrderedNotes = [...pageNotes];
    const [movedNote] = newOrderedNotes.splice(sourceIndex, 1);
    newOrderedNotes.splice(targetIndex, 0, movedNote);

    const orderedIds = newOrderedNotes.map(n => n.id);
    await Actions.reorderNotes(activePageId, orderedIds);
    loadData();
    setDraggedNoteId(null);
  };

  // ... (rest of functions)
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [timerTask, setTimerTask] = useState("Research Obsidian Workflow");

  // Tab State for Integrated Tools
  const [activeToolTab, setActiveToolTab] = useState<"youtube" | "slack" | "terminal">("youtube");

  const loadData = useCallback(async () => {
    const data = await Actions.fetchAllData();
    const formattedProjects: Project[] = data.projects.map(p => ({
      ...p,
      pages: data.pages.filter(pg => pg.projectId === p.id).map(pg => ({ id: pg.id, name: pg.name }))
    }));
    
    setProjects(formattedProjects);
    setNotes(data.notes);
    
    if (formattedProjects.length > 0) {
      if (!activeProjectId) {
        setActiveProjectId(formattedProjects[0].id);
        if (formattedProjects[0].pages.length > 0) {
          setActivePageId(formattedProjects[0].pages[0].id);
        }
      }
    }
    setLoading(false);
  }, [activeProjectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const activePage = activeProject?.pages.find((p) => p.id === activePageId);

  const handleProjectSwitch = (id: string) => {
    if (id === "dashboard") {
      setView("dashboard");
      setActiveProjectId("dashboard");
      return;
    }
    setView("chat");
    setActiveProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj && proj.pages.length > 0) {
      setActivePageId(proj.pages[0].id);
    } else {
      setActivePageId("");
    }
  };

  const handleNavClick = (newView: "dashboard" | "intelligence" | "agents") => {
    setView(newView);
  };

  const handleAddPage = async () => {
    const pageName = prompt("Enter page name:");
    if (!pageName || !activeProjectId) return;

    const newPageId = Date.now().toString();
    await Actions.addPage({
      id: newPageId,
      projectId: activeProjectId,
      name: pageName.toLowerCase().replace(/\s+/g, "-"),
    });

    loadData();
    setActivePageId(newPageId);
  };

  const handleDeleteNote = async (id: string) => {
    await Actions.deleteNote(id);
    loadData();
  };

  const handleAddProject = async () => {
    const projectName = prompt("Enter project name:");
    if (!projectName) return;

    const newProjectId = Date.now().toString();
    const newPageId = newProjectId + "-init";
    
    await Actions.addProject({
      id: newProjectId,
      name: projectName,
      iconName: "MessageSquare",
    });

    await Actions.addPage({
      id: newPageId,
      projectId: newProjectId,
      name: "general"
    });

    loadData();
    setActiveProjectId(newProjectId);
    setActivePageId(newPageId);
  };

  const handleDeletePage = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (!activeProject || activeProject.pages.length <= 1) return;

    await Actions.deletePage(pageId);
    loadData();
  };

  const handleDeleteProject = async () => {
    if (!activeProject || projects.length <= 1) return;
    if (!confirm(`Are you sure you want to delete "${activeProject.name}"?`)) return;

    await Actions.deleteProject(activeProjectId);
    loadData();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activePageId) return;

    // Handle Commands
    if (inputValue.startsWith("/")) {
      const command = inputValue.toLowerCase().trim();
      let response = "";
      let user = "System Agent";

      if (command === "/today") {
        response = "🌅 **Good Morning!**\n\nI've analyzed your context:\n- **Calendar:** 3 events detected.\n- **Focus:** Your top priority is 'Discord Pro UI'.\n- **Yesterday:** 2 tasks carried over.\n\nType `/start focus` to begin.";
      } else if (command === "/close day") {
        response = "🌙 **Evening Reflection**\n\nSummary of your output:\n- **Time Focused:** " + formatTime(timeSeconds) + "\n- **Notes Taken:** 12 entries\n- **Metrics:** Knowledge capture up by 4%.\n\nRest up. See you tomorrow!";
      } else {
        response = `Unknown command: ${command}`;
      }

      await Actions.addNote({
        id: Date.now().toString(),
        user: user,
        content: response,
        timestamp: "Now",
        pageId: activePageId,
      });
      setInputValue("");
      loadData();
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      user: "User",
      content: inputValue,
      timestamp: "Today at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pageId: activePageId,
    };

    await Actions.addNote(newNote);
    setInputValue("");
    loadData();
  };

  const filteredNotes = notes.filter((n) => n.pageId === activePageId);

  if (loading) return <div className="flex items-center justify-center h-screen bg-main text-white">Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-main text-text-normal font-sans select-none overflow-hidden">
      {/* Sidebar: Projects */}
      <aside className="w-[72px] bg-sidebar flex flex-col items-center py-3 space-y-2 flex-shrink-0 overflow-y-auto no-scrollbar border-r border-black/20">
        <div 
          onClick={() => handleProjectSwitch("dashboard")}
          className={`group relative flex items-center justify-center w-12 h-12 transition-all duration-200 cursor-pointer mb-2 ${
            activeProjectId === "dashboard" ? "rounded-[16px] bg-brand text-white" : "bg-nav rounded-[24px] hover:rounded-[16px] hover:bg-brand text-white"
          }`}
        >
          <LayoutDashboard size={28} />
          <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
            activeProjectId === "dashboard" ? "h-10" : "h-2 scale-0 group-hover:scale-100 group-hover:h-5"
          }`} />
        </div>
        
        <div className="w-8 h-[2px] bg-nav rounded-full mx-auto mb-2" />

        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectSwitch(project.id)}
            onContextMenu={(e) => handleCycleIcon(e, project.id)}
            className="group relative flex items-center justify-center w-12 h-12 cursor-pointer"
            title="Right-click to change icon"
          >
            <div className={`absolute left-0 w-1 bg-white rounded-r-full transition-all duration-200 ${
              activeProjectId === project.id ? "h-10" : "h-2 scale-0 group-hover:scale-100 group-hover:h-5"
            }`} />
            
            <div className={`flex items-center justify-center w-12 h-12 transition-all duration-200 shadow-lg ${
              activeProjectId === project.id 
                ? "rounded-[16px] bg-brand text-white" 
                : "rounded-[24px] bg-nav text-text-normal hover:rounded-[16px] hover:bg-brand hover:text-white"
            }`}>
              {iconMap[project.iconName] || <MessageSquare size={28} />}
            </div>
          </div>
        ))}

        <div 
          onClick={handleAddProject}
          className="group relative flex items-center justify-center w-12 h-12 bg-nav rounded-[24px] hover:rounded-[16px] hover:bg-green-600 text-green-500 hover:text-white transition-all duration-200 cursor-pointer"
        >
          <Plus size={28} />
        </div>
      </aside>

      {/* Navigation Rail: Pages */}
      <nav className="w-60 bg-nav flex flex-col flex-shrink-0 border-r border-black/20">
        <header className="h-12 flex items-center px-4 border-b border-black/20 shadow-sm hover:bg-white/5 cursor-pointer transition-colors group">
          <h1 className="flex-1 font-bold text-white truncate">
            {activeProjectId === "dashboard" ? "System Core" : (activeProject?.name || "App")}
          </h1>
          {activeProjectId !== "dashboard" && activeProject && (
            <div className="flex items-center space-x-1">
              <ChevronDown size={20} className="text-white" />
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {activeProjectId === "dashboard" ? (
            <>
              <div 
                onClick={() => handleNavClick("dashboard")}
                className={`px-2 py-1.5 flex items-center rounded-md cursor-pointer transition-colors ${
                  view === "dashboard" ? "text-interactive-active bg-white/10" : "text-text-muted hover:bg-white/5 hover:text-interactive-normal"
                }`}
              >
                <LayoutDashboard size={20} className="mr-2" />
                <span className="font-bold">Operations Hub</span>
              </div>
              <div 
                onClick={() => handleNavClick("intelligence")}
                className={`px-2 py-1.5 flex items-center rounded-md cursor-pointer transition-colors ${
                  view === "intelligence" ? "text-interactive-active bg-white/10" : "text-text-muted hover:bg-white/5 hover:text-interactive-normal"
                }`}
              >
                <Workflow size={20} className="mr-2" />
                <span className="font-medium">Intelligence Layer</span>
              </div>
              <div 
                onClick={() => handleNavClick("agents")}
                className={`px-2 py-1.5 flex items-center rounded-md cursor-pointer transition-colors ${
                  view === "agents" ? "text-interactive-active bg-white/10" : "text-text-muted hover:bg-white/5 hover:text-interactive-normal"
                }`}
              >
                <Cpu size={20} className="mr-2" />
                <span className="font-medium">Agent Matrix</span>
              </div>
            </>
          ) : (
// ... (rest of pages)
            <>
              <div className="px-2 mb-1 flex items-center justify-between group">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider group-hover:text-interactive-normal transition-colors cursor-default">Note Channels</span>
                <Plus size={14} className="text-text-muted hover:text-white cursor-pointer" onClick={handleAddPage} />
              </div>
              {activeProject?.pages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => setActivePageId(page.id)}
                  className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer group transition-colors relative ${
                    activePageId === page.id ? "bg-white/10 text-white" : "text-text-muted hover:bg-white/5 hover:text-interactive-normal"
                  }`}
                >
                  <Hash size={20} className="mr-1.5 text-text-muted group-hover:text-interactive-normal" />
                  <span className="font-medium truncate flex-1">{page.name}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-main relative">
        {/* Header Bar */}
        <header className="h-12 flex items-center px-4 border-b border-black/20 shadow-sm flex-shrink-0">
          {activeProjectId === "dashboard" ? (
            <LayoutDashboard size={24} className="text-brand mr-2" />
          ) : (
            <Hash size={24} className="text-text-muted mr-2" />
          )}
          <h2 className="text-white font-bold truncate mr-4">
            {view === "dashboard" ? "System Dashboard" : 
             view === "intelligence" ? "Intelligence Layer" :
             view === "agents" ? "Agent Matrix" :
             (activePage?.name || "Select Page")}
          </h2>
          <div className="flex-1" />
          <div className="flex items-center space-x-4 text-text-muted">
            <Activity size={24} className="hover:text-interactive-normal cursor-pointer transition-colors" />
            <Bell size={24} className="hover:text-interactive-normal cursor-pointer transition-colors" />
            <div className="relative">
              <Search size={20} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" placeholder="Search" className="bg-sidebar h-6 w-36 rounded px-8 text-sm focus:w-60 transition-all duration-200 outline-none placeholder:text-text-muted" />
            </div>
            <HelpCircle size={24} className="hover:text-interactive-normal cursor-pointer transition-colors" />
          </div>
        </header>

        {view === "intelligence" ? (
          /* Intelligence Layer View */
          <div className="flex-1 overflow-y-auto p-6 bg-main no-scrollbar">
            <div className="bg-nav p-8 rounded-xl border border-white/5 shadow-2xl min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                    <Workflow size={28} className="mr-3 text-brand" />
                    Knowledge Relational Mapping
                  </h2>
                  <p className="text-text-muted">Visualizing connections across your second brain</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-brand text-white rounded font-bold text-sm">Regenerate Map</button>
                  <button className="px-4 py-2 bg-sidebar text-text-muted rounded font-bold text-sm">Export Data</button>
                </div>
              </div>
              
              <div className="flex-1 bg-black/20 rounded-lg relative overflow-hidden flex items-center justify-center">
                {/* Mock Graph Visualization */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-brand rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                
                <div className="z-10 text-center">
                  <Activity size={64} className="text-brand mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-white mb-2">Analyzing Nodes...</h3>
                  <p className="text-text-muted max-w-md mx-auto">
                    Scanning **334** entries across **{projects.length}** projects to identify clusters and hidden insights.
                  </p>
                </div>

                {/* SVG Connecting Lines Mockup */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-brand/20" />
                  <line x1="80%" y1="30%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-brand/20" />
                  <line x1="40%" y1="80%" x2="50%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-brand/20" />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-sidebar/50 rounded-lg border border-white/5">
                  <div className="text-xs font-bold text-brand uppercase mb-1">Top Cluster</div>
                  <div className="text-white font-bold text-lg">Financial Strategy</div>
                  <div className="text-[10px] text-text-muted">42 related notes</div>
                </div>
                <div className="p-4 bg-sidebar/50 rounded-lg border border-white/5">
                  <div className="text-xs font-bold text-green-500 uppercase mb-1">Discovery Rate</div>
                  <div className="text-white font-bold text-lg">+12.5%</div>
                  <div className="text-[10px] text-text-muted">New connections this week</div>
                </div>
                <div className="p-4 bg-sidebar/50 rounded-lg border border-white/5">
                  <div className="text-xs font-bold text-yellow-500 uppercase mb-1">Memory Health</div>
                  <div className="text-white font-bold text-lg">Optimal</div>
                  <div className="text-[10px] text-text-muted">Zero isolated nodes detected</div>
                </div>
              </div>
            </div>
          </div>
        ) : view === "agents" ? (
          /* Agent Matrix View */
          <div className="flex-1 overflow-y-auto p-6 bg-main no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[
                { name: "Morning Brief Agent", status: "Active", cap: "Calendar + Context Analysis", icon: <Calendar size={24} />, color: "text-brand" },
                { name: "Reflection Agent", status: "Idle", cap: "Voice Dictation + Metric Sync", icon: <Mic size={24} />, color: "text-green-400" },
                { name: "Relational Agent", status: "Running", cap: "Cross-Project Note Mapping", icon: <Workflow size={24} />, color: "text-purple-400" },
                { name: "Quick Capture Agent", status: "Standby", cap: "Inbox Triage & Sorting", icon: <Zap size={24} />, color: "text-yellow-400" },
                { name: "Terminal Assistant", status: "Offline", cap: "Localhost Process Monitoring", icon: <Terminal size={24} />, color: "text-red-400" },
              ].map((agent, i) => (
                <div key={i} className="bg-nav p-6 rounded-xl border border-white/5 shadow-xl hover:border-brand/30 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-lg bg-sidebar flex items-center justify-center ${agent.color}`}>
                      {agent.icon}
                    </div>
                    <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                      agent.status === "Active" || agent.status === "Running" ? "bg-green-500/10 text-green-400" : "bg-white/5 text-text-muted"
                    }`}>
                      {agent.status}
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{agent.name}</h3>
                  <p className="text-sm text-text-muted mb-4">{agent.cap}</p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Capabilities</span>
                    <Settings size={14} className="text-text-muted group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
              
              <div className="bg-nav/50 p-6 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center hover:bg-nav transition-all cursor-pointer">
                <Plus size={32} className="text-text-muted mb-2" />
                <div className="text-white font-bold">Deploy New Agent</div>
                <div className="text-xs text-text-muted mt-1">Connect a custom API or Local Model</div>
              </div>
            </div>
          </div>
        ) : view === "dashboard" ? (
          /* Dashboard View */
          <div className="flex-1 overflow-y-auto p-6 bg-main no-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              
              {/* Focus Timer Widget */}
              <div className="bg-nav p-4 rounded-lg border border-white/5 shadow-xl col-span-1 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white flex items-center">
                    <Clock size={18} className="mr-2 text-brand" />
                    Current Focus Logging
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`p-1.5 rounded ${timerRunning ? "bg-red-500 text-white" : "bg-green-600 text-white"}`}
                    >
                      {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={() => setTimeSeconds(0)}
                      className="p-1.5 bg-sidebar text-text-muted rounded"
                    >
                      <History size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 w-full mr-4">
                    <input 
                      type="text" 
                      value={timerTask}
                      onChange={(e) => setTimerTask(e.target.value)}
                      className="bg-sidebar w-full rounded p-2 text-sm outline-none border border-white/5 text-white"
                    />
                  </div>
                  <div className="text-4xl font-mono text-brand font-bold bg-black/20 px-4 py-2 rounded-lg">
                    {formatTime(timeSeconds)}
                  </div>
                </div>
              </div>

              {/* Quick Capture Widget */}
              <div className="bg-nav p-4 rounded-lg border border-white/5 shadow-xl flex flex-col row-span-2">
                <h3 className="font-bold text-white mb-4 flex items-center">
                  <Zap size={18} className="mr-2 text-yellow-500" />
                  Quick Capture
                </h3>
                <textarea 
                  placeholder="Rapid log an idea..."
                  className="bg-sidebar w-full flex-1 rounded p-3 text-sm outline-none resize-none placeholder:text-text-muted min-h-[150px] mb-2"
                />
                <button className="bg-brand text-white py-1.5 rounded text-sm font-bold flex items-center justify-center">
                  <Plus size={16} className="mr-1" /> Commit to Inbox
                </button>
              </div>

              {/* Integrated Tools (iFrames) Widget */}
              <div className="bg-nav rounded-lg border border-white/5 shadow-xl col-span-1 md:col-span-2 flex flex-col h-[400px]">
                <div className="flex items-center space-x-1 p-2 bg-sidebar/50 rounded-t-lg">
                  <button onClick={() => setActiveToolTab("youtube")} className={`px-3 py-1 text-xs font-bold rounded flex items-center ${activeToolTab === "youtube" ? "bg-brand text-white" : "text-text-muted hover:text-white"}`}>
                    <Video size={14} className="mr-1" /> YouTube
                  </button>
                  <button onClick={() => setActiveToolTab("slack")} className={`px-3 py-1 text-xs font-bold rounded flex items-center ${activeToolTab === "slack" ? "bg-brand text-white" : "text-text-muted hover:text-white"}`}>
                    <MessageCircle size={14} className="mr-1" /> Slack
                  </button>
                  <button onClick={() => setActiveToolTab("terminal")} className={`px-3 py-1 text-xs font-bold rounded flex items-center ${activeToolTab === "terminal" ? "bg-brand text-white" : "text-text-muted hover:text-white"}`}>
                    <Terminal size={14} className="mr-1" /> Terminal
                  </button>
                </div>
                <div className="flex-1 bg-black/40 p-0 relative overflow-hidden">
                  {activeToolTab === "youtube" && (
                    <iframe 
                      src="https://www.youtube.com/embed/OZ3ZNhrPbF4" 
                      className="w-full h-full border-none"
                      allowFullScreen
                    />
                  )}
                  {activeToolTab === "slack" && (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                      <MessageCircle size={48} className="mb-2 opacity-20" />
                      <p className="text-sm">Slack Workspace Integrated</p>
                      <button className="mt-4 text-xs bg-brand px-4 py-2 rounded text-white font-bold">Launch Connector</button>
                    </div>
                  )}
                  {activeToolTab === "terminal" && (
                    <div className="bg-[#0c0c0c] h-full p-4 font-mono text-sm overflow-hidden text-green-400">
                      <p>root@discord-os:~$ npm run dev</p>
                      <p className="text-white">▲ Next.js 15.0.0 (Turbopack)</p>
                      <p className="text-white">- Local: http://localhost:3500</p>
                      <p className="text-white">✓ Ready in 600ms</p>
                      <p className="animate-pulse">_</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics & Habits Widget */}
              <div className="bg-nav p-4 rounded-lg border border-white/5 shadow-xl">
                <h3 className="font-bold text-white mb-4 flex items-center">
                  <TrendingUp size={18} className="mr-2 text-brand" />
                  Habit Correlation
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted flex items-center"><CheckCircle2 size={12} className="mr-1" /> Deep Work (3hr+)</span>
                    <div className="w-16 h-1.5 bg-sidebar rounded-full"><div className="w-full h-full bg-brand" /></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted flex items-center"><Activity size={12} className="mr-1" /> Exercise</span>
                    <div className="w-16 h-1.5 bg-sidebar rounded-full"><div className="w-[60%] h-full bg-green-500" /></div>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[10px] text-brand font-bold uppercase mb-2">Revenue Correlation</div>
                    <div className="h-20 bg-sidebar/30 rounded flex items-end px-1 space-x-1">
                      {[30, 45, 25, 60, 80, 50, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-brand/50 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Focus / Tasks Widget */}
              <div className="bg-nav p-4 rounded-lg border border-white/5 shadow-xl">
                <h3 className="font-bold text-white mb-4 flex items-center">
                  <CheckCircle2 size={18} className="mr-2 text-green-500" />
                  Daily Roadmap
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm p-2 bg-sidebar/50 rounded group">
                    <div className="w-4 h-4 rounded border border-brand bg-brand flex items-center justify-center mr-3"><Plus size={12} className="text-white rotate-45" /></div>
                    <span className="text-text-muted line-through">System Core Architecture</span>
                  </div>
                  <div className="flex items-center text-sm p-2 hover:bg-sidebar/50 rounded transition-colors group cursor-pointer">
                    <div className="w-4 h-4 rounded border border-white/20 mr-3 group-hover:border-brand" />
                    <span className="text-text-normal">Integrated Work Windows</span>
                  </div>
                  <div className="flex items-center text-sm p-2 hover:bg-sidebar/50 rounded transition-colors group cursor-pointer">
                    <div className="w-4 h-4 rounded border border-white/20 mr-3 group-hover:border-brand" />
                    <span className="text-text-normal">AI Agent Voice Dictation</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Chat/Note View (Simplified for Pro) */
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
              {/* Context Alert for Pro */}
              <div className="bg-brand/10 border border-brand/20 p-4 rounded flex items-start space-x-3">
                <Workflow size={20} className="text-brand flex-shrink-0" />
                <div className="text-xs text-brand leading-relaxed">
                  <span className="font-bold block">INTELLIGENCE LAYER ACTIVE</span>
                  This page is correlated with "Obsidian System Research". Use `/today` to sync your focus.
                </div>
              </div>

              {filteredNotes.map((note) => (
                <div 
                  key={note.id} 
                  draggable
                  onDragStart={(e) => onDragStart(e, note.id)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, note.id)}
                  className={`group flex space-x-4 px-4 -mx-4 py-1 hover:bg-black/5 transition-colors relative cursor-move ${
                    draggedNoteId === note.id ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold mt-0.5 ${note.user === "System Agent" ? "bg-brand animate-pulse" : "bg-nav"}`}>
                    {note.user === "System Agent" ? <Cpu size={20} /> : note.user[0]}
                  </div>
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <div className="flex items-baseline space-x-2">
                      <span className={`font-bold hover:underline cursor-pointer ${note.user === "System Agent" ? "text-brand" : "text-white"}`}>{note.user}</span>
                      <span className="text-xs text-text-muted">{note.timestamp}</span>
                    </div>
                    <div className={`text-text-normal leading-relaxed whitespace-pre-wrap ${note.user === "System Agent" ? "p-3 bg-brand/5 rounded-lg border border-brand/10 mt-1" : ""}`}>
                      {note.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note Entry (Input) with Command Hints */}
            <div className="px-4 pb-6 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="bg-chat rounded-lg flex flex-col px-4 py-2.5">
                <div className="flex items-start">
                  <div className="p-1.5 bg-text-muted/10 rounded-full text-text-muted hover:text-white cursor-pointer transition-colors mr-3 mt-1">
                    <Plus size={20} fill="currentColor" className="text-chat" />
                  </div>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={`Message #${activePage?.name} (Try /today)`}
                    className="bg-transparent flex-1 resize-none outline-none text-text-normal py-1.5 placeholder:text-text-muted max-h-[50vh]"
                    rows={1}
                  />
                </div>
                {inputValue.startsWith("/") && (
                  <div className="flex space-x-4 mt-2 pt-2 border-t border-white/5 text-[10px] font-bold text-brand uppercase tracking-widest">
                    <span>/today - Morning Brief</span>
                    <span>/close day - Evening Summary</span>
                  </div>
                )}
              </form>
            </div>
          </>
        )}
      </main>

      {/* Right Sidebar: Expanded Properties for Pro */}
      {view === "chat" && (
        <aside className="w-64 bg-nav flex-shrink-0 border-l border-black/20 flex flex-col overflow-hidden">
          <header className="h-12 flex items-center px-4 border-b border-black/20 font-bold text-white flex-shrink-0 uppercase text-[10px] tracking-widest">
            System Properties
          </header>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section>
              <h4 className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center tracking-widest">
                <AlertCircle size={14} className="mr-2 text-yellow-500" /> Habits Tracker
              </h4>
              <div className="space-y-2">
                {["Meditated", "Workout", "Deep Work"].map(habit => (
                  <label key={habit} className="flex items-center justify-between text-sm text-text-normal group cursor-pointer">
                    <span>{habit}</span>
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-sidebar accent-brand" />
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center tracking-widest">
                <Cpu size={14} className="mr-2 text-brand" /> Memory Layer
              </h4>
              <div className="p-3 bg-sidebar/50 rounded-lg text-[11px] text-text-muted leading-relaxed border border-white/5">
                AI agents have accessed <span className="text-white font-bold">142</span> related notes to optimize your focus.
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-text-muted uppercase mb-3 flex items-center tracking-widest">
                <Tag size={14} className="mr-2" /> Classifiers
              </h4>
              <div className="flex flex-wrap gap-2">
                {["#system", "#obsidian", "#workflow"].map(tag => (
                  <span key={tag} className="text-[10px] text-brand font-bold bg-brand/10 px-2 py-1 rounded uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </aside>
      )}
    </div>
  );
}
