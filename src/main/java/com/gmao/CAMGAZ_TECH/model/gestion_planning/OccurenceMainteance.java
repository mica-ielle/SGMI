package com.gmao.CAMGAZ_TECH.model.gestion_planning;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Frequence;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDate;
import java.util.List;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class OccurenceMainteance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_occurenceMainteance;

    @ManyToOne
    @JoinColumn(name = "id_equipementInstalle")
    @JsonBackReference(value = "occurence-equipementInstalle")
    private EquipementInstalle equipementInstalle;

    @OneToOne
    @JoinColumn(name = "id_occurenceMainteance")
    private Tache tache;

    @ManyToOne
    @JoinColumn(name = "id_frequence")
    private Frequence frequence;

    @NonNull
    private LocalDate datePrevue;

    public  enum StatutMaintenance{
        PLANIFIEE,
        REALISEE,
        ANNULEE,
        REPORTEE
    }
    private StatutMaintenance statut;

    public int getId_occurenceMainteance() {
        return id_occurenceMainteance;
    }

    public void setId_occurenceMainteance(int id_occurenceMainteance) {
        this.id_occurenceMainteance = id_occurenceMainteance;
    }

    public EquipementInstalle getEquipementInstalle() {
        return equipementInstalle;
    }

    public void setEquipementInstalle(EquipementInstalle equipementInstalle) {
        this.equipementInstalle = equipementInstalle;
    }

    public Tache getTache() {
        return tache;
    }

    public void setTache(Tache tache) {
        this.tache = tache;
    }

    public LocalDate getDatePrevue() {
        return datePrevue;
    }

    public void setDatePrevue(LocalDate datePrevue) {
        this.datePrevue = datePrevue;
    }

    public StatutMaintenance getStatut() {
        return statut;
    }

    public void setStatut(StatutMaintenance statut) {
        this.statut = statut;
    }

    public Frequence getFrequence() {
        return frequence;
    }

    public void setFrequence(Frequence frequence) {
        this.frequence = frequence;
    }
}
