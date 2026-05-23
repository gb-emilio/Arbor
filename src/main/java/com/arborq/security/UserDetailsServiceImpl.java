package com.arborq.security;

import com.arborq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Component;

/**
 * Implementación de UserDetailsService como @Component independiente.
 * Sacarla de SecurityConfig rompe la referencia circular:
 *   SecurityConfig → JwtAuthFilter → UserDetailsService → SecurityConfig (CICLO)
 * Ahora:
 *   SecurityConfig → JwtAuthFilter → UserDetailsServiceImpl  (sin ciclo)
 *   SecurityConfig → UserDetailsServiceImpl                  (sin ciclo)
 */
@Component
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + username));
    }
}
