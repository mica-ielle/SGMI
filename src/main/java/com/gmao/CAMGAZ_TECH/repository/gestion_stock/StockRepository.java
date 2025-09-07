package com.gmao.CAMGAZ_TECH.repository.gestion_stock;

import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockRepository extends JpaRepository<Stock,Integer> {
}
