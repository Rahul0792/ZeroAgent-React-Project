package com.propmanagment.backend.security;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        System.out.println("➡ Path: " + path);


        // --- Public endpoints ---
        if (path.startsWith("/api/auth/") ||
        		(path.equals("/api/users") && method.equals("POST"))||
            path.startsWith("/uploads/") ||
         // Providers (ALL public)
             path.startsWith("/api/providers")||

            // Categories (public)
            path.startsWith("/api/categories")||

            // Bookings (public)
             path.startsWith("/api/bookings")||

            path.startsWith("/api/admin") ||
            path.equals("/api/properties") || path.startsWith("/api/properties/") ||
            path.startsWith("/api/favorites/") ||
            path.startsWith("/api/inquiries/") ||
            path.startsWith("/api/notifications/") ||
            path.startsWith("/api/rent-agreement") ||
            path.startsWith("/api/razorpay") ||
            path.startsWith("/api/chat") ||
            path.startsWith("/api/admin/properties")||
            path.startsWith("/api/debug"))
        {

            filterChain.doFilter(request, response);
            return;
        }

        // --- JWT validation ---
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (!jwtTokenUtil.validateToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired JWT token");
                return;
            }

            // Use extractEmail() instead of getUsernameFromToken()
            String email = jwtTokenUtil.extractEmail(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER")) // adjust roles if needed
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } else {
            // No token provided
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authorization header missing");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
