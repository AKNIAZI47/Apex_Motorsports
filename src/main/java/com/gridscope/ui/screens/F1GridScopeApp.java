package com.gridscope.ui.screens;

import com.gridscope.repository.DatabaseConnectionProvider;
import com.gridscope.ui.AppContext;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Side;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.net.URL;
import java.sql.Connection;

public class F1GridScopeApp extends Application {

    private AppContext appContext;

    @Override
    public void start(Stage stage) {
        DatabaseConnectionProvider connectionProvider = new DatabaseConnectionProvider();
        appContext = new AppContext(connectionProvider);

        SeasonDashboard dashboard = new SeasonDashboard(appContext);
        GridView gridView = new GridView(appContext);
        DriverProfile driverProfile = new DriverProfile(appContext);
        ConstructorProfile ctorProfile = new ConstructorProfile(appContext);
        NewsPanel newsPanel = new NewsPanel();

        TabPane tabPane = new TabPane(
                tab("Season Dashboard", dashboard),
                tab("Grid View", gridView),
                tab("Driver Profile", driverProfile),
                tab("Constructor", ctorProfile),
                tab("F1 News", newsPanel)
        );
        tabPane.setSide(Side.LEFT);
        tabPane.setTabClosingPolicy(TabPane.TabClosingPolicy.UNAVAILABLE);

        Label appName = new Label("F1 GridScope");
        appName.getStyleClass().add("f1-app-title");

        Label appTagline = new Label("Season intelligence, standings, and grid analytics");
        appTagline.getStyleClass().add("f1-app-tagline");

        VBox mastheadText = new VBox(3, appName, appTagline);
        mastheadText.setFillWidth(true);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        HBox masthead = new HBox(12, mastheadText, spacer);
        masthead.setPadding(new Insets(16, 18, 14, 18));
        masthead.getStyleClass().add("f1-masthead");

        BorderPane shell = new BorderPane();
        shell.setTop(masthead);
        shell.setCenter(tabPane);

        Label watermark = new Label("F1");
        watermark.getStyleClass().add("f1-watermark");

        StackPane root = new StackPane(shell, watermark);
        root.setPickOnBounds(false);

        Scene scene = new Scene(root, 1480, 900);
        stage.setMinWidth(1280);
        stage.setMinHeight(800);

        URL cssUrl = getClass().getResource("/dark-theme.css");
        if (cssUrl == null) {
            throw new IllegalStateException("dark-theme.css not found in classpath. " +
                    "Run 'mvn compile' to copy resources.");
        }
        scene.getStylesheets().add(cssUrl.toExternalForm());

        stage.setScene(scene);
        stage.setTitle("F1 GridScope");
        stage.show();

        new Thread(() -> {
            try (Connection conn = connectionProvider.getConnection()) {
                Platform.runLater(() -> stage.setTitle("F1 GridScope — Connected"));
                new Thread(() -> {
                    try {
                        com.gridscope.service.DataSyncService sync =
                                new com.gridscope.service.DataSyncService(connectionProvider);
                        int currentYear = java.time.Year.now().getValue();
                        for (int y = 2020; y <= currentYear + 1; y++) {
                            final int year = y;
                            Platform.runLater(() -> stage.setTitle("F1 GridScope — Syncing " + year + "…"));
                            sync.syncYear(year);
                        }
                        Platform.runLater(() -> stage.setTitle("F1 GridScope — Ready"));
                    } catch (Exception e) {
                        Platform.runLater(() -> stage.setTitle("F1 GridScope — Sync error: " + e.getMessage()));
                    }
                }).start();
            } catch (Exception e) {
                Platform.runLater(() -> stage.setTitle("F1 GridScope — DB connection failed"));
            }
        }).start();
    }

    @Override
    public void stop() {
    }

    public static void main(String[] args) { launch(args); }

    private static Tab tab(String title, javafx.scene.Node content) {
        Tab t = new Tab(title, content);
        t.setClosable(false);
        return t;
    }
}
