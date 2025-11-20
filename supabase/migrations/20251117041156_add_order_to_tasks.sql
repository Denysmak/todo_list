/*
  # Add order column to tasks table

  1. Changes
    - Add `order` column to `tasks` table (integer, not null, default 0)
    - Create index on `order` column for better query performance
    - Update existing tasks to have sequential order based on creation date
  
  2. Notes
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Sets default value to 0 for new tasks
    - Orders existing tasks by created_at to maintain current order
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'order'
  ) THEN
    ALTER TABLE tasks ADD COLUMN "order" integer NOT NULL DEFAULT 0;
    
    CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks("order");
    
    WITH ordered_tasks AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) as row_num
      FROM tasks
    )
    UPDATE tasks
    SET "order" = ordered_tasks.row_num
    FROM ordered_tasks
    WHERE tasks.id = ordered_tasks.id;
  END IF;
END $$;