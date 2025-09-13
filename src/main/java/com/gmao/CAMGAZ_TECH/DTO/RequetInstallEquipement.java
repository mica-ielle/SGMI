package com.gmao.CAMGAZ_TECH.DTO;

import java.sql.Date;
import java.util.List;

public class RequetInstallEquipement {

    private int siteId;
    private List<Integer> equipementsId;
    private List<Date> datesInstall;

    public int getSiteId() {
        return siteId;
    }

    public void setSiteId(int siteId) {
        this.siteId = siteId;
    }

    public List<Integer> getEquipementsId() {
        return equipementsId;
    }

    public void setEquipementsId(List<Integer> equipementsId) {
        this.equipementsId = equipementsId;
    }

    public List<Date> getDatesInstall() {
        return datesInstall;
    }

    public void setDatesInstall(List<Date> datesInstall) {
        this.datesInstall = datesInstall;
    }
}
