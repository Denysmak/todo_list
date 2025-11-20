/*
  # Migrar para Supabase Auth
  
  1. Alterações
    - Remove a tabela customizada `public.users`
    - Atualiza a foreign key da tabela `tasks` para referenciar `auth.users`
    - Remove políticas RLS antigas da tabela `users`
    - Atualiza políticas da tabela `tasks` para usar `auth.uid()`
  
  2. Segurança
    - Mantém isolamento completo entre usuários
    - Usa a tabela oficial `auth.users` do Supabase
    - Políticas RLS baseadas em `auth.uid()`
  
  3. Notas importantes
    - Esta migração remove a duplicação de tabelas de usuários
    - Todos os usuários devem ser recriados após esta migração
    - A autenticação agora usa exclusivamente Supabase Auth
*/

-- Remove todas as tarefas existentes (devido ao demo user que não existe em auth.users)
DELETE FROM tasks;

-- Remove políticas antigas da tabela tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Remove a constraint antiga
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- Remove a tabela customizada de usuários
DROP TABLE IF EXISTS users CASCADE;

-- Adiciona nova constraint apontando para auth.users
ALTER TABLE tasks 
  ADD CONSTRAINT tasks_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Recria políticas RLS usando auth.uid()
CREATE POLICY "Users can view own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
