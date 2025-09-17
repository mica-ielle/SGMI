package com.gmao.CAMGAZ_TECH.service.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import org.springframework.data.crossstore.ChangeSetPersister;

import java.util.List;

public interface GestionEquipements {

    public Equipement createEquipement(Equipement equipement);

    public Equipement getEquipementByID(int id) throws ChangeSetPersister.NotFoundException;

    public Equipement updateEquipement(int equipementId, List<Tache> tacheList, List<Piece> pieceList);

    public boolean deleteEquipement(int equipementId);

    public List<Equipement> findAllEquipements() ;

}
