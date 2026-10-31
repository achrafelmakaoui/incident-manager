package com.elmakaoui.incidents.repositories;

import com.elmakaoui.incidents.entities.IncidentHistory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    @EntityGraph(attributePaths = {"performedBy"})
    List<IncidentHistory> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);   // oldest first, like a timeline
}