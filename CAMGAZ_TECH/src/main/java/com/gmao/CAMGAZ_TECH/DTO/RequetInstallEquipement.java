package com.gmao.CAMGAZ_TECH.DTO;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

public class RequetInstallEquipement {

    private int siteId;
    private List<Integer> equipementsId;
    private List<LocalDate> datesInstall;

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

    public List<LocalDate> getDatesInstall() {
        return datesInstall;
    }

    public void setDatesInstall(List<LocalDate> datesInstall) {
        this.datesInstall = datesInstall;
    }
}
