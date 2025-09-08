package com.gmao.CAMGAZ_TECH.model.gestion_equipements;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Frequence {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_frequence;

    public enum UniteFrequence {
        JOURS,
        SEMAINES,
        MOIS,
        ANNEES,
        HEURES_UTILISATION
    }

    public enum FrequenceStandard {
        MENSUELLE(1, UniteFrequence.MOIS),
        BIMENSUELLE(2, UniteFrequence.MOIS),
        TRIMESTRIELLE(3, UniteFrequence.MOIS),
        SEMESTRIELLE(6, UniteFrequence.MOIS),
        ANNUELLE(1, UniteFrequence.ANNEES),
        CINQ_ANS(5, UniteFrequence.ANNEES),
        DIX_ANS(10, UniteFrequence.ANNEES);

        private final int valeur;
        private final UniteFrequence unite;

        FrequenceStandard(int valeur, UniteFrequence unite) {
            this.valeur = valeur;
            this.unite = unite;
        }

        public int getValeur() {
            return valeur;
        }

        public UniteFrequence getUnite() {
            return unite;
        }
    }

    private FrequenceStandard frequenceStandard;
    private Integer valeurPersonnalisee; // ex: 3
    private UniteFrequence unitePersonnalisee;

    private Integer heuresTotales;
    private Double heuresMoyennesParJour;

    public Double calculerEquivalenceEnMois() {
        if (heuresTotales != null && heuresMoyennesParJour != null && heuresMoyennesParJour > 0) {
            return heuresTotales / (30.0 * heuresMoyennesParJour);
        }
        return null;
    }

    public int getId_frequence() {
        return id_frequence;
    }

    public void setId_frequence(int id_frequence) {
        this.id_frequence = id_frequence;
    }

    public FrequenceStandard getFrequenceStandard() {
        return frequenceStandard;
    }

    public void setFrequenceStandard(FrequenceStandard frequenceStandard) {
        this.frequenceStandard = frequenceStandard;
    }

    public Integer getValeurPersonnalisee() {
        return valeurPersonnalisee;
    }

    public void setValeurPersonnalisee(Integer valeurPersonnalisee) {
        this.valeurPersonnalisee = valeurPersonnalisee;
    }

    public UniteFrequence getUnitePersonnalisee() {
        return unitePersonnalisee;
    }

    public void setUnitePersonnalisee(UniteFrequence unitePersonnalisee) {
        this.unitePersonnalisee = unitePersonnalisee;
    }

    public Integer getHeuresTotales() {
        return heuresTotales;
    }

    public void setHeuresTotales(Integer heuresTotales) {
        this.heuresTotales = heuresTotales;
    }

    public Double getHeuresMoyennesParJour() {
        return heuresMoyennesParJour;
    }

    public void setHeuresMoyennesParJour(Double heuresMoyennesParJour) {
        this.heuresMoyennesParJour = heuresMoyennesParJour;
    }

    // Getters, setters, constructeurs
}
