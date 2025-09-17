package com.gmao.CAMGAZ_TECH.DTO;

import java.sql.Date;

public class LoginResponse {
    private String token;
    private String username;
    private Date expiresAt;


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

    public Date getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Date expiresAt) {
        this.expiresAt = expiresAt;
    }
}
