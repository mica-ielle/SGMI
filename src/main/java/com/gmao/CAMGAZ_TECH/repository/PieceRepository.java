package com.gmao.CAMGAZ_TECH.repository;

import com.gmao.CAMGAZ_TECH.model.Piece;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PieceRepository extends JpaRepository<Piece,Integer> {
}
