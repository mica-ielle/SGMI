package com.gmao.CAMGAZ_TECH.model.gestion_equipements;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties("equipement")
public class Tache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_tache;

    @ManyToOne
    @JoinColumn(name = "id_equipement")
    private Equipement equipement;
    private String nom;
    private String type;
    private String frequence;

    public int getId_tache() {
        return id_tache;
    }

    public void setId_tache(int id_tache) {
        this.id_tache = id_tache;
    }

    public Equipement getEquipement() {
        return equipement;
    }

    public void setEquipement(Equipement equipement) {
        this.equipement = equipement;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFrequence() {
        return frequence;
    }

    public void setFrequence(String frequence) {
        this.frequence = frequence;
    }
}
