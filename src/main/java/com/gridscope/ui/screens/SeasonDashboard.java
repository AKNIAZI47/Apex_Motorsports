package com.gridscope.ui.screens;

import com.gridscope.model.Race;
import com.gridscope.model.SeasonSnapshot;
import com.gridscope.model.StandingEntry;
import com.gridscope.ui.AppContext;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;

import java.util.List;

public class SeasonDashboard extends BorderPane {

    private final AppContext appContext;
    private final ComboBox<Integer> yearCombo;
    private final Label statusLabel;
    private final ProgressIndicator progressIndicator;
    private final TableView<RaceRow> raceTable;
    private final TableView<DriverStandingRow> driverStandingsTable;
    private final TableView<ConstructorStandingRow> constructorStandingsTable;
    private final Label seasonTitle;
    private final Label seasonSubtitle;
    private final HBox championSummary;
    private final HBox metricSummary;

    public SeasonDashboard(AppContext appContext) {
        this.appContext = appContext;

        yearCombo = new ComboBox<>();
        yearCombo.setItems(FXCollections.observableArrayList(appContext.getSeasonService().getAvailableYears()));
        if (!yearCombo.getItems().isEmpty()) {
            yearCombo.getSelectionModel().select(0);
        }

        statusLabel = new Label("Select a season year to load data.");
        progressIndicator = new ProgressIndicator();
        progressIndicator.setVisible(false);
        progressIndicator.setMaxSize(24, 24);

        seasonTitle = new Label("Season Command Center");
        seasonTitle.getStyleClass().add("f1-hero-title");

        seasonSubtitle = new Label("Select a season year to load race calendars and standings.");
        seasonSubtitle.getStyleClass().add("f1-hero-subtitle");

        Label bannerTitle = new Label("F1 GRIDSCOPE");
        bannerTitle.getStyleClass().add("f1-section-title");

        Label bannerSubtitle = new Label("Season intelligence, standings, and grid analytics");
        bannerSubtitle.getStyleClass().add("f1-muted");

        StackPane heroBanner = new StackPane();
        VBox bannerText = new VBox(4, bannerTitle, bannerSubtitle);
        bannerText.setAlignment(Pos.CENTER_LEFT);
        bannerText.setMaxWidth(Double.MAX_VALUE);
        heroBanner.getChildren().add(bannerText);
        heroBanner.setPadding(new Insets(16));
        heroBanner.setAlignment(Pos.CENTER_LEFT);
        heroBanner.setStyle("-fx-background-color: linear-gradient(from 0% 0% to 100% 0%, #e8002d22, transparent, #e8002d22);");

        VBox heroText = new VBox(4, seasonTitle, seasonSubtitle);
        heroText.setFillWidth(true);

        HBox seasonPicker = new HBox(8, new Label("Season:"), yearCombo, progressIndicator);
        seasonPicker.setAlignment(Pos.CENTER_LEFT);

        HBox header = new HBox(16, heroText, seasonPicker);
        header.setPadding(new Insets(14, 16, 12, 16));
        header.setAlignment(Pos.CENTER_LEFT);
        HBox.setHgrow(heroText, Priority.ALWAYS);

        championSummary = new HBox(12);
        championSummary.setPadding(new Insets(0, 16, 12, 16));
        championSummary.setAlignment(Pos.CENTER_LEFT);

        metricSummary = new HBox(12);
        metricSummary.setPadding(new Insets(0, 16, 12, 16));
        metricSummary.setAlignment(Pos.CENTER_LEFT);

        VBox topArea = new VBox(8, heroBanner, header, metricSummary, championSummary, statusLabel);
        topArea.getStyleClass().add("f1-dashboard-shell");
        setTop(topArea);

        raceTable = createRaceTable();
        driverStandingsTable = createDriverStandingsTable();
        constructorStandingsTable = createConstructorStandingsTable();

        Tab calendarTab = new Tab("Race Calendar", createSectionedContent("Race Calendar", raceTable));
        calendarTab.setClosable(false);
        Tab driverTab = new Tab("Driver Standings", createSectionedContent("Driver Standings", driverStandingsTable));
        driverTab.setClosable(false);
        Tab constructorTab = new Tab("Constructor Standings", createSectionedContent("Constructor Standings", constructorStandingsTable));
        constructorTab.setClosable(false);

        TabPane tabPane = new TabPane(calendarTab, driverTab, constructorTab);
        setCenter(tabPane);

        yearCombo.setOnAction(event -> loadSelectedYear());
        if (yearCombo.getValue() != null) {
            loadSelectedYear();
        }
    }

    private void loadSelectedYear() {
        Integer year = yearCombo.getValue();
        if (year == null) {
            return;
        }

        progressIndicator.setVisible(true);
        statusLabel.setText("Loading " + year + " season...");

        new Thread(() -> {
            try {
                SeasonSnapshot snapshot = appContext.getSeasonService().loadSeason(year);
                Platform.runLater(() -> populateTables(snapshot));
            } catch (Exception exception) {
                Platform.runLater(() -> statusLabel.setText("Failed to load season: " + exception.getMessage()));
            } finally {
                Platform.runLater(() -> progressIndicator.setVisible(false));
            }
        }).start();
    }

