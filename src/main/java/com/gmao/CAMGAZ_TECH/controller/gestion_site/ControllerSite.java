package com.gmao.CAMGAZ_TECH.controller.gestion_site;

import com.gmao.CAMGAZ_TECH.DTO.RequetCreateSite;
import com.gmao.CAMGAZ_TECH.DTO.RequetInstallEquipement;
import com.gmao.CAMGAZ_TECH.DTO.RequetUpdateSite;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import com.gmao.CAMGAZ_TECH.service.gestion_site.GestionSiteImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/site")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ControllerSite {

    final static Logger logger = LoggerFactory.getLogger(ControllerSite.class);

    @Autowired
    public GestionSiteImpl service;


    @PostMapping("/create")
    public Site create(@RequestBody RequetCreateSite createSite)
    {
        logger.info(createSite.getSite().toString());
        return service.createSite(createSite.getSite(), createSite.getEquipementIdList(), createSite.getDateInstall(), createSite.getDateMap());
    }

    @GetMapping("/get")
    public List<Site> get()
    {
        List<Site> siteList = service.findAllSites();
        return siteList;
    }

    @PutMapping("/update/{siteId}")
    public Site update(@PathVariable int siteId, @RequestBody RequetUpdateSite updateSite)
    {
        return service.updateSite(siteId, updateSite.getSite(), updateSite.getNouveauEquipementInstalles());
    }

    @DeleteMapping("/delete/{siteId}")
    public boolean delete(@PathVariable int siteId)
    {
        return service.deleteSite(siteId);
    }


    @PostMapping("/install-equipements")
    public List<EquipementInstalle> installEquipement(@RequestBody RequetInstallEquipement rInstallEquipement)
    {
        logger.info(rInstallEquipement.toString());
        return service.installEquipement(rInstallEquipement.getSiteId(), rInstallEquipement.getEquipementsId(), rInstallEquipement.getDatesInstall());
    }


    @GetMapping("/getByTp/{idTp}")
    public Site getByTp(@PathVariable int idTp)
    {
        Site site = service.findSiteByTp(idTp);
        return site;
    }

}
