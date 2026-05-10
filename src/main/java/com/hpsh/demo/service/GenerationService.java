package com.hpsh.demo.service;

import com.hpsh.demo.client.AiClient;
import com.hpsh.demo.dao.GeneratedImageDao;
import com.hpsh.demo.dao.GenerationDao;
import com.hpsh.demo.dto.GenerateResponseDto;
import com.hpsh.demo.dto.HistoryItemDto;
import com.hpsh.demo.exception.AppException;
import com.hpsh.demo.model.GeneratedImage;
import com.hpsh.demo.model.Generation;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class GenerationService {

    private static final Logger log = LoggerFactory.getLogger(GenerationService.class);

    private final GenerationDao generationDao;
    private final GeneratedImageDao generatedImageDao;
    private final AiClient aiClient;
    private final String uploadDir;

    public GenerationService(GenerationDao generationDao, GeneratedImageDao generatedImageDao,
                             AiClient aiClient, @Value("${file.upload-dir}") String uploadDir) {
        this.generationDao = generationDao;
        this.generatedImageDao = generatedImageDao;
        this.aiClient = aiClient;
        Path p = Paths.get(uploadDir);
        if (!p.isAbsolute()) {
            p = Paths.get(System.getProperty("user.dir")).resolve(uploadDir);
        }
        this.uploadDir = p.toAbsolutePath().normalize().toString();
    }

    @PostConstruct
    void ensureUploadDir() throws IOException {
        Files.createDirectories(Paths.get(uploadDir));
        log.info("Upload directory: {}", uploadDir);
    }

    @Transactional
    public GenerateResponseDto generate(Long userId, String prompt, String style, int count, MultipartFile inputImage) {
        if (prompt == null || prompt.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Prompt is required.");
        }
        if (count < 1) count = 1;
        if (count > 4) count = 4;

        String inputImagePath = null;
        String inputImageB64 = null;
        if (inputImage != null && !inputImage.isEmpty()) {
            try {
                Path dir = Paths.get(uploadDir);
                Files.createDirectories(dir);
                String safeName = UUID.randomUUID() + "_" + sanitize(inputImage.getOriginalFilename());
                Path saved = dir.resolve(safeName);
                inputImage.transferTo(saved.toFile());
                inputImagePath = safeName;
                inputImageB64 = Base64.getEncoder().encodeToString(Files.readAllBytes(saved));
            } catch (IOException e) {
                log.error("Failed to save uploaded image to {}: {}", uploadDir, e.getMessage());
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save uploaded image.");
            }
        }

        Generation generation = Generation.builder()
                .userId(userId)
                .prompt(prompt)
                .style(style)
                .inputImagePath(inputImagePath)
                .count(count)
                .build();
        generation = generationDao.save(generation);

        AiClient.AiGenerateResult result = aiClient.generate(prompt, style, count, inputImageB64);
        if (result.images().isEmpty()) {
            throw new AppException(HttpStatus.BAD_GATEWAY,
                    "Image generation failed: " + (result.error() == null ? "no images returned." : result.error()));
        }

        List<GeneratedImage> saved = new ArrayList<>();
        for (String img : result.images()) {
            GeneratedImage gi = GeneratedImage.builder()
                    .generationId(generation.getId())
                    .imageUrl(img)
                    .build();
            saved.add(generatedImageDao.save(gi));
        }

        return new GenerateResponseDto(
                generation.getId(), prompt, style, count,
                saved.stream().map(GeneratedImage::getImageUrl).toList(),
                generation.getCreatedAt()
        );
    }

    public List<HistoryItemDto> getHistory(Long userId) {
        List<Generation> generations = generationDao.findByUserIdOrderByCreatedAtDesc(userId);
        if (generations.isEmpty()) return List.of();

        List<Long> ids = generations.stream().map(Generation::getId).toList();
        java.util.Map<Long, Integer> countByGen = new java.util.HashMap<>();
        for (var row : generatedImageDao.countByGenerationIds(ids)) {
            countByGen.put(row.getGid(), row.getCnt().intValue());
        }

        List<HistoryItemDto> result = new ArrayList<>(generations.size());
        for (Generation g : generations) {
            int cnt = countByGen.getOrDefault(g.getId(), 0);
            result.add(new HistoryItemDto(
                    g.getId(), g.getPrompt(), g.getStyle(), g.getCount(),
                    g.getInputImagePath(), List.of(), cnt, g.getCreatedAt()
            ));
        }
        return result;
    }

    public HistoryItemDto getHistoryItem(Long userId, Long generationId) {
        Generation g = generationDao.findById(generationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Generation not found."));
        if (!g.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Not your generation.");
        }
        List<String> imgs = generatedImageDao.findByGenerationIdOrderByIdAsc(g.getId())
                .stream().map(GeneratedImage::getImageUrl).toList();
        return new HistoryItemDto(
                g.getId(), g.getPrompt(), g.getStyle(), g.getCount(),
                g.getInputImagePath(), imgs, imgs.size(), g.getCreatedAt()
        );
    }

    private String sanitize(String name) {
        if (name == null) return "upload.png";
        return name.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
