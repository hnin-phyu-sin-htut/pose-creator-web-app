package com.hpsh.demo.controller;

import com.hpsh.demo.dto.GenerateResponseDto;
import com.hpsh.demo.dto.HistoryItemDto;
import com.hpsh.demo.security.SecurityUser;
import com.hpsh.demo.service.GenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class GenerationController {

    private final GenerationService generationService;

    public GenerationController(GenerationService generationService) {
        this.generationService = generationService;
    }

    @PostMapping(value = "/generate", consumes = "multipart/form-data")
    public ResponseEntity<GenerateResponseDto> generate(
            @AuthenticationPrincipal SecurityUser user,
            @RequestParam("prompt") String prompt,
            @RequestParam(value = "style", required = false) String style,
            @RequestParam(value = "count", defaultValue = "1") int count,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(generationService.generate(user.getUserId(), prompt, style, count, image));
    }

    @GetMapping("/history")
    public ResponseEntity<List<HistoryItemDto>> history(@AuthenticationPrincipal SecurityUser user) {
        return ResponseEntity.ok(generationService.getHistory(user.getUserId()));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<HistoryItemDto> historyItem(
            @AuthenticationPrincipal SecurityUser user,
            @PathVariable("id") Long id) {
        return ResponseEntity.ok(generationService.getHistoryItem(user.getUserId(), id));
    }
}
