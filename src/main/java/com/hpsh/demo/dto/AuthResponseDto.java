package com.hpsh.demo.dto;

public record AuthResponseDto(
        String token,
        String username,
        Long userId
) {}
