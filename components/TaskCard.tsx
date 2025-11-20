'use client';

import { useState } from 'react';
import { RoundCheckbox } from '@/components/RoundCheckbox';
import { MoreVertical, Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  created_at: string;
  scheduled_for?: string | null;
  order: number;
}

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSchedule: (id: string, date: Date | null) => void;
}

export function TaskCard({ task, onToggle, onDelete, onSchedule }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(task.id);
  };

  const handleDateSelect = (date: Date | undefined) => {
    onSchedule(task.id, date || null);
    setIsCalendarOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-slate-100",
        isDeleting && "opacity-50",
        isDragging && "shadow-xl scale-105 z-50"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          className="pt-0.5 touch-none cursor-grab active:cursor-grabbing hover:bg-slate-100 rounded p-1 transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5 text-slate-400" />
        </button>
        <div className="flex items-center">
          <RoundCheckbox
            checked={task.completed}
            onChange={() => onToggle(task.id)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-slate-900 mb-1 text-base leading-snug",
            task.completed && "line-through text-slate-400"
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className={cn(
              "text-sm text-slate-600 mb-1",
              task.completed && "line-through text-slate-400"
            )}>
              {task.description}
            </p>
          )}
          {task.scheduled_for && (
            <p className="text-xs text-slate-500">
              📅 {format(new Date(task.scheduled_for), 'dd/MM/yyyy')}
            </p>
          )}
        </div>
        {task.scheduled_for && (
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                className="flex flex-col items-center justify-center w-10 h-10 hover:bg-slate-100 rounded-lg transition-colors text-xs"
              >
                <span className="text-[10px] text-slate-500 font-medium leading-none">
                  {format(new Date(task.scheduled_for), 'MMM').toUpperCase()}
                </span>
                <span className="text-base font-semibold text-slate-700 leading-none mt-0.5">
                  {format(new Date(task.scheduled_for), 'd')}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={task.scheduled_for ? new Date(task.scheduled_for) : undefined}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
