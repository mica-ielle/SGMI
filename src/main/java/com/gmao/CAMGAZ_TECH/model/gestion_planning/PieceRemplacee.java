package com.gmao.CAMGAZ_TECH.model.gestion_planning;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;


@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties("ficheIntervention")
public class PieceRemplacee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_pieceRemplacee;

    @ManyToOne
    @JoinColumn(name = "id_piece")
    private Piece piece;

    @ManyToOne
    @JoinColumn(name = "id_ficheIntervention")
    private FicheIntervention ficheIntervention;


    private String reference;
    private String nom;

    private int quantiteUtilisee;
    private Double prixUnitaire; // Optionnel


    public int getId_pieceRemplacee() {
        return id_pieceRemplacee;
    }

    public void setId_pieceRemplacee(int id_pieceRemplacee) {
        this.id_pieceRemplacee = id_pieceRemplacee;
    }

    public Piece getPiece() {
        return piece;
    }

    public void setPiece(Piece piece) {
        this.piece = piece;
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

    public int getQuantiteUtilisee() {
        return quantiteUtilisee;
    }

    public void setQuantiteUtilisee(int quantiteUtilisee) {
        this.quantiteUtilisee = quantiteUtilisee;
    }

    public Double getPrixUnitaire() {
        return prixUnitaire;
    }

    public void setPrixUnitaire(Double prixUnitaire) {
        this.prixUnitaire = prixUnitaire;
    }

    public double getCoutTotal() {
        return prixUnitaire != null ? prixUnitaire * quantiteUtilisee : 0;
    }


    public FicheIntervention getFicheIntervention() {
        return ficheIntervention;
    }

    public void setFicheIntervention(FicheIntervention ficheIntervention) {
        this.ficheIntervention = ficheIntervention;
    }
}
