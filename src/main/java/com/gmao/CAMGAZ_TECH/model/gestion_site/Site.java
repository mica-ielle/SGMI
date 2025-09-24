package com.gmao.CAMGAZ_TECH.model.gestion_site;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.Planifier;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.ToString;

import java.time.LocalDate;
import java.util.List;


@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Site {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_site;
    private String nom;
    private String ville;
    private String nom_contact;
    private String tel_contact;

    @NonNull
    private LocalDate dateCreation;

    public enum TypeInstallation {
        CARBURATION,
        VAPORISATION_SIMPLE,
        VAPORISATION_ELECTRIQUE,
        AUTRE
    }

    private TypeInstallation type;


    @OneToMany(mappedBy = "site", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Planifier> planifies;

    @OneToMany(mappedBy = "site", fetch = FetchType.LAZY)
    private List<EquipementInstalle> equipementInstalles;

    public int getId_site() {
        return id_site;
    }

    public void setId_site(int id_site) {
        this.id_site = id_site;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getNom_contact() {
        return nom_contact;
    }

    public void setNom_contact(String nom_contact) {
        this.nom_contact = nom_contact;
    }

    public String getTel_contact() {
        return tel_contact;
    }

    public void setTel_contact(String tel_contact) {
        this.tel_contact = tel_contact;
    }

    public List<EquipementInstalle> getEquipementInstalles() {
        return equipementInstalles;
    }

    public void setEquipementInstalles(List<EquipementInstalle> equipementInstalles) {
        this.equipementInstalles = equipementInstalles;
    }

    public List<Planifier> getPlanifies() {
        return planifies;
    }

    public void setPlanifies(List<Planifier> planifies) {
        this.planifies = planifies;
    }

    public TypeInstallation getType() {
        return type;
    }

    public void setType(TypeInstallation type) {
        this.type = type;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }
}
