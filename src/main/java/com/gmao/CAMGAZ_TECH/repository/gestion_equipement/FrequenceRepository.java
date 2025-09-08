package com.gmao.CAMGAZ_TECH.repository.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Frequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FrequenceRepository extends JpaRepository<Frequence,Integer> {
}
