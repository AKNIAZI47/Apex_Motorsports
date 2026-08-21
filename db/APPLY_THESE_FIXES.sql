-- ================================================================
-- Run THIS file on your existing database to apply all fixes.
-- Command: mysql -u root -p F1GRIDSPEC < db/APPLY_THESE_FIXES.sql
-- ================================================================

-- Fix 1: circuit_outlines column too small (TEXT = 64KB, need MEDIUMTEXT)
ALTER TABLE circuit_outlines MODIFY COLUMN points_json MEDIUMTEXT;

-- Fix 2: confirm unique constraints exist (safe to re-run)
SET @idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'race_results'
      AND index_name = 'uq_rr_race_driver'
);
SET @sql := IF(@idx_exists > 0,
    'ALTER TABLE race_results DROP INDEX uq_rr_race_driver',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
CREATE UNIQUE INDEX uq_rr_race_driver
    ON race_results (race_id, driver_id);

SET @idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'standings_driver'
      AND index_name = 'uq_sd'
);
SET @sql := IF(@idx_exists > 0,
    'ALTER TABLE standings_driver DROP INDEX uq_sd',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
CREATE UNIQUE INDEX uq_sd
    ON standings_driver (season_year, driver_id);

SET @idx_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'standings_constructor'
      AND index_name = 'uq_sc'
);
SET @sql := IF(@idx_exists > 0,
    'ALTER TABLE standings_constructor DROP INDEX uq_sc',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
CREATE UNIQUE INDEX uq_sc
    ON standings_constructor (season_year, constructor_id);

-- Fix 3: clear any cached circuit outlines that are corrupt/empty
-- (they will be re-fetched and saved correctly next time you Load Replay)
DELETE FROM circuit_outlines WHERE points_json IS NULL OR points_json = '[]' OR points_json = '';

SELECT 'All fixes applied successfully.' AS status;
