package com.hgs.dto.response;

public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private String email;
    private long expiresInHours;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username, String fullName, String email, long expiresInHours) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.expiresInHours = expiresInHours;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public long getExpiresInHours() {
        return expiresInHours;
    }

    public void setExpiresInHours(long expiresInHours) {
        this.expiresInHours = expiresInHours;
    }
}
