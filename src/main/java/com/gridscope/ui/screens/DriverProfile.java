package com.gridscope.ui.screens;

import com.gridscope.model.Driver;
import com.gridscope.model.StandingEntry;
import com.gridscope.ui.AppContext;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.ListView;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;

import java.util.List;

public class DriverProfile extends BorderPane {

    private final AppContext appContext;
    private final ComboBox<Integer> yearCombo;
    private final ListView<Driver> driverList;
    private final VBox detailPane;
    private final Label statusLabel;
    private final ProgressIndicator progressIndicator;

    public DriverProfile(AppContext appContext) {
        this.appContext = appContext;

        yearCombo = new ComboBox<>();
        yearCombo.getItems().addAll(appContext.getSeasonService().getAvailableYears());
        if (!yearCombo.getItems().isEmpty()) {
            yearCombo.getSelectionModel().select(0);
        }

        statusLabel = new Label("Select a driver");
        progressIndicator = new ProgressIndicator();
        progressIndicator.setMaxSize(24, 24);
        progressIndicator.setVisible(false);

        HBox header = new HBox(10, new Label("Season:"), yearCombo, progressIndicator, statusLabel);
        header.setPadding(new Insets(10));
        setTop(header);

        driverList = new ListView<>();
        driverList.setCellFactory(list -> new ListCell<>() {
            @Override
            protected void updateItem(Driver driver, boolean empty) {
                super.updateItem(driver, empty);
                setText(empty || driver == null ? null : driver.getFullName());
            }
        });
        driverList.setPrefWidth(220);
        setLeft(driverList);

        detailPane = new VBox(12);
        detailPane.setPadding(new Insets(20));
        detailPane.setAlignment(Pos.TOP_CENTER);
        setCenter(detailPane);

        yearCombo.setOnAction(event -> loadDrivers());
        driverList.getSelectionModel().selectedItemProperty().addListener((obs, old, selected) -> {
            if (selected != null) {
                showDriverDetail(selected, yearCombo.getValue());
            }
        });

        if (yearCombo.getValue() != null) {
            loadDrivers();
        }
    }

    private void loadDrivers() {
        Integer year = yearCombo.getValue();
        if (year == null) {
            return;
        }

        progressIndicator.setVisible(true);
        new Thread(() -> {
            try {
                List<Driver> drivers = appContext.getSeasonService().getDriversForSeason(year);
                Platform.runLater(() -> {
                    driverList.getItems().setAll(drivers);
                    statusLabel.setText(drivers.size() + " drivers");
                    if (!drivers.isEmpty()) {
                        driverList.getSelectionModel().select(0);
                    }
                });
            } catch (Exception exception) {
                Platform.runLater(() -> statusLabel.setText("Failed: " + exception.getMessage()));
            } finally {
                Platform.runLater(() -> progressIndicator.setVisible(false));
            }
        }).start();
    }

    private void showDriverDetail(Driver driver, int year) {
        detailPane.getChildren().clear();
        progressIndicator.setVisible(true);

        new Thread(() -> {
            try {
                StandingEntry standing = appContext.getSeasonService().getDriverStanding(year, driver.getDriverId());

                Platform.runLater(() -> {
                    detailPane.getChildren().clear();

                    VBox card = new VBox(10);
                    card.getStyleClass().add("f1-card");
                    card.setAlignment(Pos.TOP_CENTER);
                    card.setMaxWidth(320);

                    Label codeLabel = new Label(driver.getCode() == null || driver.getCode().isBlank() ? "---" : driver.getCode());
                    codeLabel.setTextFill(teamColor(driver));
                    codeLabel.setMinSize(120, 120);
                    codeLabel.setAlignment(Pos.CENTER);
                    codeLabel.getStyleClass().add("f1-driver-number");
                    card.getChildren().add(codeLabel);

                    Label heading = new Label(driver.getFullName());
                    heading.getStyleClass().add("f1-section-title");

                    HBox numberRow = createStatRow("Car number", driver.getPermanentNumber() == null ? "No number" : "#" + driver.getPermanentNumber());
                    HBox nationalityRow = createStatRow("Nationality", driver.getNationality());
                    HBox teamRow = createStatRow("Team", driver.getTeamName());

                    if (standing != null) {
                        HBox championshipRow = createStatRow("Championship", "P" + standing.getPosition() + " — " + standing.getPoints() + " pts");
                        card.getChildren().add(championshipRow);
                    }

                    card.getChildren().addAll(heading, numberRow, nationalityRow, teamRow);
                    detailPane.getChildren().add(card);
                });
            } catch (Exception exception) {
                Platform.runLater(() -> detailPane.getChildren().setAll(new Label("Failed to load driver details: " + exception.getMessage())));
            } finally {
                Platform.runLater(() -> progressIndicator.setVisible(false));
            }
        }).start();
    }

    private Color teamColor(Driver driver) {
        String teamName = driver.getTeamName();
        if (teamName == null) {
            return Color.WHITE;
        }

        return switch (teamName.toLowerCase()) {
            case "red bull racing", "oracle red bull racing" -> Color.web("#1e41ff");
            case "ferrari", "scuderia ferrari" -> Color.web("#dc0000");
            case "mercedes", "mercedes-amg petronas formula one team" -> Color.web("#00d2be");
            case "mclaren", "mclaren f1 team" -> Color.web("#ff8700");
            case "aston martin", "aston martin aramco formula one team" -> Color.web("#006f62");
            case "alpine", "bwt alpine f1 team" -> Color.web("#0090ff");
            case "williams", "williams racing" -> Color.web("#005aff");
            case "rb", "visa cash app rb", "visa cash app rb f1 team", "alphatauri", "scuderia alphatauri" -> Color.web("#6692ff");
            case "haas", "moneygram haas f1 team" -> Color.web("#ffffff");
            case "sauber", "kick sauber", "stake f1 team kick sauber" -> Color.web("#00e701");
            default -> Color.web("#e94560");
        };
    }

    private HBox createStatRow(String labelText, String valueText) {
        Label label = new Label(labelText + ":");
        label.getStyleClass().add("f1-stat-label");

        Label value = new Label(valueText == null || valueText.isBlank() ? "—" : valueText);
        value.getStyleClass().add("f1-stat-value");

        HBox row = new HBox(8, label, value);
        row.setAlignment(Pos.CENTER_LEFT);
        return row;
    }
}
