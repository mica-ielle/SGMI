package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;

import java.util.List;

public class RequetGetPlanning {
    private OccurenceMainteance occurenceMainteance;
    private Equipement equipement;
    private List<Tache> tacheList;

    public RequetGetPlanning(OccurenceMainteance occurenceMainteance, Equipement equipement, List<Tache> tacheList) {
        this.occurenceMainteance = occurenceMainteance;
        this.equipement = equipement;
        this.tacheList = tacheList;
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

    public List<Tache> getTacheList() {
        return tacheList;
    }

    public void setTacheList(List<Tache> tacheList) {
        this.tacheList = tacheList;
    }
}
