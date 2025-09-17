package com.gmao.CAMGAZ_TECH.DTO;

import com.gmao.CAMGAZ_TECH.model.gestion_stock.Piece;
import com.gmao.CAMGAZ_TECH.model.gestion_stock.Stock;

public class RequetCreatePiece {
    private Piece piece;
    private Stock stock;

    public RequetCreatePiece(Piece piece, Stock stock) {
        this.piece = piece;
        this.stock = stock;
    }

    public Piece getPiece() {
        return piece;
    }

    public void setPiece(Piece piece) {
        this.piece = piece;
    }

    public Stock getStock() {
        return stock;
    }

    public void setStock(Stock stock) {
        this.stock = stock;
    }
}
