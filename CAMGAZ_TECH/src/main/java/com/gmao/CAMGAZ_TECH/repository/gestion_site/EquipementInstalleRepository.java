package com.gmao.CAMGAZ_TECH.repository.gestion_site;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_site.EquipementInstalle;
import com.gmao.CAMGAZ_TECH.model.gestion_site.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipementInstalleRepository extends JpaRepository<EquipementInstalle,Integer> {
    public List<EquipementInstalle> findByequipement(Equipement equipement);
}
