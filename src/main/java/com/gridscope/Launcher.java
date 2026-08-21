package com.gridscope;

import com.gridscope.ui.screens.F1GridScopeApp;

/**
 * Thin launcher class that delegates to {@link F1GridScopeApp}.
 *
 * <p>JavaFX 11+ does not allow a class that extends {@code Application} to be
 * the manifest {@code Main-Class} of an executable JAR — doing so results in a
 * "JavaFX runtime components are missing" error at startup.  This wrapper class
 * does <em>not</em> extend {@code Application}, so it can safely be the JAR
 * entry point.
 */
public class Launcher {

    public static void main(String[] args) {
        F1GridScopeApp.main(args);
    }
}
