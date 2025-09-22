package com.gmao.CAMGAZ_TECH.model.gestion_planning;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
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
    @JoinColumn(name = "id_equipement")
    @JsonBackReference(value = "occurence-equipement")
    private Equipement equipement;

    @OneToMany(mappedBy = "occurenceMainteance")
    @JsonBackReference(value = "occurence-tache")
    private List<Tache> taches;

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

    public Equipement getEquipement() {
        return equipement;
    }

    public void setEquipement(Equipement equipement) {
        setTaches(equipement.getTaches());
        this.equipement = equipement;
    }

    public List<Tache> getTaches() {
        return taches;
    }

    public void setTaches(List<Tache> taches) {
        this.taches = taches;
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
}
