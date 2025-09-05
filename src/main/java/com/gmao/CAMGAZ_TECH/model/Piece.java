package com.gmao.CAMGAZ_TECH.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties("equipement")
public class Piece {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_piece;
    @ManyToOne
    @JoinColumn(name = "id_equipement")
    private Equipement equipement;
    private String nom;
    private String reference;

    public int getId_piece() {
        return id_piece;
    }

    public void setId_piece(int id_piece) {
        this.id_piece = id_piece;
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

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }
}
