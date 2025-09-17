package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.Planifier;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;

import java.util.List;

public class RequetCreateTachePlanifie {

    private TachePlanifie tachePlanifie;
    private List<Planifier> planifiers;

    public RequetCreateTachePlanifie(TachePlanifie tachePlanifie, List<Planifier> planifiers) {
        this.tachePlanifie = tachePlanifie;
        this.planifiers = planifiers;
    }

    public TachePlanifie getTachePlanifie() {
        return tachePlanifie;
    }

    public void setTachePlanifie(TachePlanifie tachePlanifie) {
        this.tachePlanifie = tachePlanifie;
    }

    public List<Planifier> getPlanifiers() {
        return planifiers;
    }

    public void setPlanifiers(List<Planifier> planifiers) {
        this.planifiers = planifiers;
    }
}
