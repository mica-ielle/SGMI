package com.gmao.CAMGAZ_TECH.service.gestion_stock;

import com.gmao.CAMGAZ_TECH.DTO.SortieStock;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;
import com.gmao.CAMGAZ_TECH.repository.gestion_equipement.EquipementRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_stock.PieceRepository;
import com.gmao.CAMGAZ_TECH.repository.gestion_stock.StockRepository;
import com.gmao.CAMGAZ_TECH.service.gestion_site.GestionSiteImpl;
import org.antlr.v4.runtime.misc.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GestionStockImpl implements GestionStock{


    private final StockRepository stockRepository;
    private final PieceRepository pieceRepository;
    private final EquipementRepository equipementRepository;

    private Stock stock;

    final static Logger logger = LoggerFactory.getLogger(GestionSiteImpl.class);

    public GestionStockImpl(StockRepository stockRepository, PieceRepository pieceRepository, EquipementRepository equipementRepository) {
        this.stockRepository = stockRepository;
        this.pieceRepository = pieceRepository;
        this.equipementRepository = equipementRepository;
    }


    @Override
    public Stock createStock(Stock stock, int pieceID) {
        logger.info("Stock successfully created: "+stock.toString());

        //check if the piece exist
        boolean check=pieceRepository.existsById(pieceID);
        if(check) {
            stock.setPiece(pieceRepository.findById(pieceID).get());

            return stockRepository.save(stock);
        }else {
            throw new IllegalArgumentException("you chould join an existing piece");
        }

    }

    @Override
    public Stock getStockByID(int stockId) throws ChangeSetPersister.NotFoundException {
        //check if a stock with this id exist
        boolean check=stockRepository.existsById(stockId);
        if(check) {
            logger.info("All stock successfully loaded ");
            return stockRepository.findById(stockId).get();
        }
        else {
            logger.info("No stock was found ");
            throw new ChangeSetPersister.NotFoundException();
        }
    }

    @Override
    public Stock updateStock(int stockId, Stock stock) {

        Stock s = stockRepository.findById(stockId).get();

        s.setQuantite(stock.getQuantite());
        s.setSeuil_critique(stock.getSeuil_critique());

        logger.info("Stock successfully updated ");
        //save modifications
        return stockRepository.save(s);
    }


    @Override
    public boolean deleteStock(int stockId) {
        boolean check1=stockRepository.existsById(stockId);
        if(check1) {
            stockRepository.deleteById(stockId);

            logger.info("Stock was successfully deleted ");
            return true;
        }
        else {
            logger.info("Stock does not exist ");
            return false;
        }
    }

    @Override
    public List<Stock> findAllStocks() {
        return stockRepository.findAll();
    }

    @Override
    public Stock entreeStock(int stockId, int quantitePlus) {

        Stock s = stockRepository.findById(stockId).get();

        int quantiteAtu = s.getQuantite()+quantitePlus;
        s.setQuantite(quantiteAtu);

        logger.info("Stock successfully updated ");
        //save modifications
        return stockRepository.save(s);
    }

    @Override
    public SortieStock sortieStock(int stockId, int quantiteMoins) {

        Stock s = stockRepository.findById(stockId).get();

        int quantiteAtu = s.getQuantite()-quantiteMoins;
        s.setQuantite(quantiteAtu);

        logger.info("Stock successfully updated ");
        //save modifications
        return new SortieStock(stockRepository.save(s),checkSeuil(s.getSeuil_critique(),quantiteAtu));
    }
    private boolean checkSeuil(int seuil, int quantiteActu){
        if (seuil>quantiteActu){
            return true;
        }else {
            return false;
        }
    }

    @Override
    public Stock getByPiece(Piece piece){
        return stockRepository.findByPiece(piece);
    }

}
