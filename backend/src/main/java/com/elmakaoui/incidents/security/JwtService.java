package com.elmakaoui.incidents.security;

import com.elmakaoui.incidents.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpirationMs;

    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.access-expiration-ms}") long accessExpirationMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessExpirationMs = accessExpirationMs;
    }

    // Builds a signed access token for this user.
    public String generateAccessToken(User user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getEmail())                       // "sub" claim: who the token is about
                .claim("role", user.getRole().name())           // custom claim: "EMPLOYEE", "ADMIN"...
                .issuedAt(now)                                  // "iat" claim
                .expiration(new Date(now.getTime() + accessExpirationMs))  // "exp" claim
                .signWith(key)                                  // picks HS512 since the key is 512 bits
                .compact();                                     // -> "xxxxx.yyyyy.zzzzz"
    }

    /**
     * Verifies the signature AND the expiration, then returns the claims.
     * Throws ExpiredJwtException if expired, and another JwtException
     * (SignatureException, MalformedJwtException...) if the token is invalid.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);   // reading a custom claim
    }
}