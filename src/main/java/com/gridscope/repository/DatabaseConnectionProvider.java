package com.gridscope.repository;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DatabaseConnectionProvider {

    private final String url;
    private final String username;
    private final String password;

    public DatabaseConnectionProvider() {
        Properties props = new Properties();
        try (InputStream input = DatabaseConnectionProvider.class.getClassLoader().getResourceAsStream("config.properties")) {
            if (input == null) {
                throw new DatabaseException("config.properties not found on the classpath");
            }
            props.load(input);
        } catch (IOException e) {
            throw new DatabaseException("Failed to load config.properties", e);
        }

        this.url = requireProperty(props, "db.url");
        this.username = requireProperty(props, "db.username");
        this.password = requireProperty(props, "db.password");
    }

    private String requireProperty(Properties props, String key) {
        String value = props.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new DatabaseException("Missing required property '" + key + "' in config.properties");
        }
        return value;
    }

    public Connection getConnection() {
        try {
            return DriverManager.getConnection(url, username, password);
        } catch (SQLException exception) {
            throw new DatabaseException("Failed to open database connection", exception);
        }
    }
}
