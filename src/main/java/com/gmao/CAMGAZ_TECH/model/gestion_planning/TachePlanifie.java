package com.gmao.CAMGAZ_TECH.model.gestion_planning;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Frequence;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.sql.Date;
import java.util.List;


@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties("site")
public class TachePlanifie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_tachePlanifie;


    @ManyToOne
    @JoinColumn(name = "id_site")
    private Site site;

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


    private Date dernierIntervention;
    private Date datePrevu;

    public int getId_tachePlanifie() {
        return id_tachePlanifie;
    }

    public void setId_tachePlanifie(int id_tachePlanifie) {
        this.id_tachePlanifie = id_tachePlanifie;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
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

    public Date getDernierIntervention() {
        return dernierIntervention;
    }

    public void setDernierIntervention(Date dernierIntervention) {
        this.dernierIntervention = dernierIntervention;
    }

    public Date getDatePrevu() {
        return datePrevu;
    }

    public void setDatePrevu(Date datePrevu) {
        this.datePrevu = datePrevu;
    }
}
