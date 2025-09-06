package com.gmao.CAMGAZ_TECH.repository.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteRepository extends JpaRepository<Site,Integer> {
}
