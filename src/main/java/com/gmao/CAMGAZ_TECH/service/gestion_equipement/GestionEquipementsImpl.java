package com.gmao.CAMGAZ_TECH.service.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Frequence;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.EquipementRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.FrequenceRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_stock.PieceRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.TacheRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GestionEquipementsImpl implements GestionEquipements {

    private final EquipementRepository equipementRepository;
    private final TacheRepository tacheRepository;
    private final PieceRepository pieceRepository;
    private final FrequenceRepository frequenceRepository;
    private Equipement equipement;
    final static Logger logger = LoggerFactory.getLogger(GestionEquipementsImpl.class);

    @Autowired
    public GestionEquipementsImpl(EquipementRepository equipementRepository, TacheRepository tacheRepository, PieceRepository pieceRepository, FrequenceRepository frequenceRepository) {
        this.equipementRepository = equipementRepository;
        this.tacheRepository = tacheRepository;
        this.pieceRepository = pieceRepository;
        this.frequenceRepository = frequenceRepository;
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
            frequenceRepository.save(tache.getFrequence());
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
    public Equipement updateEquipement(int equipementId, List<Tache> tacheList, List<Piece> pieceList) {

        this.equipement = equipementRepository.findById(equipementId).get();


        for (Tache tache:tacheList) {


            Optional<Tache> existingTache = tacheRepository.findById(tache.getId_tache());

            if ((existingTache.isPresent())){

                Tache tacheToUpdate = existingTache.get();

                updateTache(equipementId, this.equipement, tacheList);
                tacheRepository.save(tacheToUpdate);
            }else {
                tache.setEquipement(this.equipement);
                frequenceRepository.save(tache.getFrequence());
                tacheRepository.save(tache);
            }
        }

        for (Piece piece:pieceList) {


            Optional<Piece> existingPiece = pieceRepository.findById(piece.getId_piece());

            if ((existingPiece.isPresent())){

                Piece pieceToUpdate = existingPiece.get();

                updatePiece(equipementId, this.equipement, pieceList);
                pieceRepository.save(pieceToUpdate);
            }else {
                piece.setEquipement(this.equipement);
                pieceRepository.save(piece);
            }
        }
        logger.info("Equipement successfully updated ");

        return equipementRepository.save(this.equipement);
    }


    private void updateTache(int equipementId, Equipement equipement, List<Tache> nouvellesTaches) {


        equipement.getTaches().removeIf(existingTache ->
                nouvellesTaches.stream().noneMatch(

                        nouvelleTache -> nouvelleTache.getId_tache() == existingTache.getId_tache())
        );
        for (Tache nouvelleTache : nouvellesTaches){
            Optional<Tache> existingTache = tacheRepository.findById(nouvelleTache.getId_tache());
            if (existingTache.isPresent()){
                try {

                    Tache tacheToUpdate = existingTache.get();

                    tacheToUpdate.setNom(nouvelleTache.getNom());
                    tacheToUpdate.setType(nouvelleTache.getType());
                    tacheToUpdate.setEquipement(getEquipementByID(equipementId));

                    Frequence f = tacheToUpdate.getFrequence();
                    f.setFrequenceStandard(nouvelleTache.getFrequence().getFrequenceStandard());
                    f.setHeuresTotales(nouvelleTache.getFrequence().getHeuresTotales());
                    f.setHeuresMoyennesParJour(nouvelleTache.getFrequence().getHeuresMoyennesParJour());
                    f.setUnitePersonnalisee(nouvelleTache.getFrequence().getUnitePersonnalisee());
                    f.setValeurPersonnalisee(nouvelleTache.getFrequence().getValeurPersonnalisee());

                    frequenceRepository.save(f);
                    tacheToUpdate.setFrequence(f);

                    tacheRepository.save(tacheToUpdate);


                } catch (ChangeSetPersister.NotFoundException e) {
                    throw new RuntimeException(e);
                }
            }else {
                nouvelleTache.setEquipement(equipement);

                tacheRepository.save(nouvelleTache);
                equipement.getTaches().add(nouvelleTache);
            }
        }

        logger.info("Taches successfully updated ");
    }

    private void updatePiece(int equipementId, Equipement equipement, List<Piece> nouvellesPieces) {


        equipement.getPieces().removeIf(existingPiece ->
                nouvellesPieces.stream().noneMatch(

                        nouvellePiece -> nouvellePiece.getId_piece() == existingPiece.getId_piece())
        );
        for (Piece nouvellePiece : nouvellesPieces){
            Optional<Piece> existingPiece = pieceRepository.findById(nouvellePiece.getId_piece());
            if (existingPiece.isPresent()){
                try {

                    Piece pieceToUpdate = existingPiece.get();

                    pieceToUpdate.setNom(nouvellePiece.getNom());
                    pieceToUpdate.setReference(nouvellePiece.getReference());

                    pieceToUpdate.setEquipement(getEquipementByID(equipementId));

                    pieceRepository.save(pieceToUpdate);


                } catch (ChangeSetPersister.NotFoundException e) {
                    throw new RuntimeException(e);
                }
            }else {
                nouvellePiece.setEquipement(equipement);

                pieceRepository.save(nouvellePiece);
                equipement.getPieces().add(nouvellePiece);
            }
        }

        logger.info("Piece successfully updated ");
    }

    @Override
    public boolean deleteEquipement(int equipementId) {
        boolean check1=equipementRepository.existsById(equipementId);
        if(check1) {
            try {
                equipement = getEquipementByID(equipementId);

                for (Tache tache:equipement.getTaches()) {

                    tacheRepository.deleteById(tache.getId_tache());
                    frequenceRepository.deleteById(tache.getFrequence().getId_frequence());
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

}
