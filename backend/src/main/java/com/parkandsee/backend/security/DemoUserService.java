package com.parkandsee.backend.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class DemoUserService {

    // demo agent user: username 'agent' password 'agentpass'
    private final String demoUsername = "agent";
    private final String demoPasswordHash;
    private final BCryptPasswordEncoder encoder;  // RÉUTILISER la même instance

    public DemoUserService() {
        this.encoder = new BCryptPasswordEncoder();
        this.demoPasswordHash = encoder.encode("agentpass");
    }

    public UserDetails loadUserByUsername(String username) {
        if (!demoUsername.equals(username)) return null;
        GrantedAuthority auth = new SimpleGrantedAuthority("ROLE_AGENT");
        return new User(demoUsername, demoPasswordHash, Collections.singleton(auth));
    }

    public boolean checkPassword(String username, String rawPassword) {
        if (!demoUsername.equals(username)) return false;
        // Utiliser la même instance pour la vérification
        return encoder.matches(rawPassword, demoPasswordHash);
    }
}
