package com.gmao.CAMGAZ_TECH.model.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;

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


    @OneToMany(mappedBy = "site")
    private List<TachePlanifie> tachePlanifies;

    @OneToMany(mappedBy = "site")
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

    public List<TachePlanifie> getTachePlanifies() {
        return tachePlanifies;
    }

    public void setTachePlanifies(List<TachePlanifie> tachePlanifies) {
        this.tachePlanifies = tachePlanifies;
    }
}
