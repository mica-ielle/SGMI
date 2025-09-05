package com.gmao.CAMGAZ_TECH.repository;

import com.gmao.CAMGAZ_TECH.model.Tache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TacheRepository extends JpaRepository<Tache,Integer> {
}
