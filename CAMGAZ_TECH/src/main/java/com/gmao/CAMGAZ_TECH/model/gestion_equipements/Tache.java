package com.gmao.CAMGAZ_TECH.model.gestion_equipements;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;
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

    @ManyToOne
    @JoinColumn(name = "id_occurenceMainteance")
    private OccurenceMainteance occurenceMainteance;


    public enum TypeTache {
        VISITE,
        ENTRETIEN,
        PREVENTIF
    }

    private TypeTache type;


    @ManyToOne
    @JoinColumn(name = "id_frequence")
    private Frequence frequence;

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

    public TypeTache getType() {
        return type;
    }

    public void setType(TypeTache type) {
        this.type = type;
    }

    public Frequence getFrequence() {
        return frequence;
    }

    public void setFrequence(Frequence frequence) {
        this.frequence = frequence;
    }


    public OccurenceMainteance getOccurenceMainteance() {
        return occurenceMainteance;
    }

    public void setOccurenceMainteance(OccurenceMainteance occurenceMainteance) {
        this.occurenceMainteance = occurenceMainteance;
    }

    public String afficherFrequence() {
        if (frequence.getFrequenceStandard() != null) {
            return frequence.getFrequenceStandard().name();
        } else if (frequence.getUnitePersonnalisee() == Frequence.UniteFrequence.HEURES_UTILISATION) {
            Double mois = frequence.calculerEquivalenceEnMois();
            return mois != null ? String.format("≈ %.2f mois (basé sur %d h à %.2f h/j)",
                    mois, frequence.getHeuresTotales(), frequence.getHeuresMoyennesParJour()) : "Fréquence invalide";
        } else {
            return frequence.getValeurPersonnalisee() + " " + frequence.getUnitePersonnalisee();
        }
    }


    public Tache cloneSansRelations() {
        Tache clone = new Tache();

        clone.setNom(this.nom);
        clone.setType(this.type);
        clone.setFrequence(this.frequence);
        clone.setEquipement(this.equipement);

        return clone;
    }


}
