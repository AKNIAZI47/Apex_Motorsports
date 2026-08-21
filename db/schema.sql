-- F1 GridScope — canonical schema
-- Run once on a fresh database: mysql -u root -p gridscope < db/schema.sql
-- To apply to existing DB run the migrate_*.sql files in db/ first.

CREATE TABLE IF NOT EXISTS seasons (
    year                INT         PRIMARY KEY,
    champion_driver     VARCHAR(100),
    champion_constructor VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS drivers (
    driver_id       VARCHAR(50)  PRIMARY KEY,
    full_name       VARCHAR(100),
    nationality     VARCHAR(50),
    driver_number   INT,
    headshot_url    VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS constructors (
    constructor_id  VARCHAR(50)  PRIMARY KEY,
    name            VARCHAR(100),
    nationality     VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS races (
    race_id         INT          AUTO_INCREMENT PRIMARY KEY,
    season_year     INT,
    round           INT,
    race_name       VARCHAR(100),
    circuit_name    VARCHAR(100),
    race_date       DATE,
    CONSTRAINT fk_races_season   FOREIGN KEY (season_year) REFERENCES seasons(year),
    CONSTRAINT uq_races_round    UNIQUE (season_year, round)
);

CREATE TABLE IF NOT EXISTS race_results (
    id              INT          AUTO_INCREMENT PRIMARY KEY,
    race_id         INT,
    driver_id       VARCHAR(50),
    constructor_id  VARCHAR(50),
    grid_position   INT,
    finish_position INT,
    points          DECIMAL(5,1),
    status          VARCHAR(50),
    fastest_lap     BOOLEAN,
    CONSTRAINT fk_rr_race        FOREIGN KEY (race_id)        REFERENCES races(race_id),
    CONSTRAINT fk_rr_driver      FOREIGN KEY (driver_id)      REFERENCES drivers(driver_id),
    CONSTRAINT fk_rr_constructor FOREIGN KEY (constructor_id) REFERENCES constructors(constructor_id),
    CONSTRAINT uq_rr_race_driver UNIQUE (race_id, driver_id)
);

CREATE TABLE IF NOT EXISTS standings_driver (
    season_year     INT,
    driver_id       VARCHAR(50),
    points          DECIMAL(6,1),
    position        INT,
    CONSTRAINT fk_sd_season  FOREIGN KEY (season_year) REFERENCES seasons(year),
    CONSTRAINT fk_sd_driver  FOREIGN KEY (driver_id)   REFERENCES drivers(driver_id),
    CONSTRAINT uq_sd         UNIQUE (season_year, driver_id)
);

CREATE TABLE IF NOT EXISTS standings_constructor (
    season_year     INT,
    constructor_id  VARCHAR(50),
    points          DECIMAL(6,1),
    position        INT,
    CONSTRAINT fk_sc_season      FOREIGN KEY (season_year)     REFERENCES seasons(year),
    CONSTRAINT fk_sc_constructor FOREIGN KEY (constructor_id)  REFERENCES constructors(constructor_id),
    CONSTRAINT uq_sc             UNIQUE (season_year, constructor_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    session_key     INT          PRIMARY KEY,
    race_id         INT,
    session_type    VARCHAR(20),
    circuit_key     INT
);

CREATE TABLE IF NOT EXISTS circuit_outlines (
    circuit_key     INT          PRIMARY KEY,
    -- MEDIUMTEXT holds up to 16MB; TEXT (64KB) overflows for 800 GPS points
    points_json     MEDIUMTEXT
);

CREATE TABLE IF NOT EXISTS race_incidents (
    id              INT          AUTO_INCREMENT PRIMARY KEY,
    race_id         INT,
    description     TEXT,
    type            VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS penalties (
    id              INT          AUTO_INCREMENT PRIMARY KEY,
    race_id         INT,
    driver_id       VARCHAR(50),
    description     TEXT
);
