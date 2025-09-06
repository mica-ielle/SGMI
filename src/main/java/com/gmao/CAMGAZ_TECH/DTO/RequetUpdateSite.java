package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;

import java.sql.Date;
import java.util.Map;

public class RequetUpdateSite {
    private Site site;
    private Map<Integer, Date> dateMap;

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public Map<Integer, Date> getDateMap() {
        return dateMap;
    }

    public void setDateMap(Map<Integer, Date> dateMap) {
        this.dateMap = dateMap;
    }
}