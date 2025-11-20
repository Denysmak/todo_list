'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { AddTaskModal } from '@/components/AddTaskModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  created_at: string;
  scheduled_for?: string | null;
  order: number;
}

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (taskData: { title: string; description: string; scheduledFor?: Date | null }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        await fetchTasks();
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    try {
      const response = await fetch(`/api/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      await fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      await fetchTasks();
    }
  };

  const handleScheduleTask = async (taskId: string, date: Date | null) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ scheduledFor: date }),
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error scheduling task:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent, taskList: Task[]) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = taskList.findIndex((task) => task.id === active.id);
    const newIndex = taskList.findIndex((task) => task.id === over.id);

    const reorderedTasks = arrayMove(taskList, oldIndex, newIndex);
    const updatedTasks = reorderedTasks.map((task, index) => ({
      ...task,
      order: index + 1,
    }));

    const isActive = !taskList[oldIndex].completed;
    if (isActive) {
      setTasks((prev) => [
        ...updatedTasks,
        ...prev.filter((t) => t.completed),
      ]);
    } else {
      setTasks((prev) => [
        ...prev.filter((t) => !t.completed),
        ...updatedTasks,
      ]);
    }

    try {
      await fetch('/api/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          taskOrders: updatedTasks.map(({ id, order }) => ({ id, order })),
        }),
      });
    } catch (error) {
      console.error('Error reordering tasks:', error);
      await fetchTasks();
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      router.push('/login');
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Tarefa
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Carregando tarefas...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Tarefas Ativas ({activeTasks.length})
              </h2>
              <div className="space-y-3">
                {activeTasks.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                    <p className="text-slate-500">Nenhuma tarefa ativa. Adicione uma para começar!</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, activeTasks)}
                  >
                    <SortableContext
                      items={activeTasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {activeTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleToggleComplete}
                          onDelete={handleDeleteTask}
                          onSchedule={handleScheduleTask}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            </div>

            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  Concluídas ({completedTasks.length})
                </h2>
                <div className="space-y-3">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, completedTasks)}
                  >
                    <SortableContext
                      items={completedTasks.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {completedTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggle={handleToggleComplete}
                          onDelete={handleDeleteTask}
                          onSchedule={handleScheduleTask}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddTask}
      />
    </div>
  );
}
