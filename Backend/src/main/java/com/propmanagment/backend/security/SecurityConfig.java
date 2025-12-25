package com.propmanagment.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // ✅ ENABLE CORS
                .cors(cors -> {})
                // ✅ DISABLE CSRF (API)
                .csrf(csrf -> csrf.disable())

                // ✅ STATELESS JWT
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // ✅ CORS PREFLIGHT
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                        // ===== AUTH =====
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/verify-otp",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        // ===== PUBLIC APIs =====
                        .requestMatchers(
                                "/api/users/**",
                                "/api/providers/**",
                                "/api/categories/**",
                                "/api/properties/**",
                                "/api/favorites/**",
                                "/api/inquiries/**",
                                "/api/notifications/**",
                                "/api/bookings/**",
                                "/api/debug/**",
                                "/api/razorpay/**",
                                "/api/chat",
                                "/api/rent-agreement/**",
                                "/uploads/**"
                        ).permitAll()

                        // 🔐 ADMIN ONLY (JWT MUST HAVE ROLE_ADMIN)
                        .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

                        // 🔐 AUTHENTICATED USERS
                        .requestMatchers("/api/payments/**").authenticated()

                        .anyRequest().authenticated()
                );

        // ✅ JWT FILTER
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ CORRECT CORS CONFIG
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // ✅ FRONTEND ORIGINS (ADD IP ALSO)
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://172.20.10.5:5173"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        // ❗ IMPORTANT
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
