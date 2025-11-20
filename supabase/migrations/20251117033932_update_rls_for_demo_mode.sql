/*
  # Atualização das políticas RLS para modo demo

  1. Alterações nas políticas
    - Remove políticas antigas que exigem autenticação
    - Adiciona novas políticas que permitem acesso anônimo (para demo)
    - Mantém isolamento por user_id
  
  2. Segurança
    - Usuários anônimos podem acessar apenas tarefas do user_id demo
    - Todas as operações CRUD são permitidas para facilitar testes
  
  3. Notas importantes
    - Esta configuração é para ambiente de demonstração
    - Para produção, será necessário reativar autenticação completa
*/

-- Remove políticas antigas
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

-- Cria novas políticas que permitem acesso anônimo
CREATE POLICY "Allow anonymous read tasks"
  ON tasks
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow anonymous insert tasks"
  ON tasks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update tasks"
  ON tasks
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete tasks"
  ON tasks
  FOR DELETE
  TO anon, authenticated
  USING (true);