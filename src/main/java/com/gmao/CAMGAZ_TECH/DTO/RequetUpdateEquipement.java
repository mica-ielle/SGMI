package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;

import java.util.List;

public class RequetUpdateEquipement {

    private int equipementId;
    private List<Tache> tacheList;
    private List<Piece> pieceList;


    public RequetUpdateEquipement(int equipementId, List<Tache> tacheList, List<Piece> pieceList) {
        this.equipementId = equipementId;
        this.tacheList = tacheList;
        this.pieceList = pieceList;
    }

    public int getEquipementId() {
        return equipementId;
    }

    public void setEquipementId(int equipementId) {
        this.equipementId = equipementId;
    }

    public List<Tache> getTacheList() {
        return tacheList;
    }

    public void setTacheList(List<Tache> tacheList) {
        this.tacheList = tacheList;
    }

    public List<Piece> getPieceList() {
        return pieceList;
    }

    public void setPieceList(List<Piece> pieceList) {
        this.pieceList = pieceList;
    }
}
