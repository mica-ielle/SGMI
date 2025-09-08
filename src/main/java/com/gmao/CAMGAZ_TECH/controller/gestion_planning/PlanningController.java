package com.gmao.CAMGAZ_TECH.controller.gestion_planning;

import com.gmao.CAMGAZ_TECH.DTO.RequetCreateFiche;
import com.gmao.CAMGAZ_TECH.DTO.RequetCreateTachePlanifie;
import com.gmao.CAMGAZ_TECH.DTO.RequetGetPlanning;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.FicheIntervention;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;
import com.gmao.CAMGAZ_TECH.service.gestion_planning.GestionPlanningImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/planning")
public class PlanningController {


    final static Logger logger = LoggerFactory.getLogger(PlanningController.class);

    @Autowired
    public GestionPlanningImpl service;

    @GetMapping("/planning")
    public List<RequetGetPlanning> getPlanning()
    {
        List<RequetGetPlanning> requetGetPlannings = new ArrayList<>();

        List<OccurenceMainteance> occurenceMainteanceList = service.getPlanningCalendrier();
        for (OccurenceMainteance o:occurenceMainteanceList){
            RequetGetPlanning requetGetPlanning = new RequetGetPlanning(o, o.getEquipement(), o.getTaches());

            requetGetPlannings.add(requetGetPlanning);
        }
        return requetGetPlannings;
    }

    @PostMapping("/tachePlanifie")
    public TachePlanifie create(@RequestBody RequetCreateTachePlanifie requetCreateTachePlanifie)
    {
        logger.info(requetCreateTachePlanifie.toString());
        return service.createTachePlanifie(requetCreateTachePlanifie.getTachePlanifie(),requetCreateTachePlanifie.getSiteId());
    }

    @PutMapping("/affecte/{tachePlanifieId}")
    public TachePlanifie affecte(@PathVariable int tachePlanifieId, @RequestBody String nom)
    {
        return service.affecteTachePlanifie(tachePlanifieId,nom);
    }

    @PutMapping("/reporte/{tachePlanifieId}")
    public TachePlanifie reporte(@PathVariable int tachePlanifieId, @RequestBody Date dateReporte)
    {
        return service.reporterTachePlanifie(tachePlanifieId,dateReporte);
    }

    @PutMapping("/annule/{tachePlanifieId}")
    public TachePlanifie annule(@PathVariable int tachePlanifieId)
    {
        return service.annuleTachePlanifie(tachePlanifieId);
    }

    @PutMapping("/valide/{tachePlanifieId}")
    public TachePlanifie valide(@PathVariable int tachePlanifieId)
    {
        return service.valideTachePlanifie(tachePlanifieId);
    }

    @PostMapping("/ficheIntervention")
    public FicheIntervention createFiche(@RequestBody RequetCreateFiche requetCreateFiche)
    {
        logger.info(requetCreateFiche.toString());
        return service.createFicheIntervention(requetCreateFiche.getFicheIntervention(), requetCreateFiche.getEquipementId(), requetCreateFiche.getPieceList());
    }

    @DeleteMapping("/delete/{tachePlanifieId}")
    public boolean delete(@PathVariable int tachePlanifieId)
    {
        return service.deleteTachePlanifie(tachePlanifieId);
    }

}
