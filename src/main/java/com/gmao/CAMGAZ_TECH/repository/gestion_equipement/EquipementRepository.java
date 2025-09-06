package com.gmao.CAMGAZ_TECH.repository.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipementRepository extends JpaRepository<Equipement,Integer> {

    //method to read equipments by type
    List<Equipement> findByType(String type);
}
