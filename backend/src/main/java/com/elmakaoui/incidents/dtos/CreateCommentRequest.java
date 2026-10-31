package com.elmakaoui.incidents.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank(message = "Le contenu de la note est obligatoire")
        @Size(max = 2000, message = "La note ne doit pas dépasser 2000 caractères")
        String content
) {}