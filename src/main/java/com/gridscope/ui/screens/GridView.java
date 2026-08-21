package com.gridscope.ui.screens;

import com.gridscope.model.Driver;
import com.gridscope.model.StandingEntry;
import com.gridscope.ui.AppContext;
import javafx.animation.FadeTransition;
import javafx.animation.ScaleTransition;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.ScrollPane;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Circle;
import javafx.util.Duration;

import java.util.List;

public class GridView extends VBox {

    private final AppContext appContext;
    private final ComboBox<Integer> yearCombo;
    private final FlowPane gridPane;
    private final Label statusLabel;
    private final ProgressIndicator progressIndicator;

    public GridView(AppContext appContext) {
        this.appContext = appContext;
        setSpacing(10);
        setPadding(new Insets(10));

        yearCombo = new ComboBox<>();
        yearCombo.getItems().addAll(appContext.getSeasonService().getAvailableYears());
        if (!yearCombo.getItems().isEmpty()) {
            yearCombo.getSelectionModel().select(0);
        }

        statusLabel = new Label("Driver grid for selected season");
        progressIndicator = new ProgressIndicator();
        progressIndicator.setMaxSize(24, 24);
        progressIndicator.setVisible(false);

        HBox header = new HBox(10, new Label("Season:"), yearCombo, progressIndicator, statusLabel);
        header.setAlignment(Pos.CENTER_LEFT);

        gridPane = new FlowPane(15, 15);
        gridPane.setPadding(new Insets(10));
        ScrollPane scrollPane = new ScrollPane(gridPane);
        scrollPane.setFitToWidth(true);

        getChildren().addAll(header, scrollPane);

        yearCombo.setOnAction(event -> loadGrid());
        if (yearCombo.getValue() != null) {
            loadGrid();
        }
    }

    private void loadGrid() {
        Integer year = yearCombo.getValue();
        if (year == null) {
            return;
        }

        progressIndicator.setVisible(true);
        statusLabel.setText("Loading grid for " + year + "...");

        new Thread(() -> {
            try {
                List<Driver> drivers = appContext.getSeasonService().getDriversForSeason(year);
                Platform.runLater(() -> renderGrid(drivers, year));
            } catch (Exception exception) {
                Platform.runLater(() -> statusLabel.setText("Failed: " + exception.getMessage()));
            } finally {
                Platform.runLater(() -> progressIndicator.setVisible(false));
            }
        }).start();
    }

    private void renderGrid(List<Driver> drivers, int year) {
        gridPane.getChildren().clear();
        for (Driver driver : drivers) {
            StandingEntry standing = appContext.getSeasonService().getDriverStanding(year, driver.getDriverId());
            gridPane.getChildren().add(createDriverCard(driver, standing));
        }
        statusLabel.setText("Showing " + drivers.size() + " drivers for " + year);
    }

    private VBox createDriverCard(Driver driver, StandingEntry standing) {
        VBox card = new VBox(10);
        card.setPadding(new Insets(12, 12, 14, 12));
        card.setAlignment(Pos.TOP_CENTER);
        card.getStyleClass().add("f1-card");

        StackPane avatarPane = new StackPane();
        avatarPane.setPrefSize(104, 104);
        avatarPane.setAlignment(Pos.CENTER);
        avatarPane.getStyleClass().add("f1-driver-avatar-shell");

        StackPane photoBox = createDriverPhotoBox(driver);
        avatarPane.getChildren().add(photoBox);

        String number = driver.getPermanentNumber() == null ? "—" : "#" + driver.getPermanentNumber();
        Label numberLabel = new Label(number);
        numberLabel.getStyleClass().add("f1-driver-number");

        Label nameLabel = new Label(driver.getFullName() == null ? "Driver" : driver.getFullName());
        nameLabel.getStyleClass().add("f1-name");
        nameLabel.setWrapText(true);
        nameLabel.setMaxWidth(150);
        nameLabel.setAlignment(Pos.CENTER);

        HBox teamRow = createStatRow("Team", driver.getTeamName());
        HBox nationalityRow = createStatRow("Nationality", driver.getNationality());
        String positionValue = standing == null ? "—" : "P" + standing.getPosition() + " · " + standing.getPoints() + " pts";
        HBox statsRow = createStatRow("Championship", positionValue);

        card.getChildren().addAll(avatarPane, numberLabel, nameLabel, teamRow, nationalityRow, statsRow);
        card.setPrefWidth(180);

        FadeTransition fade = new FadeTransition(Duration.millis(220), card);
        fade.setFromValue(0.0);
        fade.setToValue(1.0);
        fade.play();

        ScaleTransition scale = new ScaleTransition(Duration.millis(160), card);
        scale.setFromX(0.98);
        scale.setFromY(0.98);
        scale.setToX(1.0);
        scale.setToY(1.0);
        scale.play();

        return card;
    }

    private StackPane createDriverPhotoBox(Driver driver) {
        String headshotUrl = driver != null ? driver.getHeadshotUrl() : null;
        if (headshotUrl == null || headshotUrl.isBlank()) {
            return createFallbackAvatar(driver);
        }

        Image image = new Image(headshotUrl, 100, 100, true, true, true);
        if (image.isError()) {
            return createFallbackAvatar(driver);
        }

        ImageView imageView = new ImageView(image);
        imageView.setFitWidth(100);
        imageView.setFitHeight(100);
        imageView.setPreserveRatio(true);
        imageView.setSmooth(true);

        Circle clip = new Circle(50, 50, 48);
        imageView.setClip(clip);

        StackPane photoBox = new StackPane(imageView);
        photoBox.setPrefSize(100, 100);
        photoBox.setMaxSize(100, 100);
        photoBox.getStyleClass().add("f1-driver-photo");
        return photoBox;
    }

    private StackPane createFallbackAvatar(Driver driver) {
        String fallbackNumber = driver != null && driver.getPermanentNumber() != null
                ? String.valueOf(driver.getPermanentNumber())
                : "—";

        Label fallback = new Label(fallbackNumber);
        fallback.getStyleClass().add("f1-driver-number-fallback");

        StackPane photoBox = new StackPane(fallback);
        photoBox.setPrefSize(100, 100);
        photoBox.setMaxSize(100, 100);
        photoBox.getStyleClass().add("f1-driver-photo");
        return photoBox;
    }

    private HBox createStatRow(String labelText, String valueText) {
        Label label = new Label(labelText + ":");
        label.getStyleClass().add("f1-stat-label");

        Label value = new Label(valueText == null || valueText.isBlank() ? "—" : valueText);
        value.getStyleClass().add("f1-stat-value");

        HBox row = new HBox(6, label, value);
        row.setAlignment(Pos.CENTER_LEFT);
        return row;
    }
}
