package com.civicconnect.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Spring Security Configuration for CivicConnect
 * Handles authentication, authorization, and CORS
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // ========================================
                // PUBLIC ENDPOINTS (No authentication required)
                // ========================================
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/citizens/register").permitAll()
                .requestMatchers("/api/wards").permitAll()
                .requestMatchers("/api/departments").permitAll()
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/diagnostics/**").permitAll()
                
                // ========================================
                // SHARED ASSETS (Images/Proof)
                // ========================================
                .requestMatchers("/api/complaints/*/images/**").authenticated()
                .requestMatchers("/api/images/**").authenticated()
                .requestMatchers("/api/uploads/**").authenticated()
                
                // ========================================
                // CITIZEN ENDPOINTS (ROLE_CITIZEN required)
                // ⚠️ CRITICAL FIX: These lines fix the 403 error
                // ========================================
                .requestMatchers(HttpMethod.POST, "/api/citizens/complaints").hasRole("CITIZEN")
                .requestMatchers(HttpMethod.GET, "/api/citizens/complaints").hasRole("CITIZEN")
                .requestMatchers(HttpMethod.GET, "/api/citizens/complaints/**").hasRole("CITIZEN")
                .requestMatchers(HttpMethod.PUT, "/api/citizens/complaints/**").hasRole("CITIZEN")
                .requestMatchers("/api/citizens/**").hasRole("CITIZEN")
                .requestMatchers("/api/citizen/**").hasRole("CITIZEN")
                
                // ========================================
                // WARD OFFICER ENDPOINTS
                // ========================================
                .requestMatchers("/api/ward-officer/**").hasRole("WARD_OFFICER")
                .requestMatchers("/api/ward/**").hasRole("WARD_OFFICER")
                
                // ========================================
                // DEPARTMENT OFFICER ENDPOINTS
                // ========================================
                .requestMatchers("/api/department-officer/**").hasRole("DEPARTMENT_OFFICER")
                .requestMatchers("/api/department/**").hasRole("DEPARTMENT_OFFICER")
                
                // ========================================
                // ADMIN ENDPOINTS
                // ========================================
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // ========================================
                // COMMON AUTHENTICATED ENDPOINTS
                // (Any authenticated user can access)
                // ========================================
                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()
                .requestMatchers("/api/complaints/**").authenticated()
                
                // ========================================
                // DEFAULT: All other requests require authentication
                // ========================================
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    /**
     * CORS Configuration
     * Allows frontend (localhost:5173) to access backend APIs
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend origins
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Password Encoder Bean
     * Uses BCrypt for password hashing
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Authentication Manager Bean
     * Required for authentication
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
