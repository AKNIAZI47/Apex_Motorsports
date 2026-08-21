package com.gridscope.ui.screens;

import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Cursor;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.VBox;
import javafx.scene.Scene;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.text.Text;
import javafx.scene.text.TextFlow;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Modality;
import javafx.stage.Stage;

import java.util.List;

public class NewsPanel extends ScrollPane {

    private final VBox content = new VBox(10);

    public NewsPanel() {
        setFitToWidth(true);
        setHbarPolicy(ScrollBarPolicy.NEVER);
        setVbarPolicy(ScrollBarPolicy.AS_NEEDED);
        setPadding(new Insets(10));
        content.setPadding(new Insets(8, 8, 16, 8));
        setContent(content);

        loadArticles();
    }

    private void loadArticles() {
        new Thread(() -> {
            List<F1NewsService.NewsArticle> articles = F1NewsService.fetchLatest(12);
            Platform.runLater(() -> renderArticles(articles));
        }).start();
    }

    private void renderArticles(List<F1NewsService.NewsArticle> articles) {
        content.getChildren().clear();

        if (articles == null || articles.isEmpty()) {
            Label empty = new Label("No F1 news items available right now.");
            empty.getStyleClass().add("f1-empty-state");
            content.getChildren().add(empty);
            return;
        }

        for (F1NewsService.NewsArticle article : articles) {
            VBox card = new VBox(8);
            card.setPadding(new Insets(14, 16, 14, 16));
            card.setSpacing(8);
            card.getStyleClass().add("f1-card");

            Label title = new Label(article.title());
            title.setWrapText(true);
            title.setMaxWidth(Double.MAX_VALUE);
            title.setFont(Font.font("Segoe UI", FontWeight.BOLD, 18));
            title.setStyle("-fx-text-fill: #ffffff;");

            Label published = new Label(formatDate(article.publishedAt()));
            published.getStyleClass().add("f1-stat-label");

            Text summaryText = new Text(stripHtml(article.summary()));
            summaryText.setStyle("-fx-fill: #d9d9f6; -fx-font-size: 13px;");
            TextFlow summary = new TextFlow(summaryText);
            summary.setLineSpacing(2);

            Hyperlink openLink = new Hyperlink("Read in app");
            openLink.setCursor(Cursor.HAND);
            openLink.setOnAction(event -> openInApp(article.title(), article.link()));
            openLink.setStyle("-fx-text-fill: #ff5c76; -fx-font-weight: bold;");

            card.getChildren().addAll(title, published, summary, openLink);
            content.getChildren().add(card);
        }
    }

    private void openInApp(String title, String url) {
        if (url == null || url.isBlank()) {
            return;
        }

        Stage stage = new Stage();
        stage.setTitle(title == null || title.isBlank() ? "F1 News" : title);
        stage.initModality(Modality.NONE);
        stage.setMinWidth(900);
        stage.setMinHeight(700);

        WebView webView = new WebView();
        WebEngine engine = webView.getEngine();
        engine.load(url);

        stage.setScene(new Scene(webView, 960, 720));
        stage.show();
    }

    private String stripHtml(String content) {
        if (content == null) {
            return "";
        }
        return content.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").trim();
    }

    private String formatDate(String input) {
        return F1NewsService.formatPublishedDate(input);
    }
}
