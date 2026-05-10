package com.hpsh.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public record GenerateResponseDto(
        Long generationId,
        String prompt,
        String style,
        int count,
        List<String> images,
        LocalDateTime createdAt
) {}
