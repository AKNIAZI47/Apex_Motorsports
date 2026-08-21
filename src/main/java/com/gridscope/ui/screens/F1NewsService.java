package com.gridscope.ui.screens;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.DateTimeException;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class F1NewsService {

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private F1NewsService() {
    }

    public static List<NewsArticle> fetchLatest(int limit) {
        try {
            String url = "https://feeds.bbci.co.uk/sport/formula1/rss.xml";
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("User-Agent", "F1GridScope/1.0")
                    .GET()
                    .build();

            HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return Collections.emptyList();
            }

            String body = response.body();
            return parseRss(body, limit);
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return Collections.emptyList();
        }
    }

    private static List<NewsArticle> parseRss(String rssXml, int limit) {
        List<NewsArticle> articles = new ArrayList<>();
        if (rssXml == null || rssXml.isBlank()) {
            return articles;
        }

        String[] itemBlocks = rssXml.split("<item>");
        for (int i = 1; i < itemBlocks.length && articles.size() < limit; i++) {
            String block = itemBlocks[i];
            String title = cleanText(extract(block, "<title>", "</title>"));
            String link = cleanText(extract(block, "<link>", "</link>"));
            String pubDate = cleanText(extract(block, "<pubDate>", "</pubDate>"));
            String desc = cleanText(extract(block, "<description>", "</description>"));
            if (title == null || title.isBlank()) {
                continue;
            }
            articles.add(new NewsArticle(title, stripHtml(desc), link, pubDate));
        }
        return articles;
    }

    private static String cleanText(String value) {
        if (value == null) {
            return null;
        }
        return value.replace("<![CDATA[", "").replace("]]>", "").trim();
    }

    private static String extract(String text, String start, String end) {
        if (text == null || text.isBlank()) {
            return null;
        }
        int a = text.indexOf(start);
        int b = text.indexOf(end, a + start.length());
        if (a < 0 || b < 0) {
            return null;
        }
        return text.substring(a + start.length(), b).trim();
    }

    private static String stripHtml(String input) {
        if (input == null) {
            return "";
        }
        String cleaned = input
                .replace("<![CDATA[", "")
                .replace("]]>", "")
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("&#39;", "'")
                .replaceAll("\\s+", " ")
                .trim();
        return cleaned;
    }

    public static String formatPublishedDate(String rawDate) {
        if (rawDate == null || rawDate.isBlank()) {
            return "Latest update";
        }

        try {
            return ZonedDateTime.parse(rawDate, DateTimeFormatter.RFC_1123_DATE_TIME)
                    .format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy"));
        } catch (DateTimeException ignored) {
            try {
                return ZonedDateTime.parse(rawDate)
                        .format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy"));
            } catch (DateTimeException ignoredAgain) {
                return rawDate;
            }
        }
    }

    public record NewsArticle(String title, String summary, String link, String publishedAt) {
    }
}
