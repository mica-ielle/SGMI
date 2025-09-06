package com.gmao.CAMGAZ_TECH.controller.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Piece;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.service.gestion_equipement.GestionEquipementsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/equipement")
public class EquipementController {

    final static Logger logger = LoggerFactory.getLogger(EquipementController.class);

    @Autowired
    public GestionEquipementsImpl service;


    @PostMapping("/create")
    public Equipement create(@RequestBody Equipement equipement)
    {
        logger.info(equipement.toString());
        return service.createEquipement(equipement);
    }

    @GetMapping("/get")
    public List<Equipement> get()
    {
        List<Equipement> equipementList = service.findAllEquipements();
        return equipementList;
    }

/*    @PutMapping("/update/{equipementId}")
    public boolean update(@PathVariable int equipementId, @RequestBody Equipement equipement)
    {
        return service.updateEquipement(equipementId,equipement);
    }
 */
    @PutMapping("/update_tache/{tacheId}")
    public Tache update(@PathVariable int tacheId, @RequestBody Tache tache)
    {
        return service.updateTache(tacheId,tache);
    }
    @PutMapping("/update_piece/{pieceId}")
    public Piece update(@PathVariable int pieceId, @RequestBody Piece piece)
    {
        return service.updatePiece(pieceId,piece);
    }

    @DeleteMapping("/delete/{equipementId}")
    public boolean delete(@PathVariable int equipementId)
    {
        return service.deleteEquipement(equipementId);
    }

}
