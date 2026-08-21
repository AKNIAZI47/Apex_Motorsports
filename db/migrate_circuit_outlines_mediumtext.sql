-- circuit_outlines.points_json can exceed TEXT (64KB) for 800 normalized GPS points
ALTER TABLE circuit_outlines MODIFY COLUMN points_json MEDIUMTEXT;
