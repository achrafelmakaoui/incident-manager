package com.elmakaoui.incidents.security;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public final class ApiErrorWriter {

    private ApiErrorWriter() {}

    public static void write(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String safe = message.replace("\\", "\\\\").replace("\"", "\\\"");
        response.getWriter().write("{\"status\":" + status + ",\"message\":\"" + safe + "\"}");
    }
}