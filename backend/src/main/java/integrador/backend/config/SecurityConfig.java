package integrador.backend.config;

import integrador.backend.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/error").permitAll()

                // Solo Admin y Barbero pueden VER insumos
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/insumos/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                // Barberos pueden descontar stock de un insumo agotado
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/insumos/*/agotar").hasAnyAuthority("ROLE_ADMIN", "ROLE_BARBERO")
                // Solo Admin puede modificar insumos
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/insumos/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/insumos/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/insumos/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/insumos/**").hasAuthority("ROLE_ADMIN")

                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> res.sendError(401, "No autorizado"))
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
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:5174",
            "https://frontend-deko451s-projects.vercel.app",
            frontendUrl
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
