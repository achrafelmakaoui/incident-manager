package com.elmakaoui.incidents.dtos;

import java.util.List;

public record IncidentDetailsResponse(
        IncidentResponse incident,
        List<HistoryResponse> history,
        List<CommentResponse> comments
) {}