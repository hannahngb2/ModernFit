package com.wecote.modernfit.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/weights")
@CrossOrigin(origins = "*")
public class WeightEntryController {

    private final WeightEntryRepository repository;

    public WeightEntryController(WeightEntryRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<WeightEntry> createWeightEntry(
            @RequestBody CreateWeightEntryRequest request
    ) {

        WeightEntry entry = new WeightEntry();
        entry.setName(request.getName());
        entry.setWeight(request.getWeight());
        entry.setDate(request.getDate());

        WeightEntry saved = repository.save(entry);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public List<WeightEntry> getWeights() {
        return repository.findByPersonalInformation_FirstNameAndPersonalInformation_LastNameOrderByDate(
                "Stefan",
                "Keller"
        );
    }
}
