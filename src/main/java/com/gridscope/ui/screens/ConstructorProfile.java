package com.gridscope.ui.screens;

import com.gridscope.model.Constructor;
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
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.util.List;

public class ConstructorProfile extends BorderPane {

    private final AppContext appContext;
    private final ComboBox<Integer> yearCombo;
    private final ListView<Constructor> constructorList;
    private final VBox detailPane;
    private final Label statusLabel;
    private final ProgressIndicator progressIndicator;

    public ConstructorProfile(AppContext appContext) {
        this.appContext = appContext;

        yearCombo = new ComboBox<>();
        yearCombo.getItems().addAll(appContext.getSeasonService().getAvailableYears());
        if (!yearCombo.getItems().isEmpty()) {
            yearCombo.getSelectionModel().select(0);
        }

        statusLabel = new Label("Select a constructor");
        progressIndicator = new ProgressIndicator();
        progressIndicator.setMaxSize(24, 24);
        progressIndicator.setVisible(false);

        HBox header = new HBox(10, new Label("Season:"), yearCombo, progressIndicator, statusLabel);
        header.setPadding(new Insets(10));
        setTop(header);

        constructorList = new ListView<>();
        constructorList.setCellFactory(list -> new ListCell<>() {
            @Override
            protected void updateItem(Constructor constructor, boolean empty) {
                super.updateItem(constructor, empty);
                setText(empty || constructor == null ? null : constructor.getName());
            }
        });
        constructorList.setPrefWidth(220);
        setLeft(constructorList);

        detailPane = new VBox(12);
        detailPane.setPadding(new Insets(20));
        detailPane.setAlignment(Pos.TOP_CENTER);
        setCenter(detailPane);

        yearCombo.setOnAction(event -> loadConstructors());
        constructorList.getSelectionModel().selectedItemProperty().addListener((obs, old, selected) -> {
            if (selected != null) {
                showConstructorDetail(selected, yearCombo.getValue());
            }
        });

        if (yearCombo.getValue() != null) {
            loadConstructors();
        }
    }

    private void loadConstructors() {
        Integer year = yearCombo.getValue();
        if (year == null) {
            return;
        }

        progressIndicator.setVisible(true);
        new Thread(() -> {
            try {
                List<Constructor> constructors = appContext.getSeasonService().getConstructorsForSeason(year);
                Platform.runLater(() -> {
                    constructorList.getItems().setAll(constructors);
                    statusLabel.setText(constructors.size() + " constructors");
                    if (!constructors.isEmpty()) {
                        constructorList.getSelectionModel().select(0);
                    }
                });
            } catch (Exception exception) {
                Platform.runLater(() -> statusLabel.setText("Failed: " + exception.getMessage()));
            } finally {
                Platform.runLater(() -> progressIndicator.setVisible(false));
            }
        }).start();
    }

    private void showConstructorDetail(Constructor constructor, int year) {
        detailPane.getChildren().clear();

        StandingEntry standing = appContext.getSeasonService()
                .getConstructorStanding(year, constructor.getConstructorId());

        Label name = new Label(constructor.getName());
        name.setFont(Font.font("System", FontWeight.BOLD, 22));
        name.setTextFill(Color.WHITE);

        Label nationality = new Label(constructor.getNationality() == null ? "" : constructor.getNationality());
        Label id = new Label("ID: " + constructor.getConstructorId());
        id.setTextFill(Color.LIGHTGRAY);

        if (standing != null) {
            Label standingLabel = new Label("Championship: P" + standing.getPosition() + " — " + standing.getPoints() + " pts");
            standingLabel.setTextFill(Color.LIGHTGREEN);
            detailPane.getChildren().add(standingLabel);
        }

        detailPane.getChildren().addAll(name, nationality, id);
    }
}
