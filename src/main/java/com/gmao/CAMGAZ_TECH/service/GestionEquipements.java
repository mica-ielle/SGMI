package com.gmao.CAMGAZ_TECH.service;

import com.gmao.CAMGAZ_TECH.model.Equipement;
import com.gmao.CAMGAZ_TECH.model.Piece;
import com.gmao.CAMGAZ_TECH.model.Tache;
import org.springframework.data.crossstore.ChangeSetPersister;

import java.util.List;

public interface GestionEquipements {

    public Equipement createEquipement(Equipement equipement);

    public Equipement getEquipementByID(int id) throws ChangeSetPersister.NotFoundException;

   // public boolean updateEquipement(int equipementId, Equipement equipement);


    public Tache updateTache(int tacheId, Tache tache);

    public Piece updatePiece(int pieceId, Piece piece);

    public boolean deleteEquipement(int equipementId);

    public List<Equipement> findAllEquipements() ;

    public List<Equipement> readByType(String type);



}
