package com.propmanagment.backend.security;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;



@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(  "/api/auth/login",
                		"/api/auth/verify-otp",
                       
                        "/api/auth/forgot-password",
                        "/api/auth/reset-password").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/providers/**").permitAll()

                // ===== PUBLIC SERVICE CATEGORIES =====
                .requestMatchers("/api/categories/**").permitAll()

                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/api/properties/**").permitAll() 
                // ===== PUBLIC FAVORITES, INQUIRIES, NOTIFICATIONS =====
                .requestMatchers("/api/favorites/**",
							     "/api/inquiries/**",
							     "/api/notifications/**").permitAll()

                .requestMatchers("/api/admin/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

        
                
              
                .requestMatchers("/api/bookings/**").permitAll()
                
                .requestMatchers("/api/payments/**").authenticated()

                .requestMatchers("/api/debug/**").permitAll()
                .requestMatchers("/api/razorpay/**").permitAll()
                .requestMatchers("/api/chat").permitAll() 
                .requestMatchers("/api/rent-agreement/**").permitAll()
                
         
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
