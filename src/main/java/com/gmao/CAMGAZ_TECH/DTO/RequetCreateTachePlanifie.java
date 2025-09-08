package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;

import java.util.List;

public class RequetCreateTachePlanifie {

    private TachePlanifie tachePlanifie;
    private int siteId;

    public RequetCreateTachePlanifie(TachePlanifie tachePlanifie, int siteId) {
        this.tachePlanifie = tachePlanifie;
        this.siteId = siteId;
    }

    public TachePlanifie getTachePlanifie() {
        return tachePlanifie;
    }

    public void setTachePlanifie(TachePlanifie tachePlanifie) {
        this.tachePlanifie = tachePlanifie;
    }

    public int getSiteId() {
        return siteId;
    }

    public void setSiteId(int siteId) {
        this.siteId = siteId;
    }
}
