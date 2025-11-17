package com.parkandsee.backend.controller;

import com.parkandsee.backend.security.AuthRequest;
import com.parkandsee.backend.security.AuthResponse;
import com.parkandsee.backend.security.JwtUtils;
import com.parkandsee.backend.security.DemoUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtils jwtUtils;
    private final DemoUserService userService;

    public AuthController(JwtUtils jwtUtils, DemoUserService userService) {
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        // validate credentials against demo user service
        UserDetails user = userService.loadUserByUsername(request.getUsername());
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        // password check - DemoUserService exposes a simple check
        if (!userService.checkPassword(request.getUsername(), request.getPassword())) {
            return ResponseEntity.status(401).build();
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getAuthorities().toString());
        AuthResponse resp = new AuthResponse(token, 3600, "agent");
        return ResponseEntity.ok(resp);
    }
}
