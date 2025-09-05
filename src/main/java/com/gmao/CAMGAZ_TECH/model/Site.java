package com.gmao.CAMGAZ_TECH.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.ToString;


@Entity
@ToString
public class Site {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nom;
    private String adresse;
    private String contact;
    private String region;
    private String notes;

    public Site(int id, String nom, String adresse, String contact, String region, String notes) {
        this.id = id;
        this.nom = nom;
        this.adresse = adresse;
        this.contact = contact;
        this.region = region;
        this.notes = notes;
    }

    public int getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getAdresse() {
        return adresse;
    }

    public String getContact() {
        return contact;
    }

    public String getRegion() {
        return region;
    }

    public String getNotes() {
        return notes;
    }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
