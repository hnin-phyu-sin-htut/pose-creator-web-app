package com.hpsh.demo.dao;

import com.hpsh.demo.model.Generation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GenerationDao extends JpaRepository<Generation, Long> {
    List<Generation> findByUserIdOrderByCreatedAtDesc(Long userId);
}
