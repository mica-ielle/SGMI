package com.gmao.CAMGAZ_TECH.repository.gestion_planning;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.OccurenceMainteance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OccurenceMaintenanceRepository extends JpaRepository<OccurenceMainteance,Integer> {
}
