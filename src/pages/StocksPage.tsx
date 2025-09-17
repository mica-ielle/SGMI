import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { stockService } from '../services/stockService';
import { equipementService } from '../services/equipementService';
import type { Stock, Equipement, RequetCreateStock, RequetCreatePiece, Piece } from '../types';

export const StocksPage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [piecesDisponibles, setPiecesDisponibles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMouvementDialogOpen, setIsMouvementDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour le mouvement de stock
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [typeMouvement, setTypeMouvement] = useState<'entree' | 'sortie'>('entree');
  const [quantiteMouvement, setQuantiteMouvement] = useState(0);

  // État du formulaire
  const [formData, setFormData] = useState<Stock>({
    quantite: 0,
    seuil_critique: 0,
    piece: {
      nom: '',
      reference: ''
    }
  });

  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [creationMode, setCreationMode] = useState<'existing' | 'new'>('existing');
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [stocksData, equipementsData] = await Promise.all([
        stockService.getAll(),
        equipementService.getAll()
      ]);
      
      setStocks(stocksData);
      setEquipements(equipementsData);
      
      // Extraire toutes les pièces disponibles depuis les équipements
      const toutes_pieces = equipementsData.flatMap(eq => eq.pieces || []);
      setPiecesDisponibles(toutes_pieces);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation selon le mode
    if (creationMode === 'existing' && !selectedPieceId) {
      alert('Veuillez sélectionner une pièce');
      return;
    }
    
    if (creationMode === 'new') {
      if (!formData.piece.nom.trim() || !formData.piece.reference.trim()) {
        alert('Veuillez remplir le nom et la référence de la pièce');
        return;
      }
    }
    
    try {
      if (editingStock) {
        await stockService.update(editingStock.id_stock!, formData);
      } else {
        if (creationMode === 'existing') {
          const createData: RequetCreateStock = {
            stock: formData,
            pieceID: selectedPieceId!
          };
          await stockService.create(createData);
        } else {
          // Création avec nouvelle pièce
          const createData: RequetCreatePiece = {
            stock: formData,
            piece: formData.piece
          };
          await stockService.createPiece(createData);
        }
      }
      
      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleMouvement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || quantiteMouvement <= 0) return;
    
    try {
      if (typeMouvement === 'entree') {
        await stockService.entreeStock(selectedStock.id_stock!, quantiteMouvement);
      } else {
        const result = await stockService.sortieStock(selectedStock.id_stock!, quantiteMouvement);
        if (result.alerte) {
          alert(`Attention: Le stock de ${selectedStock.piece.nom} est maintenant sous le seuil critique!`);
        }
      }
      
      await loadData();
      setIsMouvementDialogOpen(false);
      setQuantiteMouvement(0);
    } catch (error) {
      console.error('Erreur lors du mouvement:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stock ?')) {
      try {
        await stockService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openEditDialog = (stock: Stock) => {
    setEditingStock(stock);
    setFormData(stock);
    setSelectedPieceId(stock.piece.id_piece!);
    setIsDialogOpen(true);
  };

  const openMouvementDialog = (stock: Stock, type: 'entree' | 'sortie') => {
    setSelectedStock(stock);
    setTypeMouvement(type);
    setQuantiteMouvement(0);
    setIsMouvementDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      quantite: 0,
      seuil_critique: 0,
      piece: {
        nom: '',
        reference: ''
      }
    });
    setSelectedPieceId(null);
    setEditingStock(null);
    setCreationMode('existing');
  };

  const filteredStocks = stocks.filter(stock =>
    stock.piece.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.piece.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stocksEnAlerte = filteredStocks.filter(stock => stock.quantite <= stock.seuil_critique);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertes de stock critique */}
      {stocksEnAlerte.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{stocksEnAlerte.length} pièce(s)</strong> sous le seuil critique: {' '}
            {stocksEnAlerte.map(s => s.piece.nom).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher une pièce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau stock
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStock ? 'Modifier le stock' : 'Nouveau stock'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!editingStock && (
                <div className="space-y-3">
                  <Label>Mode de création</Label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCreationMode('existing')}
                      className={`flex-1 p-3 text-left border rounded-lg transition-colors ${
                        creationMode === 'existing' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">Pièce existante</div>
                      <div className="text-sm text-gray-600">Sélectionner depuis un équipement</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreationMode('new')}
                      className={`flex-1 p-3 text-left border rounded-lg transition-colors ${
                        creationMode === 'new' 
                          ? 'border-purple-500 bg-purple-50 text-purple-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">Nouvelle pièce</div>
                      <div className="text-sm text-gray-600">Créer une pièce indépendante</div>
                    </button>
                  </div>
                </div>
              )}
              
              {creationMode === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="piece">Pièce *</Label>
                  <Select 
                    value={selectedPieceId?.toString() || ''} 
                    onValueChange={(value) => setSelectedPieceId(Number(value))}
                    disabled={!!editingStock}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une pièce" />
                    </SelectTrigger>
                    <SelectContent>
                      {piecesDisponibles.map((piece) => (
                        <SelectItem key={piece.id_piece} value={piece.id_piece.toString()}>
                          {piece.nom} - {piece.reference}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom_piece">Nom de la pièce *</Label>
                    <Input
                      id="nom_piece"
                      value={formData.piece.nom}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        piece: { ...prev.piece, nom: e.target.value }
                      }))}
                      placeholder="Ex: Filtre à air, Joint d'étanchéité..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference_piece">Référence *</Label>
                    <Input
                      id="reference_piece"
                      value={formData.piece.reference}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        piece: { ...prev.piece, reference: e.target.value }
                      }))}
                      placeholder="Ex: FAR-2024-001"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantite">Quantité *</Label>
                  <Input
                    id="quantite"
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantite: Number(e.target.value) }))}
                    required
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seuil">Seuil critique *</Label>
                  <Input
                    id="seuil"
                    type="number"
                    value={formData.seuil_critique}
                    onChange={(e) => setFormData(prev => ({ ...prev, seuil_critique: Number(e.target.value) }))}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingStock ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog pour les mouvements de stock */}
      <Dialog open={isMouvementDialogOpen} onOpenChange={setIsMouvementDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {typeMouvement === 'entree' ? 'Entrée de stock' : 'Sortie de stock'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStock && (
            <form onSubmit={handleMouvement} className="space-y-4">
              <div className="space-y-2">
                <Label>Pièce</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{selectedStock.piece.nom}</div>
                  <div className="text-sm text-gray-600">Réf: {selectedStock.piece.reference}</div>
                  <div className="text-sm text-gray-600">Stock actuel: {selectedStock.quantite}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantiteMouvement">
                  Quantité à {typeMouvement === 'entree' ? 'ajouter' : 'retirer'} *
                </Label>
                <Input
                  id="quantiteMouvement"
                  type="number"
                  value={quantiteMouvement}
                  onChange={(e) => setQuantiteMouvement(Number(e.target.value))}
                  required
                  min="1"
                  max={typeMouvement === 'sortie' ? selectedStock.quantite : undefined}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsMouvementDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className={typeMouvement === 'entree' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
                >
                  {typeMouvement === 'entree' ? 'Ajouter' : 'Retirer'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Liste des stocks */}
      <div className="grid gap-6">
        {filteredStocks.map((stock) => {
          const isEnAlerte = stock.quantite <= stock.seuil_critique;
          
          return (
            <Card key={stock.id_stock} className={`hover:shadow-lg transition-shadow ${isEnAlerte ? 'border-orange-200 bg-orange-50' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="flex items-center">
                        <Package className="w-5 h-5 mr-2 text-purple-600" />
                        {stock.piece.nom}
                      </CardTitle>
                      {isEnAlerte && (
                        <Badge variant="destructive" className="flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Seuil critique
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600">Réf: {stock.piece.reference}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`font-medium ${isEnAlerte ? 'text-orange-700' : 'text-green-700'}`}>
                        Stock: {stock.quantite}
                      </span>
                      <span className="text-gray-600">
                        Seuil: {stock.seuil_critique}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMouvementDialog(stock, 'entree')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMouvementDialog(stock, 'sortie')}
                      className="text-orange-600 hover:text-orange-700"
                      disabled={stock.quantite === 0}
                    >
                      <TrendingDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(stock)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(stock.id_stock!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Barre de progression du stock */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Niveau de stock</span>
                    <span>{Math.round((stock.quantite / Math.max(stock.seuil_critique * 2, stock.quantite)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isEnAlerte ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (stock.quantite / Math.max(stock.seuil_critique * 2, stock.quantite)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredStocks.length === 0 && (
          <Card className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucun stock trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier stock.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};