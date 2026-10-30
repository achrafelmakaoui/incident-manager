package com.elmakaoui.incidents.repositories;

import com.elmakaoui.incidents.entities.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    List<IncidentHistory> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);   // oldest first, like a timeline
}