    private void populateTables(SeasonSnapshot snapshot) {
        raceTable.setItems(FXCollections.observableArrayList(
                snapshot.getRaces().stream().map(RaceRow::from).toList()));
        driverStandingsTable.setItems(FXCollections.observableArrayList(
                snapshot.getDriverStandings().stream().map(DriverStandingRow::from).toList()));
        constructorStandingsTable.setItems(FXCollections.observableArrayList(
                snapshot.getConstructorStandings().stream().map(ConstructorStandingRow::from).toList()));
        populateChampionSummary(snapshot);
        populateMetricSummary(snapshot);
        seasonTitle.setText(snapshot.getYear() + " Season Overview");
        seasonSubtitle.setText("Loaded season data and cached standings for fast tab switching.");
        statusLabel.setText("Loaded " + snapshot.getYear() + " — "
                + snapshot.getRaces().size() + " races, "
                + snapshot.getDriverStandings().size() + " drivers.");
    }

        private void populateChampionSummary(SeasonSnapshot snapshot) {
        championSummary.getChildren().clear();
        championSummary.getChildren().add(createSummaryCard(
            "Driver Champion",
                snapshot.getDriverStandings().isEmpty() ? "—" : safeDriverName(snapshot.getDriverStandings().get(0)),
                snapshot.getDriverStandings().isEmpty() ? "No standings loaded" : "P" + snapshot.getDriverStandings().get(0).getPosition()));
        championSummary.getChildren().add(createSummaryCard(
            "Constructor Champion",
                snapshot.getConstructorStandings().isEmpty() ? "—" : safeConstructorName(snapshot.getConstructorStandings().get(0)),
            snapshot.getConstructorStandings().isEmpty() ? "No standings loaded" : "P" + snapshot.getConstructorStandings().get(0).getPosition()));
        }

        private void populateMetricSummary(SeasonSnapshot snapshot) {
            metricSummary.getChildren().clear();
            metricSummary.getChildren().add(createMetricCard("Races", String.valueOf(snapshot.getRaces().size()), "Calendar entries cached"));
            metricSummary.getChildren().add(createMetricCard("Drivers", String.valueOf(snapshot.getDriverStandings().size()), "Standings loaded"));
            metricSummary.getChildren().add(createMetricCard("Constructors", String.valueOf(snapshot.getConstructorStandings().size()), "Teams available"));
        }

        private VBox createSummaryCard(String labelText, String valueText, String detailText) {
        VBox card = new VBox(4);
        card.getStyleClass().add("f1-card");
            card.setPrefWidth(240);
            card.setMinHeight(92);

        Label label = new Label(labelText);
        label.getStyleClass().add("f1-stat-label");

        Label value = new Label(valueText == null || valueText.isBlank() ? "—" : valueText);
        value.getStyleClass().add("f1-stat-value");

        Label detail = new Label(detailText == null ? "" : detailText);
        detail.getStyleClass().add("f1-stat-label");

        card.getChildren().addAll(label, value, detail);
        card.setAlignment(Pos.CENTER_LEFT);
        return card;
    }

    private VBox createMetricCard(String labelText, String valueText, String detailText) {
        VBox card = new VBox(4);
        card.getStyleClass().addAll("f1-card", "f1-metric-card");
        card.setPrefWidth(180);
        card.setMinHeight(86);

        Label label = new Label(labelText);
        label.getStyleClass().add("f1-stat-label");

        Label value = new Label(valueText == null || valueText.isBlank() ? "—" : valueText);
        value.getStyleClass().add("f1-metric-value");

        Label detail = new Label(detailText == null ? "" : detailText);
        detail.getStyleClass().add("f1-stat-label");

        card.getChildren().addAll(label, value, detail);
        card.setAlignment(Pos.CENTER_LEFT);
        return card;
    }

    private static String safeDriverName(StandingEntry entry) {
        return entry.getDriver() == null ? "—" : entry.getDriver().getFullName();
    }

    private static String safeConstructorName(StandingEntry entry) {
        return entry.getConstructors() == null || entry.getConstructors().isEmpty()
                ? "—"
                : entry.getConstructors().get(0).getName();
    }

        private VBox createSectionedContent(String title, TableView<?> table) {
        Label sectionTitle = new Label(title);
        sectionTitle.getStyleClass().add("f1-section-title");

        VBox container = new VBox(10, sectionTitle, table);
        container.setPadding(new Insets(10));
        container.setFillWidth(true);
        VBox.setVgrow(table, Priority.ALWAYS);
        return container;
        }

    public ComboBox<Integer> getYearCombo() {
        return yearCombo;
    }

    public int getSelectedYear() {
        Integer year = yearCombo.getValue();
        return year == null ? java.time.Year.now().getValue() : year;
    }

