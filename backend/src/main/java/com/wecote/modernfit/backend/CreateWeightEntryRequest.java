package com.wecote.modernfit.backend;

import java.time.LocalDate;

public class CreateWeightEntryRequest {

    private String name;
    private Double weight;
    private LocalDate date;

    public String getName() {
        return name;
    }

    public Double getWeight() {
        return weight;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
