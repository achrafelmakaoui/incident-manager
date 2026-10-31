package com.elmakaoui.incidents.repositories;

import com.elmakaoui.incidents.entities.Incident;
import com.elmakaoui.incidents.enums.Priority;
import com.elmakaoui.incidents.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Collection;
import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // EMPLOYEE: own incidents
    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findByCreatedByEmailOrderByCreatedAtDesc(String email);

    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findTop5ByCreatedByEmailOrderByCreatedAtDesc(String email);   // dashboard "latest incidents"

    // TECHNICIAN: assigned incidents
    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findByAssignedToEmailOrderByCreatedAtDesc(String email);

    // ADMIN: all incidents, newest first
    @EntityGraph(attributePaths = {"createdBy", "assignedTo"})
    List<Incident> findAllByOrderByCreatedAtDesc();

    // Dashboard counters
    long countByCreatedByEmail(String email);
    long countByCreatedByEmailAndStatus(String email, Status status);
    long countByCreatedByEmailAndStatusIn(String email, Collection<Status> statuses);

    long countByAssignedToEmail(String email);
    long countByAssignedToEmailAndStatus(String email, Status status);
    long countByAssignedToEmailAndPriority(String email, Priority priority);

    long countByStatus(Status status);
}