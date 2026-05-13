package com.wecote.modernfit.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, UUID> {

    List<WeightEntry> findByPersonalInformation_FirstNameAndPersonalInformation_LastNameOrderByDate(
            String firstName,
            String lastName
    );
}