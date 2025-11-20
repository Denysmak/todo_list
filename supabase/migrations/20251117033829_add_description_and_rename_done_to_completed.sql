/*
  # Atualização da estrutura da tabela tasks

  1. Alterações na tabela `tasks`
    - Adiciona coluna `description` (text) para descrição detalhada da tarefa
    - Renomeia coluna `done` para `completed` para melhor semântica
  
  2. Notas importantes
    - A renomeação mantém todos os dados existentes
    - A coluna description permite valores nulos (opcional)
*/

-- Adicionar coluna description
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'description'
  ) THEN
    ALTER TABLE tasks ADD COLUMN description text DEFAULT '';
  END IF;
END $$;

-- Renomear coluna done para completed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'done'
  ) THEN
    ALTER TABLE tasks RENAME COLUMN done TO completed;
  END IF;
END $$;

-- Atualizar índice se necessário
DROP INDEX IF EXISTS idx_tasks_done;
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);