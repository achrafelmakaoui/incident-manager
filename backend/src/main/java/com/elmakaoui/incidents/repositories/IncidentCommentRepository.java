package com.elmakaoui.incidents.repositories;

import com.elmakaoui.incidents.entities.IncidentComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentCommentRepository extends JpaRepository<IncidentComment, Long> {
    List<IncidentComment> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);
}