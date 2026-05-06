package com.wecote.modernfit.backend;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class WeightEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String name;

    private Double weight;

    private LocalDate date;

    // Getter
    public String getId() {
        return id;
    }
    public String getName() {
        return name;
    }

    public Double getWeight() {
        return weight;
    }

    public LocalDate getDate() {
        return date;
    }

    // Setter
    public void setId(String id) {
        this.id = id;
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
