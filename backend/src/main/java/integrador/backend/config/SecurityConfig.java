package integrador.backend.config;

import integrador.backend.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .frameOptions(fo -> fo.deny())
                .contentTypeOptions(cto -> {})
                .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/api/eventos/stream", "/error").permitAll()

                // ── BARBEROS ─────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/barberos/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                .requestMatchers("/api/barberos/**").hasAuthority("ROLE_ADMIN")

                // ── SERVICIOS ─────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/servicios/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                .requestMatchers("/api/servicios/**").hasAuthority("ROLE_ADMIN")

                // ── TURNOS ────────────────────────────────────────────────
                .requestMatchers("/api/turnos/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")

                // ── CAJA ──────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/caja/cobrar-split").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                .requestMatchers(HttpMethod.GET, "/api/caja/transacciones").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                .requestMatchers(HttpMethod.GET, "/api/caja/mis-transacciones").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                .requestMatchers("/api/caja/**").hasAuthority("ROLE_ADMIN")

                // ── INSUMOS ───────────────────────────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/insumos/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                .requestMatchers(HttpMethod.PATCH, "/api/insumos/*/agotar").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                .requestMatchers("/api/insumos/**").hasAuthority("ROLE_ADMIN")

                // ── DETALLE-SERVICIO ──────────────────────────────────────
                .requestMatchers("/api/detalle-servicio/**").hasAuthority("ROLE_ADMIN")

                // ── USUARIOS (reset contraseña por admin) ────────────────
                .requestMatchers("/api/usuarios/**").hasAuthority("ROLE_ADMIN")

                // ── PERFIL (usuario sobre sí mismo) ───────────────────────
                .requestMatchers("/api/perfil/**").authenticated()

                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> res.sendError(401, "No autorizado"))
                .accessDeniedHandler((req, res, e) -> res.sendError(403, "Acceso denegado"))
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Solo permite el dominio del frontend en producción (configurar FRONTEND_URL en Railway)
        config.setAllowedOrigins(List.of(
            frontendUrl,
            "http://localhost:5173"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
