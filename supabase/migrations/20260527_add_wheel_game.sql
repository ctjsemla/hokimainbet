-- Run in Supabase SQL Editor
ALTER TABLE game_scores DROP CONSTRAINT IF EXISTS game_scores_game_check;
ALTER TABLE game_scores ADD CONSTRAINT game_scores_game_check
  CHECK (game IN ('crash', 'dice', 'mines', 'plinko', 'wheel', 'keno'));
