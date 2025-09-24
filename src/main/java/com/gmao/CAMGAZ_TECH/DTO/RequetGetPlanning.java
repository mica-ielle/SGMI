package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;

import java.util.List;

public class RequetGetPlanning {
    private OccurenceMainteance occurenceMainteance;
    private Equipement equipement;
    private Tache tache;

    public RequetGetPlanning(OccurenceMainteance occurenceMainteance, Equipement equipement, Tache tache) {
        this.occurenceMainteance = occurenceMainteance;
        this.equipement = equipement;
        this.tache = tache;
    }

    public OccurenceMainteance getOccurenceMainteance() {
        return occurenceMainteance;
    }

    public void setOccurenceMainteance(OccurenceMainteance occurenceMainteance) {
        this.occurenceMainteance = occurenceMainteance;
    }

    public Equipement getEquipement() {
        return equipement;
    }

    public void setEquipement(Equipement equipement) {
        this.equipement = equipement;
    }

    public Tache getTache() {
        return tache;
    }

    public void setTache(Tache tache) {
        this.tache = tache;
    }
}
