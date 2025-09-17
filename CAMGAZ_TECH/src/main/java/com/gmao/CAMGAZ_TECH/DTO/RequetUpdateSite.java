package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;

import java.sql.Date;
import java.util.List;
import java.util.Map;

public class RequetUpdateSite {
    private Site site;
    private List<EquipementInstalle> nouveauEquipementInstalles;

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public List<EquipementInstalle> getNouveauEquipementInstalles() {
        return nouveauEquipementInstalles;
    }

    public void setNouveauEquipementInstalles(List<EquipementInstalle> nouveauEquipementInstalles) {
        this.nouveauEquipementInstalles = nouveauEquipementInstalles;
    }
}