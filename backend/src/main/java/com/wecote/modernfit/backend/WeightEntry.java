package com.wecote.modernfit.backend;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.persistence.ManyToOne;

@Entity
public class WeightEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
   private String name;
    private Double weight;
    private LocalDate date;

    @ManyToOne
    private PersonalInformation personalInformation;

    // Gettermethoden
    public UUID getId() {
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

    public PersonalInformation getPersonalInformation() {
        return personalInformation;
    }

    // Settermethoden
    public void setId(UUID id) {
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

    public void setPersonalInformation(PersonalInformation personalInformation) {
        this.personalInformation = personalInformation;
    }
}
