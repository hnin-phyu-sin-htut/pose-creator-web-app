package com.hpsh.demo.dao;

import com.hpsh.demo.model.GeneratedImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeneratedImageDao extends JpaRepository<GeneratedImage, Long> {
    List<GeneratedImage> findByGenerationIdOrderByIdAsc(Long generationId);

    @org.springframework.data.jpa.repository.Query(
        "select gi.generationId as gid, count(gi) as cnt from GeneratedImage gi " +
        "where gi.generationId in :genIds group by gi.generationId")
    java.util.List<GenerationImageCount> countByGenerationIds(
        @org.springframework.data.repository.query.Param("genIds") java.util.List<Long> genIds);

    interface GenerationImageCount {
        Long getGid();
        Long getCnt();
    }
}
