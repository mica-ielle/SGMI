package com.gmao.CAMGAZ_TECH.repository;

import com.gmao.CAMGAZ_TECH.model.Equipement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipementRepository extends JpaRepository<Equipement,Integer> {

    //method to check if an equipment with a specific reference exist
    boolean existsByReference(String reference);
}
