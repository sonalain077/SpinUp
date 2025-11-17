package com.parkandsee.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(false); // false pour les fichiers locaux
        config.addAllowedOriginPattern("http://localhost:*"); // React dev server
        config.addAllowedOriginPattern("http://127.0.0.1:*"); // Local development
        config.addAllowedOriginPattern("file://*"); // Local HTML files
        config.addAllowedOrigin("null"); // Fichiers locaux dans certains navigateurs
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}