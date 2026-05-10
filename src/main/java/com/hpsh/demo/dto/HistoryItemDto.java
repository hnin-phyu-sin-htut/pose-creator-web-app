package com.hpsh.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

public record HistoryItemDto(
        Long id,
        String prompt,
        String style,
        int count,
        String inputImagePath,
        List<String> images,
        int imageCount,
        LocalDateTime createdAt
) {}
