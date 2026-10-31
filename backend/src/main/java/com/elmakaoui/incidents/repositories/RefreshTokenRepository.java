package com.elmakaoui.incidents.repositories;

import com.elmakaoui.incidents.entities.RefreshToken;
import com.elmakaoui.incidents.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    // One UPDATE statement for all of a user's active tokens
    @Modifying
    @Query("update RefreshToken r set r.revoked = true where r.user = :user and r.revoked = false")
    int revokeAllByUser(@Param("user") User user);
}