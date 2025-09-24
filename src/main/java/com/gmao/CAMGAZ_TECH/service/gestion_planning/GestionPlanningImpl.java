package com.gmao.CAMGAZ_TECH.service.gestion_planning;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Frequence;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.*;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.FrequenceRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_planning.*;
import com.gmao.CAMGAZ_TECH.repository.gestion_stock.PieceRepository;
import com.gmao.CAMGAZ_TECH.service.gestion_equipement.GestionEquipementsImpl;
import com.gmao.CAMGAZ_TECH.service.gestion_site.GestionSiteImpl;
import com.gmao.CAMGAZ_TECH.service.gestion_stock.GestionStockImpl;
import jakarta.transaction.Transactional;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GestionPlanningImpl implements GestionPlanning{

    private final FicheInterventionRepository ficheInterventionRepository;
    private final OccurenceMaintenanceRepository occurenceMaintenanceRepository;
    private final PieceRemplaceeRepository pieceRemplaceeRepository;
    private final TachePlanifieRepository tachePlanifieRepository;
    private final PieceRepository pieceRepository;
    private final FrequenceRepository frequenceRepository;
    private final PlanifierRepository planifierRepository;


    @Autowired
    private GestionEquipementsImpl gestionEquipements;

    @Autowired
    @Lazy
    private GestionSiteImpl gestionSite;

    @Autowired
    private GestionStockImpl gestionStock;

    final static Logger logger = LoggerFactory.getLogger(GestionPlanningImpl.class);


    public GestionPlanningImpl(FicheInterventionRepository ficheInterventionRepository, OccurenceMaintenanceRepository occurenceMaintenanceRepository, PieceRemplaceeRepository pieceRemplaceeRepository, TachePlanifieRepository tachePlanifieRepository, PieceRepository pieceRepository, FrequenceRepository frequenceRepository, PlanifierRepository planifierRepository) {
        this.ficheInterventionRepository = ficheInterventionRepository;
        this.occurenceMaintenanceRepository = occurenceMaintenanceRepository;
        this.pieceRemplaceeRepository = pieceRemplaceeRepository;
        this.tachePlanifieRepository = tachePlanifieRepository;
        this.pieceRepository = pieceRepository;
        this.frequenceRepository = frequenceRepository;
        this.planifierRepository = planifierRepository;
    }


    @Override
    public OccurenceMainteance createOccurenceMainteance(OccurenceMainteance occurenceMainteancePl, EquipementInstalle equipementI) {


        occurenceMainteancePl.setEquipementInstalle(equipementI);

        OccurenceMainteance oc = occurenceMaintenanceRepository.save(occurenceMainteancePl);


        logger.info("OccurenceMainteance successfully created: "+occurenceMainteancePl.toString());

        return oc;
    }

    private void updatOccurenceMaintenance(int occurenceID, Tache tache){
        tache.setOccurenceMainteance(occurenceMaintenanceRepository.findById(occurenceID).get());
    }


    @Override
    public int frequenceEnMois(int heureTotal, int heureMoyenne) {
        return heureTotal/(30*heureMoyenne);
    }

    @Override
    public List<OccurenceMainteance> getPlanningCalendrier() {
        List<OccurenceMainteance> occurenceMainteanceList = occurenceMaintenanceRepository.findAll();

        List<OccurenceMainteance> planning = new ArrayList<>();

        for (OccurenceMainteance o:occurenceMainteanceList) {

            LocalDate origine = o.getDatePrevue() != null
                    ? LocalDate.from(o.getDatePrevue())
                    : LocalDate.now(); // or any default

            LocalDate fin = origine.plusYears(3);

            /*for (Tache tache : o.getTaches()) {
                LocalDate prochaineDate = origine;
                Period intervalle = calculerIntervalle(tache.getFrequence());

                while (prochaineDate.isBefore(fin)) {
                    OccurenceMainteance occ = o;
                    occ.setStatut(OccurenceMainteance.StatutMaintenance.PLANIFIEE);
                    planning.add(occ);

                    prochaineDate = prochaineDate.plus(intervalle);
                }
            }*/
            planning.add(o);
        }

        return planning;
    }

    private Period calculerIntervalle(Frequence frequence) {
        if (frequence.getFrequenceStandard() != null) {
            return switch (frequence.getFrequenceStandard().getUnite()) {
                case MOIS -> Period.ofMonths(frequence.getFrequenceStandard().getValeur());
                case ANNEES -> Period.ofYears(frequence.getFrequenceStandard().getValeur());
                default -> Period.ofDays(30); // fallback
            };
        } else if (frequence.getUnitePersonnalisee() == Frequence.UniteFrequence.HEURES_UTILISATION) {
            double mois = frequence.calculerEquivalenceEnMois();
            return Period.ofDays((int) (mois * 30));
        } else {
            return switch (frequence.getUnitePersonnalisee()) {
                case JOURS -> Period.ofDays(frequence.getValeurPersonnalisee());
                case SEMAINES -> Period.ofWeeks(frequence.getValeurPersonnalisee());
                case MOIS -> Period.ofMonths(frequence.getValeurPersonnalisee());
                case ANNEES -> Period.ofYears(frequence.getValeurPersonnalisee());
                default -> Period.ofDays(30);
            };
        }
    }



    @Override
    public List<OccurenceMainteance> getPlanningTableau() {
        return null;
    }

    @Override
    @Transactional
    public List<TachePlanifie> createTachePlanifie(TachePlanifie tachePlanifie, List<Planifier> planifiers) {
        List<TachePlanifie> tachePlanifies = new ArrayList<>();

        // Sauvegarder la fréquence une seule fois
        Frequence frequence = frequenceRepository.save(tachePlanifie.getFrequence());

        LocalDate origine = tachePlanifie.getDatePrevu();
        LocalDate prochaineDate = origine;
        Period intervalle = calculerIntervalle(frequence);
        LocalDate fin = origine.plusYears(3);

        while (prochaineDate.isBefore(fin)) {
            // Créer une nouvelle instance de TachePlanifie à chaque itération
            TachePlanifie nouvelleTache = new TachePlanifie();
            nouvelleTache.setDatePrevu(prochaineDate);
            nouvelleTache.setFrequence(frequence);
            nouvelleTache.setStatut(TachePlanifie.StatutTache.PLANIFIEE);
            // Copie des autres champs si nécessaire (ex: équipement, utilisateur, etc.)
            nouvelleTache.setNom(tachePlanifie.getNom());
            nouvelleTache.setResponsable(tachePlanifie.getResponsable());
            nouvelleTache.setType(tachePlanifie.getType());
            nouvelleTache.setDernierIntervention(tachePlanifie.getDernierIntervention());
            // ... autres champs à copier

            TachePlanifie savedTache = tachePlanifieRepository.save(nouvelleTache);

            List<Planifier> planifiersAssocies = new ArrayList<>();
            for (Planifier planifier : planifiers) {
                Planifier nouveauPlanifier = new Planifier();
                // Copier les champs nécessaires
                nouveauPlanifier.setDatePlanifie(planifier.getDatePlanifie());
                nouveauPlanifier.setSite(planifier.getSite());
                // ... autres champs à copier
                nouveauPlanifier.setTachePlanifie(savedTache);

                planifiersAssocies.add(planifierRepository.save(nouveauPlanifier));
            }

            savedTache.setPlanifiers(planifiersAssocies);
            tachePlanifieRepository.save(savedTache); // mise à jour avec les planifiers

            tachePlanifies.add(savedTache);
            prochaineDate = prochaineDate.plus(intervalle);

            logger.info("TachePlanifie créée à la date : " + prochaineDate);
        }

        return tachePlanifies;
    }

    @Override
    public TachePlanifie affecteTachePlanifie(int idTachePlanifie, String nom) {

        TachePlanifie t = tachePlanifieRepository.findById(idTachePlanifie).get();
        t.setResponsable(nom);

        tachePlanifieRepository.save(t);

        return t;
    }

    @Override
    public TachePlanifie reporterTachePlanifie(int idTachePlanifie, LocalDate dateReporte) {

        TachePlanifie t = tachePlanifieRepository.findById(idTachePlanifie).get();
        t.setDatePrevu(dateReporte);
        t.setStatut(TachePlanifie.StatutTache.REPORTEE);

        tachePlanifieRepository.save(t);

        return t;
    }

    @Override
    public TachePlanifie annuleTachePlanifie(int idTachePlanifie) {


        TachePlanifie t = tachePlanifieRepository.findById(idTachePlanifie).get();
        t.setStatut(TachePlanifie.StatutTache.ANNULEE);

        tachePlanifieRepository.save(t);

        return t;
    }

    @Override
    @Transactional
    public boolean deleteTachePlanifie(int idTachePlanifie) {
        Optional<TachePlanifie> optionalTache = tachePlanifieRepository.findById(idTachePlanifie);

        if (optionalTache.isEmpty()) {
            logger.info("TachePlanifie does not exist");
            return false;
        }

        TachePlanifie tachePlanifie = optionalTache.get();

        // Supprimer les planifications liées
        for (Planifier planifier : tachePlanifie.getPlanifiers()) {
            planifierRepository.delete(planifier);
        }

        // Supprimer la fréquence si elle existe
        Frequence frequence = tachePlanifie.getFrequence();
        if (frequence != null) {
            frequenceRepository.delete(frequence);
        }

        // Supprimer la tâche planifiée
        tachePlanifieRepository.delete(tachePlanifie);

        logger.info("TachePlanifie was successfully deleted");
        return true;
    }

    @Override
    public List<TachePlanifie> getTachesPlanifie() {
        return tachePlanifieRepository.findAll();
    }

    @Override
    public TachePlanifie getTachesPlanifieById(int tachePId) {
        return tachePlanifieRepository.findById(tachePId).get();
    }

    @Override
    public TachePlanifie updateTachePlanifie(int tachePId, TachePlanifie tachePlanifie) {
        return null;
    }

    @Override
    public TachePlanifie valideTachePlanifie(int idTachePlanifie) {

        TachePlanifie t = tachePlanifieRepository.findById(idTachePlanifie).get();
        t.setStatut(TachePlanifie.StatutTache.REALISEE);
        t.setDernierIntervention(LocalDate.now());

        tachePlanifieRepository.save(t);

        return t;
    }

    @Override
    public FicheIntervention createFicheIntervention(FicheIntervention ficheIntervention,int equipementId, List<Integer> pieceList) {

        FicheIntervention f = ficheInterventionRepository.save(ficheIntervention);

        try {
            int index = 0;
            for (PieceRemplacee pieceRemplacee:ficheIntervention.getPiecesRemplacees()) {
                //PieceRemplacee pi = pieceRemplaceeRepository.findById(pieceRemplacee.getId_pieceRemplacee()).get();
                pieceRemplacee.setPiece(pieceRepository.findById(pieceList.get(index)).get());
                pieceRemplacee.setFicheIntervention(ficheInterventionRepository.findById(f.getId_ficheIntervention()).get());

                index++;
                pieceRemplaceeRepository.save(pieceRemplacee);


                gestionStock.sortieStock(gestionStock.getByPiece(pieceRemplacee.getPiece()).getId_stock(),pieceRemplacee.getQuantiteUtilisee());

            }

            ficheIntervention.setEquipement(gestionEquipements.getEquipementByID(equipementId));
        } catch (ChangeSetPersister.NotFoundException e) {
            throw new RuntimeException(e);
        }

        logger.info("FicheIntervention successfully created: "+ficheIntervention.toString());
        return ficheInterventionRepository.save(ficheIntervention);
    }

    @Override
    public List<FicheIntervention> getFicheIntervention() {
        return ficheInterventionRepository.findAll();
    }



    @Override
    public List<Planifier> getPlanifiersByTacheId(int tachePlanifieId) {
        try {
            // Récupérer la tâche planifiée avec ses planifiers
            TachePlanifie tachePlanifie = tachePlanifieRepository.findById(tachePlanifieId)
                    .orElseThrow(() -> new RuntimeException("Tâche planifiée non trouvée"));

            // Récupérer tous les planifiers associés à cette tâche
            List<Planifier> planifiers = planifierRepository.findByTachePlanifie(tachePlanifie);

            // Pour chaque planifier, s'assurer que le site et ses équipements sont bien chargés
            for (Planifier planifier : planifiers) {
                if (planifier.getSite() != null) {
                    // Forcer le chargement des équipements installés pour chaque site
                    Hibernate.initialize(planifier.getSite().getEquipementInstalles());

                    // Pour chaque équipement installé, charger les détails de l'équipement
                    if (planifier.getSite().getEquipementInstalles() != null) {
                        for (EquipementInstalle equipementInstalle : planifier.getSite().getEquipementInstalles()) {
                            Hibernate.initialize(equipementInstalle.getEquipement());
                        }
                    }
                }
            }

            logger.info("Planifiers récupérés avec succès: " + planifiers.size() + " planifier(s)");
            return planifiers;

        } catch (Exception e) {
            logger.error("Erreur lors de la récupération des planifiers pour la tâche " + tachePlanifieId, e);
            throw new RuntimeException("Erreur lors de la récupération des planifiers", e);
        }
    }

    @Override
    public boolean deleteOccurence(int tachePlanifieId) {
        return occurenceMaintenanceRepository.existsById(tachePlanifieId);
    }


}
