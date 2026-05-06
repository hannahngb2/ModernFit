package com.wecote.modernfit.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, String> {
    List<WeightEntry> findAllByOrderByDateAsc();
}
