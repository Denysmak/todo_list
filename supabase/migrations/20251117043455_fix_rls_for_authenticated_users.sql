/*
  # Corrigir RLS para isolamento adequado por usuário
  
  1. Alterações
    - Remove políticas de modo demo que permitem acesso a todas as tarefas
    - Cria novas políticas que isolam tarefas por usuário autenticado
    - Garante que cada usuário veja apenas suas próprias tarefas
  
  2. Segurança
    - SELECT: usuários podem ver apenas suas próprias tarefas
    - INSERT: usuários podem criar tarefas apenas para si mesmos
    - UPDATE: usuários podem atualizar apenas suas próprias tarefas
    - DELETE: usuários podem deletar apenas suas próprias tarefas
  
  3. Notas importantes
    - Usa auth.uid() para identificar o usuário autenticado
    - Remove configurações de modo demo
    - Implementa isolamento completo entre usuários
*/

-- Remove políticas antigas de modo demo
DROP POLICY IF EXISTS "Allow anonymous read tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous insert tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous delete tasks" ON tasks;

-- Cria políticas que isolam tarefas por usuário autenticado
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
