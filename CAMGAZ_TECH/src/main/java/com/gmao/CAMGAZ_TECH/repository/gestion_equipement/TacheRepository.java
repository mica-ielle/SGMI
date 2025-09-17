package com.gmao.CAMGAZ_TECH.repository.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TacheRepository extends JpaRepository<Tache,Integer> {
}
