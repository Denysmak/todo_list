/*
  # Adicionar campo de data agendada às tarefas

  1. Alterações
    - Adiciona coluna `scheduled_for` na tabela `tasks`
    - Permite que usuários agendem tarefas para datas específicas
    - Campo é opcional (nullable)
  
  2. Detalhes
    - `scheduled_for` (timestamp with time zone, nullable) - Data/hora agendada para a tarefa
*/

-- Adicionar coluna scheduled_for à tabela tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'scheduled_for'
  ) THEN
    ALTER TABLE tasks ADD COLUMN scheduled_for timestamptz;
  END IF;
END $$;