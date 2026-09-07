package com.hgs.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private final ConcurrentHashMap<String, RequestCounter> ipRequestMap = new ConcurrentHashMap<>();

    private static class RequestCounter {
        private final long windowStartTime;
        private final AtomicInteger count;

        public RequestCounter(long windowStartTime) {
            this.windowStartTime = windowStartTime;
            this.count = new AtomicInteger(1);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Apply rate limit specifically to public complaint submission and tracking
        if (path.startsWith("/api/complaints")) {
            String clientIp = getClientIp(request);
            long currentTime = System.currentTimeMillis();

            RequestCounter counter = ipRequestMap.compute(clientIp, (key, existing) -> {
                if (existing == null || (currentTime - existing.windowStartTime) > 60000) {
                    return new RequestCounter(currentTime);
                } else {
                    existing.count.incrementAndGet();
                    return existing;
                }
            });

            if (counter.count.get() > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.setHeader("Retry-After", "60");
                response.getWriter().write("""
                    {"error":"Too Many Requests","message":"Rate limit exceeded. Please wait a minute before making another request."}
                """);
                return;
            }
        }

        // Periodically cleanup very old entries
        if (ipRequestMap.size() > 5000) {
            long now = System.currentTimeMillis();
            ipRequestMap.entrySet().removeIf(entry -> (now - entry.getValue().windowStartTime) > 300000);
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
