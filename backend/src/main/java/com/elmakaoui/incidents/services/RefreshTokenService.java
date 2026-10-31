package com.elmakaoui.incidents.services;

import com.elmakaoui.incidents.entities.RefreshToken;
import com.elmakaoui.incidents.entities.User;
import com.elmakaoui.incidents.exceptions.InvalidRefreshTokenException;
import com.elmakaoui.incidents.repositories.RefreshTokenRepository;
import com.elmakaoui.incidents.security.TokenHasher;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    // Creates a new refresh token. Returns the raw token: the only time it exists in clear.
    @Transactional
    public String create(User user) {
        byte[] bytes = new byte[64];
        RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        refreshTokenRepository.save(RefreshToken.builder()
                .tokenHash(TokenHasher.sha256(rawToken))
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .build());

        return rawToken;
    }

    /**
     * Validates a refresh token, revokes it (rotation) and returns its user.
     * If a revoked token is presented again, revokes ALL tokens of that user (reuse detection).
     * noRollbackFor: that "revoke all" must be saved even though we then throw.
     */
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public User rotate(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(TokenHasher.sha256(rawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token invalide"));

        if (token.isRevoked()) {
            refreshTokenRepository.revokeAllByUser(token.getUser());
            throw new InvalidRefreshTokenException("Refresh token déjà utilisé, veuillez vous reconnecter");
        }
        if (token.isExpired()) {
            throw new InvalidRefreshTokenException("Session expirée, veuillez vous reconnecter");
        }

        User user = token.getUser();
        if (!user.isEnabled()) {
            throw new InvalidRefreshTokenException("Ce compte est désactivé");
        }

        token.setRevoked(true);
        return user;
    }

    // Logout: revoke this token. Unknown tokens are ignored (logout always "succeeds").
    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(TokenHasher.sha256(rawToken))
                .ifPresent(t -> t.setRevoked(true));
    }

    // Password change: every session of this user must log in again.
    @Transactional
    public void revokeAllForUser(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }
}