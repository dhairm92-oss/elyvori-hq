// FILE: src/components/KanbanBoard.tsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, CheckCircle2, Clock, Zap, AlertTriangle, Inbox, X } from 'lucide-react';
import { Language } from '../types';

const API = 'https://elyvori-api.onrender.com';

interface Task {
  id: string;
  goal: string;
  status: string;
  agentName: string;
  agentType: string;
  createdBy: string;
  createdAt: string;
  lastRun: { status: string; startedAt: string; completedAt?: string } | null;
}

interface KanbanData {
  columns: Record<string, Task[]>;
  summary: Record<string, number>;
  total: number;
}

const COLUMNS = [
  { key: 'RECEIVED', label: 'Received', labelAr: 'مستلم', icon: Inbox, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  { key: 'QUALIFICATION', label: 'Qualifying', labelAr: 'تأهيل', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { key: 'EXECUTION', label: 'In Progress', labelAr: 'قيد التنفيذ', icon: Zap, color: '#00E5FF', bg: 'rgba(0,229,255,0.1)' },
  { key: 'COMPLETED', label: 'Completed', labelAr: 'مكتمل', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { key: 'FAILED', label: 'Failed', labelAr: 'فشل', icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
];

interface Props {
  lang: Language;
  token: string;
}

export function KanbanBoard({ lang, token }: Props) {
  const [data, setData] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const [adding, setAdding] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const isRtl = lang === 'ar';

  const fetchKanban = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tasks/kanban`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKanban();
    // Manual refresh only
  }, [fetchKanban]);

  const addTask = async () => {
    if (!newGoal.trim()) return;
    setAdding(true);
    try {
      await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ goal: newGoal }),
      });
      setNewGoal('');
      await fetchKanban();
    } finally {
      setAdding(false);
    }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`${API}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchKanban();
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`${API}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchKanban();
    } catch (e) { console.error(e); }
  };

  const onDragStart = (taskId: string) => setDragging(taskId);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (dragging) moveTask(dragging, status);
    setDragging(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00E5FF] border-t-transparent" />
    </div>
  );

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: "'Cairo','Inter',sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isRtl ? 'لوحة المهام' : 'Task Matrix'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {data?.total ?? 0} {isRtl ? 'مهمة' : 'tasks'}
          </p>
        </div>
        <button onClick={fetchKanban} className="p-2 rounded-lg text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Add Task */}
      <div className="flex gap-3 mb-6">
        <input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder={isRtl ? 'أضف مهمة جديدة...' : 'Add a new task...'}
          className="flex-1 bg-[#0F1120] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#00E5FF]/40"
        />
        <button
          onClick={addTask}
          disabled={adding}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-black transition-all"
          style={{ background: 'linear-gradient(135deg, #00E5FF, #7C3AED)' }}
        >
          <Plus className="h-4 w-4" />
          {isRtl ? 'إضافة' : 'Add'}
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const tasks = data?.columns[col.key] ?? [];
          return (
            <div
              key={col.key}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.key)}
              className="flex flex-col rounded-2xl p-3 min-h-[200px]"
              style={{ background: 'rgba(15,17,26,0.6)', border: `1px solid ${col.color}30` }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg" style={{ background: col.bg }}>
                    <Icon className="h-3.5 w-3.5" style={{ color: col.color }} />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {isRtl ? col.labelAr : col.label}
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{ background: col.bg, color: col.color }}>
                  {tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 flex-1">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => onDragStart(task.id)}
                    className="group relative rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-white leading-relaxed mb-2 pr-4">{task.goal}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: col.bg, color: col.color }}>
                        {task.agentName}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-slate-700 text-xs">
                    {isRtl ? 'لا توجد مهام' : 'No tasks'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
