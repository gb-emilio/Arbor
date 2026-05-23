package com.arborq.config;

/**
 * CORS se gestiona desde SecurityConfig.corsConfigurationSource().
 * Este archivo queda vacío a propósito — el CorsFilter bean externo
 * generaba un conflicto de doble aplicación con Spring Security.
 */
public class CorsConfig {
    // vacío — ver SecurityConfig.corsConfigurationSource()
}
