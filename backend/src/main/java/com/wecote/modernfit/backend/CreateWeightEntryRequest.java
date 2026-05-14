package com.wecote.modernfit.backend;

import java.time.LocalDate;
import java.util.UUID;

public class CreateWeightEntryRequest {

    private UUID uuid;
    private Double weight;
    private LocalDate date;

    public UUID getUuid() {
        return uuid;
    }

    public Double getWeight() {
        return weight;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setUuid(UUID uuid) {
        this.uuid = uuid;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