    private TableView<RaceRow> createRaceTable() {
        TableView<RaceRow> table = new TableView<>();
        TableColumn<RaceRow, Integer> roundCol = new TableColumn<>("Round");
        roundCol.setCellValueFactory(new PropertyValueFactory<>("round"));
        TableColumn<RaceRow, String> nameCol = new TableColumn<>("Grand Prix");
        nameCol.setCellValueFactory(new PropertyValueFactory<>("raceName"));
        nameCol.setPrefWidth(250);
        TableColumn<RaceRow, String> circuitCol = new TableColumn<>("Circuit");
        circuitCol.setCellValueFactory(new PropertyValueFactory<>("circuitName"));
        circuitCol.setPrefWidth(200);
        TableColumn<RaceRow, String> dateCol = new TableColumn<>("Date");
        dateCol.setCellValueFactory(new PropertyValueFactory<>("date"));
        table.getColumns().addAll(roundCol, nameCol, circuitCol, dateCol);
        return table;
    }

    private TableView<DriverStandingRow> createDriverStandingsTable() {
        TableView<DriverStandingRow> table = new TableView<>();
        TableColumn<DriverStandingRow, Integer> posCol = new TableColumn<>("Pos");
        posCol.setCellValueFactory(new PropertyValueFactory<>("position"));
        TableColumn<DriverStandingRow, String> driverCol = new TableColumn<>("Driver");
        driverCol.setCellValueFactory(new PropertyValueFactory<>("driverName"));
        driverCol.setPrefWidth(200);
        TableColumn<DriverStandingRow, String> teamCol = new TableColumn<>("Team");
        teamCol.setCellValueFactory(new PropertyValueFactory<>("constructorName"));
        teamCol.setPrefWidth(180);
        TableColumn<DriverStandingRow, Double> pointsCol = new TableColumn<>("Points");
        pointsCol.setCellValueFactory(new PropertyValueFactory<>("points"));
        table.getColumns().addAll(posCol, driverCol, teamCol, pointsCol);
        return table;
    }

    private TableView<ConstructorStandingRow> createConstructorStandingsTable() {
        TableView<ConstructorStandingRow> table = new TableView<>();
        TableColumn<ConstructorStandingRow, Integer> posCol = new TableColumn<>("Pos");
        posCol.setCellValueFactory(new PropertyValueFactory<>("position"));
        TableColumn<ConstructorStandingRow, String> nameCol = new TableColumn<>("Constructor");
        nameCol.setCellValueFactory(new PropertyValueFactory<>("constructorName"));
        nameCol.setPrefWidth(250);
        TableColumn<ConstructorStandingRow, Double> pointsCol = new TableColumn<>("Points");
        pointsCol.setCellValueFactory(new PropertyValueFactory<>("points"));
        table.getColumns().addAll(posCol, nameCol, pointsCol);
        return table;
    }

    public static class RaceRow {
        private final int round;
        private final String raceName;
        private final String circuitName;
        private final String date;

        public RaceRow(int round, String raceName, String circuitName, String date) {
            this.round = round;
            this.raceName = raceName;
            this.circuitName = circuitName;
            this.date = date;
        }

        public static RaceRow from(Race race) {
            return new RaceRow(
                    race.getRound() == null ? 0 : race.getRound(),
                    race.getRaceName(),
                    race.getCircuitName(),
                    race.getDate());
        }

        public int getRound() { return round; }
        public String getRaceName() { return raceName; }
        public String getCircuitName() { return circuitName; }
        public String getDate() { return date; }
    }

    public static class DriverStandingRow {
        private final int position;
        private final String driverName;
        private final String constructorName;
        private final double points;

        public DriverStandingRow(int position, String driverName, String constructorName, double points) {
            this.position = position;
            this.driverName = driverName;
            this.constructorName = constructorName;
            this.points = points;
        }

        public static DriverStandingRow from(StandingEntry entry) {
            String driverName = safeDriverName(entry);
            String constructorName = safeConstructorName(entry);
            return new DriverStandingRow(
                    entry.getPosition() == null ? 0 : entry.getPosition(),
                    driverName,
                    constructorName,
                    entry.getPoints() == null ? 0 : entry.getPoints());
        }

        public int getPosition() { return position; }
        public String getDriverName() { return driverName; }
        public String getConstructorName() { return constructorName; }
        public double getPoints() { return points; }
    }

    public static class ConstructorStandingRow {
        private final int position;
        private final String constructorName;
        private final double points;

        public ConstructorStandingRow(int position, String constructorName, double points) {
            this.position = position;
            this.constructorName = constructorName;
            this.points = points;
        }

        public static ConstructorStandingRow from(StandingEntry entry) {
            String name = safeConstructorName(entry);
            return new ConstructorStandingRow(
                    entry.getPosition() == null ? 0 : entry.getPosition(),
                    name,
                    entry.getPoints() == null ? 0 : entry.getPoints());
        }

        public int getPosition() { return position; }
        public String getConstructorName() { return constructorName; }
        public double getPoints() { return points; }
    }
}
