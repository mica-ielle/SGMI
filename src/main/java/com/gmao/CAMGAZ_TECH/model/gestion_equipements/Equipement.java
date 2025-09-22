package com.gmao.CAMGAZ_TECH.model.gestion_equipements;

import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Equipement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_equipement;


    public enum TypeEquipement {
        MOTOPOMPE,
        BORNE_DE_DISTRIBUTION,
        ARMOIRE_ELECTRIQUE,
        CITERNE,
        VAPORISATEUR,
        REGULATEUR
    }

    private TypeEquipement type;
    private String reference;
    private String nom;
    private String fournisseur;

    @OneToMany(mappedBy = "equipement")
    private List<Tache> taches;

    @OneToMany(mappedBy = "equipement")
    private List<Piece> pieces;


    public int getId_equipement() {
        return id_equipement;
    }

    public void setId_equipement(int id_equipement) {
        this.id_equipement = id_equipement;
    }

    public TypeEquipement getType() {
        return type;
    }

    public void setType(TypeEquipement type) {
        this.type = type;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(String fournisseur) {
        this.fournisseur = fournisseur;
    }

    public List<Tache> getTaches() {
        return taches;
    }

    public void setTaches(List<Tache> taches) {
        this.taches = taches;
    }

    public List<Piece> getPieces() {
        return pieces;
    }

    public void setPieces(List<Piece> pieces) {
        this.pieces = pieces;
    }
}
