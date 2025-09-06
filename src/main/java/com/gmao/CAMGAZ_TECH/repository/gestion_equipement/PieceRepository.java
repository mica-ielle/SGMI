package com.gmao.CAMGAZ_TECH.repository.gestion_equipement;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Piece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PieceRepository extends JpaRepository<Piece,Integer> {
}
