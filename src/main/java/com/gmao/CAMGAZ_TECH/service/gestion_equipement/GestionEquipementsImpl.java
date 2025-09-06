package com.gmao.CAMGAZ_TECH.service.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Piece;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.EquipementRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.PieceRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.TacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GestionEquipementsImpl implements GestionEquipements {

    private final EquipementRepository equipementRepository;
    private final TacheRepository tacheRepository;
    private final PieceRepository pieceRepository;
    private Equipement equipement;
    final static Logger logger = LoggerFactory.getLogger(GestionEquipementsImpl.class);

    @Autowired
    public GestionEquipementsImpl(EquipementRepository equipementRepository, TacheRepository tacheRepository, PieceRepository pieceRepository) {
        this.equipementRepository = equipementRepository;
        this.tacheRepository = tacheRepository;
        this.pieceRepository = pieceRepository;
    }

    @Override
    public Equipement createEquipement(Equipement equipement) {
        logger.info("Equipement successfully created: "+equipement.toString());

        Equipement e = equipementRepository.save(equipement);

        for (Tache tache:equipement.getTaches()) {
            try {
                tache.setEquipement(getEquipementByID(e.getId_equipement()));
            } catch (ChangeSetPersister.NotFoundException ex) {
                throw new RuntimeException(ex);
            }
            tacheRepository.save(tache);
        }
        for (Piece piece: equipement.getPieces()) {
            try {
                piece.setEquipement(getEquipementByID(e.getId_equipement()));
            } catch (ChangeSetPersister.NotFoundException ex) {
                throw new RuntimeException(ex);
            }
            pieceRepository.save(piece);
        }

        return e;
    }

    @Override
    public Equipement getEquipementByID(int equipementId)throws ChangeSetPersister.NotFoundException {
        //check if an equipment with this id exist
        boolean check=equipementRepository.existsById(equipementId);
        if(check) {
            logger.info("All equipements successfully loaded ");
            return equipementRepository.findById(equipementId).get();
        }
        else {
            logger.info("No Equipment was found ");
            throw new ChangeSetPersister.NotFoundException();
        }
    }

    @Override
    public Tache updateTache(int tacheId, Tache tache) {

        Tache t = tacheRepository.findById(tacheId).get();

        t.setNom(tache.getNom());
        t.setType(tache.getType());
        t.setFrequence(tache.getFrequence());

        logger.info("Taches successfully updated ");
        //save modifications
        return tacheRepository.save(t);
    }
    @Override
    public Piece updatePiece(int pieceId, Piece piece) {

        Piece p = pieceRepository.findById(pieceId).get();

        p.setNom(piece.getNom());
        p.setReference(piece.getReference());

        logger.info("Piece successfully updated ");
        //save modifications
        return pieceRepository.save(p);
    }

    @Override
    public boolean deleteEquipement(int equipementId) {
        boolean check1=equipementRepository.existsById(equipementId);
        if(check1) {
            try {
                equipement = getEquipementByID(equipementId);

                for (Tache tache:equipement.getTaches()) {
                    tacheRepository.deleteById(tache.getId_tache());
                }
                for (Piece piece: equipement.getPieces()) {
                    pieceRepository.deleteById(piece.getId_piece());
                }

                equipementRepository.deleteById(equipementId);

                logger.info("Equipement was successfully deleted ");
                return true;

            } catch (ChangeSetPersister.NotFoundException e) {
                throw new RuntimeException(e);
            }

        }
        else {
            logger.info("Equipement does not exist ");
            return false;
        }
    }

    @Override
    public List<Equipement> findAllEquipements() {
        return equipementRepository.findAll();
    }

    @Override
    public List<Equipement> readByType(String type) {
        return null;
    }
}
