/*
  # Criar usuário demo

  1. Alterações
    - Insere usuário demo com ID fixo para desenvolvimento/testes
    - Permite que a aplicação funcione sem autenticação real
  
  2. Notas importantes
    - Este usuário é apenas para propósitos de demonstração
    - O email e senha são fictícios
    - Usa ON CONFLICT para evitar erros se já existir
*/

-- Criar usuário demo
INSERT INTO users (id, email, password_hash) 
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@example.com', 'demo_hash') 
ON CONFLICT (id) DO NOTHING;