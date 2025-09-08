package com.gmao.CAMGAZ_TECH.model.gestion_planning;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FicheIntervention {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_ficheIntervention;



    public enum TypeIntervention {
        MAINTENANCE_PLANIFIEE,
        DEFAILLANCE
    }

    public enum Resultat {
        OK,
        REPARÉ,
        SUIVI_NÉCESSAIRE
    }

    private TypeIntervention type;
    private LocalDateTime dateHeureIntervention;

    @ManyToOne
    @JoinColumn(name = "id_equipement")
    private Equipement equipement;
    private String descriptionIntervention;

    private String problemeRencontre; // Obligatoire si DEFAILLANCE
    private String cause;             // Obligatoire si DEFAILLANCE

    private String travauxEffectues;

    @OneToMany(mappedBy = "id_pieceRemplacee")
    private List<PieceRemplacee> piecesRemplacees;

    private double coutTotal; // Main-d'œuvre + pièces + autres frais
    private Resultat resultat;

    private List<String> nomsIntervenants;
    private String commentairesAdditionnels;
    private List<String> piecesJointes; // URLs ou chemins vers les fichiers

    public int getId_ficheIntervention() {
        return id_ficheIntervention;
    }

    public void setId_ficheIntervention(int id_ficheIntervention) {
        this.id_ficheIntervention = id_ficheIntervention;
    }

    public TypeIntervention getType() {
        return type;
    }

    public void setType(TypeIntervention type) {
        this.type = type;
    }

    public LocalDateTime getDateHeureIntervention() {
        return dateHeureIntervention;
    }

    public void setDateHeureIntervention(LocalDateTime dateHeureIntervention) {
        this.dateHeureIntervention = dateHeureIntervention;
    }

    public Equipement getEquipement() {
        return equipement;
    }

    public void setEquipement(Equipement equipement) {
        this.equipement = equipement;
    }

    public String getDescriptionIntervention() {
        return descriptionIntervention;
    }

    public void setDescriptionIntervention(String descriptionIntervention) {
        this.descriptionIntervention = descriptionIntervention;
    }

    public String getProblemeRencontre() {
        return problemeRencontre;
    }

    public void setProblemeRencontre(String problemeRencontre) {
        this.problemeRencontre = problemeRencontre;
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }

    public String getTravauxEffectues() {
        return travauxEffectues;
    }

    public void setTravauxEffectues(String travauxEffectues) {
        this.travauxEffectues = travauxEffectues;
    }

    public List<PieceRemplacee> getPiecesRemplacees() {
        return piecesRemplacees;
    }

    public void setPiecesRemplacees(List<PieceRemplacee> piecesRemplacees) {
        this.piecesRemplacees = piecesRemplacees;
    }

    public double getCoutTotal() {
        return coutTotal;
    }

    public void setCoutTotal(double coutTotal) {
        this.coutTotal = coutTotal;
    }

    public Resultat getResultat() {
        return resultat;
    }

    public void setResultat(Resultat resultat) {
        this.resultat = resultat;
    }

    public List<String> getNomsIntervenants() {
        return nomsIntervenants;
    }

    public void setNomsIntervenants(List<String> nomsIntervenants) {
        this.nomsIntervenants = nomsIntervenants;
    }

    public String getCommentairesAdditionnels() {
        return commentairesAdditionnels;
    }

    public void setCommentairesAdditionnels(String commentairesAdditionnels) {
        this.commentairesAdditionnels = commentairesAdditionnels;
    }

    public List<String> getPiecesJointes() {
        return piecesJointes;
    }

    public void setPiecesJointes(List<String> piecesJointes) {
        this.piecesJointes = piecesJointes;
    }

    public boolean isValide() {
        if (type == TypeIntervention.DEFAILLANCE) {
            return problemeRencontre != null && cause != null;
        }
        return true;
    }





}
