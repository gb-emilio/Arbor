package com.arborq.security;

/** Se lanza cuando una IP intenta registrar una cuenta antes de que expire la ventana de espera. */
public class RateLimitException extends RuntimeException {
    public RateLimitException(String message) {
        super(message);
    }
}
