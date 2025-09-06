package com.gmao.CAMGAZ_TECH.repository.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipementInstalleRepository extends JpaRepository<EquipementInstalle,Integer> {
}
