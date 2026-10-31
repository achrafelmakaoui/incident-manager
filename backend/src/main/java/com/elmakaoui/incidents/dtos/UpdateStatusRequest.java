package com.elmakaoui.incidents.dtos;

import com.elmakaoui.incidents.enums.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Le statut est obligatoire")
        Status status
) {}