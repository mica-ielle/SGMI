package com.gmao.CAMGAZ_TECH.service.gestion_stock;

import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Equipement;
import com.gmao.CAMGAZ_TECH.model.gestion_equipements.Tache;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;
import org.springframework.data.crossstore.ChangeSetPersister;

import java.util.List;

public interface GestionStock {

    public Stock createStock(Stock stock, int pieceID);

    public Stock getStockByID(int stockId) throws ChangeSetPersister.NotFoundException;

    public Stock updateStock(int stockId, Stock stock);

    public boolean deleteStock(int stockId);

    public List<Stock> findAllStocks() ;


    public Stock entreeStock(int stockId, int quantitePlus);
    public Stock sortieStock(int stockId, int quantiteMoins);


}
