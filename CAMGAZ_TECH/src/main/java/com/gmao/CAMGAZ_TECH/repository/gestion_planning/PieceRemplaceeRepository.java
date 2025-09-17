package com.gmao.CAMGAZ_TECH.repository.gestion_planning;

import com.gmao.CAMGAZ_TECH.model.gestion_planning.PieceRemplacee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PieceRemplaceeRepository extends JpaRepository<PieceRemplacee,Integer> {
}
