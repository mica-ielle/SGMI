package com.gmao.CAMGAZ_TECH.service.gestion_planning;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.FicheIntervention;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.PieceRemplacee;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;

import java.sql.Date;
import java.util.List;

public interface GestionPlanning {

    public OccurenceMainteance createOccurenceMainteance(OccurenceMainteance occurenceMainteance, int equipementId);

    //conversion des frequences
    public int frequenceEnMois(int heureTotal, int heureMoyenne);

    //affichage des planning
    public List<OccurenceMainteance> getPlanningCalendrier();
    public List<OccurenceMainteance> getPlanningTableau();

    //actions sur les taches
    public TachePlanifie createTachePlanifie(TachePlanifie tachePlanifie, int siteIdList);
    public TachePlanifie affecteTachePlanifie(int idTachePlanifie, String nom);
    public TachePlanifie reporterTachePlanifie(int idTachePlanifie, Date dateReporte);
    public TachePlanifie annuleTachePlanifie(int idTachePlanifie);
    public TachePlanifie valideTachePlanifie(int idTachePlanifie);




    public FicheIntervention createFicheIntervention(FicheIntervention ficheIntervention, int equipementId, List<Integer> pieceList);


    public boolean deleteTachePlanifie(int idTachePlanifie);

    //fiche historique


}
