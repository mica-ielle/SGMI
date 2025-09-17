package com.gmao.CAMGAZ_TECH.controller;

import com.gmao.CAMGAZ_TECH.DTO.LoginRequest;
import com.gmao.CAMGAZ_TECH.DTO.LoginResponse;
import com.gmao.CAMGAZ_TECH.DTO.UserInfo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Implémentation de l'authentification
        // Retourne un JWT token ou session
        return null;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Implémentation de la déconnexion
        return null;
    }

    @GetMapping("/verify")
    public ResponseEntity<UserInfo> verifyToken() {
        // Vérification du token/session
        return null;
    }
}