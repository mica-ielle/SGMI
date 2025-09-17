package com.gmao.CAMGAZ_TECH.model.gestion_planning;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Frequence;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;


@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class TachePlanifie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_tachePlanifie;


    @OneToMany(mappedBy = "tachePlanifie", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Planifier> planifiers;


    private String nom;
    private String responsable;

    public  enum StatutTache{
        PLANIFIEE,
        REALISEE,
        ANNULEE,
        REPORTEE
    }
    private StatutTache statut;


    public enum TypeTachePlanifie {
        VISITE,
        ENTRETIEN,
        PREVENTIF
    }

    private TypeTachePlanifie type;

    // ✅ ANNOTATION POUR FORCER LA SÉRIALISATION AU FORMAT ISO
    @ElementCollection
    @JsonFormat(pattern = "yyyy-MM-dd")
    private List<LocalDate> dernierIntervention;

    @ManyToOne
    @JoinColumn(name = "id_frequence")
    private Frequence frequence;

    // ✅ ANNOTATION POUR FORCER LA SÉRIALISATION AU FORMAT ISO
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate datePrevu;

    public int getId_tachePlanifie() {
        return id_tachePlanifie;
    }

    public void setId_tachePlanifie(int id_tachePlanifie) {
        this.id_tachePlanifie = id_tachePlanifie;
    }

    public List<Planifier> getPlanifiers() {
        return planifiers;
    }

    public void setPlanifiers(List<Planifier> planifiers) {
        this.planifiers = planifiers;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

    public StatutTache getStatut() {
        return statut;
    }

    public void setStatut(StatutTache statut) {
        this.statut = statut;
    }

    public TypeTachePlanifie getType() {
        return type;
    }

    public void setType(TypeTachePlanifie type) {
        this.type = type;
    }

    public List<LocalDate> getDernierIntervention() {
        return dernierIntervention;
    }

    public void setDernierIntervention(List<LocalDate> dernierIntervention) {
        this.dernierIntervention = dernierIntervention;
    }

    public Frequence getFrequence() {
        return frequence;
    }

    public void setFrequence(Frequence frequence) {
        this.frequence = frequence;
    }

    public LocalDate getDatePrevu() {
        return datePrevu;
    }

    public void setDatePrevu(LocalDate datePrevu) {
        this.datePrevu = datePrevu;
    }
}
