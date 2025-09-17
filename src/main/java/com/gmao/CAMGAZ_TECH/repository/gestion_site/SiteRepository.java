package com.gmao.CAMGAZ_TECH.repository.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site,Integer> {
    //public List<Site> findBytachePlanifies(TachePlanifie tachePlanifie);
    public Site findByequipementInstalles(EquipementInstalle equipementInstalle);
}
