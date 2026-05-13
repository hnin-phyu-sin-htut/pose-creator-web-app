package com.hpsh.demo.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.restclient.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import tools.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AiClient {

    private static final Logger log = LoggerFactory.getLogger(AiClient.class);

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final ObjectMapper mapper = new ObjectMapper();

    public AiClient(RestTemplateBuilder builder,
                    @Value("${app.ai.service-url}") String baseUrl,
                    @Value("${app.ai.timeout-seconds}") int timeoutSeconds) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(15).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(timeoutSeconds).toMillis());
        this.restTemplate = builder
                .requestFactory(() -> factory)
                .build();
    }

    public record AiGenerateResult(List<String> images, String error) {}

    @SuppressWarnings("unchecked")
    public AiGenerateResult generate(String prompt, String style, int count, String inputImageB64) {
        String url = baseUrl + "/generate";

        Map<String, Object> body = new HashMap<>();
        body.put("prompt", prompt == null ? "" : prompt);
        if (style != null && !style.isBlank()) body.put("style", style);
        body.put("count", count);
        if (inputImageB64 != null && !inputImageB64.isBlank()) {
            body.put("input_image_b64", inputImageB64);
        }

        String json;
        try {
            json = mapper.writeValueAsString(body);
        } catch (Exception e) {
            log.error("Failed to serialize AI request: {}", e.getMessage());
            return new AiGenerateResult(List.of(), "request serialization failed.");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<String> entity = new HttpEntity<>(json, headers);

        log.info("AI call -> {} (prompt_len={}, style={}, count={}, body_bytes={})",
                url, body.get("prompt").toString().length(), style, count, json.length());

        try {
            ResponseEntity<Map> resp = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> respBody = resp.getBody();
            if (respBody == null) return new AiGenerateResult(List.of(), "empty response from AI service.");
            List<String> images = (List<String>) respBody.getOrDefault("images", List.of());
            return new AiGenerateResult(images, null);
        } catch (Exception e) {
            log.error("AI service call failed: {}", e.getMessage());
            return new AiGenerateResult(List.of(), e.getMessage());
        }
    }
}
