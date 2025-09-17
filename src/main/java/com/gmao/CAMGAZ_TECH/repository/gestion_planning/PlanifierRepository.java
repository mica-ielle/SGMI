package com.gmao.CAMGAZ_TECH.repository.gestion_planning;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.Planifier;
import com.gmao.CAMGAZ_TECH.model.gestion_planning.TachePlanifie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanifierRepository extends JpaRepository<Planifier,Integer> {

    List<Planifier> findByTachePlanifie(TachePlanifie tachePlanifie);

    @Query("SELECT p FROM Planifier p JOIN FETCH p.site s LEFT JOIN FETCH s.equipementInstalles ei LEFT JOIN FETCH ei.equipement WHERE p.tachePlanifie.id_tachePlanifie = :tachePlanifieId")
    List<Planifier> findByTachePlanifieIdWithSitesAndEquipements(@Param("tachePlanifieId") int tachePlanifieId);

}
