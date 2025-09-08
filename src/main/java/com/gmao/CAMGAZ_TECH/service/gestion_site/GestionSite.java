package com.gmao.CAMGAZ_TECH.service.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import org.springframework.data.crossstore.ChangeSetPersister;

import java.sql.Date;
import java.util.List;
import java.util.Map;

public interface GestionSite {
    public Site createSite(Site site, List<Integer> equipementIdList, Date dateInstall, Map<Integer,Date> dateMap);

    public Site getSiteByID(int siteID) throws ChangeSetPersister.NotFoundException;

    public Site updateSite(int siteId, Site site, List<EquipementInstalle> nouveauxEquipementInstalle);

    public boolean deleteSite(int siteId);

    public List<Site> findAllSites() ;

}
