package com.gmao.CAMGAZ_TECH.service.gestion_planning;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.*;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

public interface GestionPlanning {

    public OccurenceMainteance createOccurenceMainteance(OccurenceMainteance occurenceMainteance, EquipementInstalle equipementI);

    //conversion des frequences
    public int frequenceEnMois(int heureTotal, int heureMoyenne);

    //affichage des planning
    public List<OccurenceMainteance> getPlanningCalendrier();
    public List<OccurenceMainteance> getPlanningTableau();

    //actions sur les taches
    public List<TachePlanifie> createTachePlanifie(TachePlanifie tachePlanifie, List<Planifier> planifiers);
    public TachePlanifie affecteTachePlanifie(int idTachePlanifie, String nom);
    public TachePlanifie reporterTachePlanifie(int idTachePlanifie, LocalDate dateReporte);
    public TachePlanifie annuleTachePlanifie(int idTachePlanifie);
    public TachePlanifie valideTachePlanifie(int idTachePlanifie);




    public FicheIntervention createFicheIntervention(FicheIntervention ficheIntervention, int equipementId, List<Integer> pieceList);

    public List<FicheIntervention> getFicheIntervention();


    public boolean deleteTachePlanifie(int idTachePlanifie);

    //fiche historique

    public List<TachePlanifie> getTachesPlanifie();
    public TachePlanifie getTachesPlanifieById(int tachePId);
    public TachePlanifie updateTachePlanifie(int tachePId, TachePlanifie tachePlanifie);


    public List<Planifier> getPlanifiersByTacheId(int tachePlanifieId);


    public boolean deleteOccurence(int tachePlanifieId);
}
