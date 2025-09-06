package com.gmao.CAMGAZ_TECH.model.gestion_site;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.sql.Date;
import java.util.List;
import java.util.Map;

@Entity
@ToString
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties("site")
public class EquipementInstalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_equipementInstalle;


    @ManyToOne
    @JoinColumn(name = "id_site")
    private Site site;

    @ManyToOne
    @JoinColumn(name = "id_equipement")
    private Equipement equipement;

    private Date date_installation;
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<Integer,Date> derniere_maintenance;

    public int getId_equipementInstalle() {
        return id_equipementInstalle;
    }

    public void setId_equipementInstalle(int id_equipementInstalle) {
        this.id_equipementInstalle = id_equipementInstalle;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public Equipement getEquipement() {
        return equipement;
    }

    public void setEquipement(Equipement equipement) {
        this.equipement = equipement;
    }

    public Date getDate_installation() {
        return date_installation;
    }

    public void setDate_installation(Date date_installation) {
        this.date_installation = date_installation;
    }

    public Map<Integer, Date> getDerniere_maintenance() {
        return derniere_maintenance;
    }

    public void setDerniere_maintenance(Map<Integer, Date> derniere_maintenance) {
        this.derniere_maintenance = derniere_maintenance;
    }
}
