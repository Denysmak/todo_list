'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (taskData: { title: string; description: string; scheduledFor?: Date | null }) => Promise<void>;
}

export function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await onAdd({ title, description, scheduledFor });
    setLoading(false);
    setTitle('');
    setDescription('');
    setScheduledFor(undefined);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setScheduledFor(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Adicionar Nova Tarefa
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Título da Tarefa
            </Label>
            <Input
              id="title"
              placeholder="O que você precisa fazer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              placeholder="Adicione mais detalhes (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledFor" className="text-sm font-medium">
              Data Agendada (Opcional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-left font-normal",
                    !scheduledFor && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledFor ? format(scheduledFor, 'dd/MM/yyyy') : "Escolher data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledFor}
                  onSelect={setScheduledFor}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Adicionar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
