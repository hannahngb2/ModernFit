package com.wecote.modernfit.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/weights")
@CrossOrigin(origins = "*")
public class WeightEntryController {

    private final WeightEntryRepository repository;
    private final PersonalInformationRepository personalInformationRepository;

    public WeightEntryController(
            WeightEntryRepository repository,
            PersonalInformationRepository personalInformationRepository
    ) {
        this.repository = repository;
        this.personalInformationRepository = personalInformationRepository;
    }

    @PostMapping
    public ResponseEntity<WeightEntry> createWeightEntry(
            @RequestBody CreateWeightEntryRequest request
    ) {
        PersonalInformation personalInformation = personalInformationRepository
                .findById(request.getUuid())
                .orElseThrow();

        WeightEntry entry = new WeightEntry();
        entry.setName(personalInformation.getFirstName());
        entry.setWeight(request.getWeight());
        entry.setDate(request.getDate());
        entry.setPersonalInformation(personalInformation);

        WeightEntry saved = repository.save(entry);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<WeightEntry> getWeights(
            @RequestParam UUID personalInformationId
    ) {
        return repository.findByPersonalInformation_IdOrderByDate(personalInformationId);
    }
}