package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.FicheIntervention;

import java.util.List;

public class RequetCreateFiche {

    private FicheIntervention ficheIntervention;
    private int equipementId;
    private List<Integer> pieceList;

    public RequetCreateFiche(FicheIntervention ficheIntervention, int equipementId, List<Integer> pieceList) {
        this.ficheIntervention = ficheIntervention;
        this.equipementId = equipementId;
        this.pieceList = pieceList;
    }

    public FicheIntervention getFicheIntervention() {
        return ficheIntervention;
    }

    public void setFicheIntervention(FicheIntervention ficheIntervention) {
        this.ficheIntervention = ficheIntervention;
    }

    public int getEquipementId() {
        return equipementId;
    }

    public void setEquipementId(int equipementId) {
        this.equipementId = equipementId;
    }

    public List<Integer> getPieceList() {
        return pieceList;
    }

    public void setPieceList(List<Integer> pieceList) {
        this.pieceList = pieceList;
    }
}
