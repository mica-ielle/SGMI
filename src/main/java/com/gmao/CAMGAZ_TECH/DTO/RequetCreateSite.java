package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;

import java.sql.Date;
import java.util.List;
import java.util.Map;

public class RequetCreateSite {
    private Site site;
    private List<Integer> equipementIdList;

    private Date dateInstall;
    private Map<Integer, Date> dateMap;

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public List<Integer> getEquipementIdList() {
        return equipementIdList;
    }

    public void setEquipementIdList(List<Integer> equipementIdList) {
        this.equipementIdList = equipementIdList;
    }

    public Date getDateInstall() {
        return dateInstall;
    }

    public void setDateInstall(Date dateInstall) {
        this.dateInstall = dateInstall;
    }

    public Map<Integer, Date> getDateMap() {
        return dateMap;
    }

    public void setDateMap(Map<Integer, Date> dateMap) {
        this.dateMap = dateMap;
    }
}