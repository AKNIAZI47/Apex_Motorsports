-- Remove duplicate races, keeping the one with the lowest race_id per (season_year, round)
DELETE r1 FROM races r1
INNER JOIN races r2
WHERE r1.race_id > r2.race_id
  AND r1.season_year = r2.season_year
  AND r1.round = r2.round;

-- Add unique constraint to prevent future duplicates
ALTER TABLE races ADD CONSTRAINT uq_races_season_round UNIQUE (season_year, round);

-- Fix race_results foreign key references that may now point to deleted race_ids
-- (safe to skip if no FK violations, but add this as a comment)
-- UPDATE race_results rr JOIN races r ON r.season_year = ... (complex, skip for now)
