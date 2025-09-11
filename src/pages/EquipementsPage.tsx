import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { equipementService } from '../services/equipementService';
import type { Equipement, TypeEquipement, Tache, Piece, TypeTache, Frequence, FrequenceStandard, UniteFrequence } from '../types';

const typeEquipementLabels: Record<TypeEquipement, string> = {
  MOTOPOMPE: 'Motopompe',
  BORNE_DE_DISTRIBUTION: 'Borne de distribution',
  ARMOIRE_ELECTRIQUE: 'Armoire électrique',
  CITERNE: 'Citerne'
};

const typeTacheLabels: Record<TypeTache, string> = {
  VISITE: 'Visite',
  ENTRETIEN: 'Entretien',
  PREVENTIF: 'Préventif'
};

const frequenceStandardLabels: Record<FrequenceStandard, string> = {
  MENSUELLE: 'Mensuelle',
  BIMENSUELLE: 'Bimensuelle',
  TRIMESTRIELLE: 'Trimestrielle',
  SEMESTRIELLE: 'Semestrielle',
  ANNUELLE: 'Annuelle',
  CINQ_ANS: '5 ans',
  DIX_ANS: '10 ans'
};

export const EquipementsPage = () => {
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipement, setEditingEquipement] = useState<Equipement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // État du formulaire
  const [formData, setFormData] = useState<Equipement>({
    type: 'MOTOPOMPE' as TypeEquipement,
    reference: '',
    nom: '',
    fournisseur: '',
    taches: [],
    pieces: []
  });

  useEffect(() => {
    loadEquipements();
  }, []);

  const loadEquipements = async () => {
    try {
      setIsLoading(true);
      const data = await equipementService.getAll();
      setEquipements(data);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipement) {
        // TODO: Implémentation de la mise à jour
        console.log('Mise à jour équipement:', formData);
      } else {
        await equipementService.create(formData);
      }
      
      await loadEquipements();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        await equipementService.delete(id);
        await loadEquipements();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openEditDialog = (equipement: Equipement) => {
    setEditingEquipement(equipement);
    setFormData(equipement);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'MOTOPOMPE' as TypeEquipement,
      reference: '',
      nom: '',
      fournisseur: '',
      taches: [],
      pieces: []
    });
    setEditingEquipement(null);
  };

  const addTache = () => {
    const nouvelleTache: Tache = {
      nom: '',
      type: 'VISITE' as TypeTache,
      frequence: {
        frequenceStandard: 'MENSUELLE' as FrequenceStandard
      }
    };
    setFormData(prev => ({
      ...prev,
      taches: [...(prev.taches || []), nouvelleTache]
    }));
  };

  const addPiece = () => {
    const nouvellePiece: Piece = {
      nom: '',
      reference: ''
    };
    setFormData(prev => ({
      ...prev,
      pieces: [...(prev.pieces || []), nouvellePiece]
    }));
  };

  const filteredEquipements = equipements.filter(eq =>
    eq.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des équipements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un équipement..."
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
              Nouvel équipement
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEquipement ? 'Modifier l\'équipement' : 'Nouvel équipement'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'équipement *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TypeEquipement }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeEquipementLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Référence *</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fournisseur">Fournisseur</Label>
                  <Input
                    id="fournisseur"
                    value={formData.fournisseur || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
                  />
                </div>
              </div>

              {/* Section Tâches */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Tâches de maintenance</h3>
                  <Button type="button" onClick={addTache} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une tâche
                  </Button>
                </div>
                
                {formData.taches?.map((tache, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nom de la tâche</Label>
                        <Input
                          value={tache.nom || ''}
                          onChange={(e) => {
                            const newTaches = [...(formData.taches || [])];
                            newTaches[index] = { ...tache, nom: e.target.value };
                            setFormData(prev => ({ ...prev, taches: newTaches }));
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Type de tâche</Label>
                        <Select 
                          value={tache.type} 
                          onValueChange={(value) => {
                            const newTaches = [...(formData.taches || [])];
                            newTaches[index] = { ...tache, type: value as TypeTache };
                            setFormData(prev => ({ ...prev, taches: newTaches }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(typeTacheLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Fréquence</Label>
                        <Select 
                          value={tache.frequence?.frequenceStandard || ''} 
                          onValueChange={(value) => {
                            const newTaches = [...(formData.taches || [])];
                            newTaches[index] = { 
                              ...tache, 
                              frequence: { 
                                ...tache.frequence, 
                                frequenceStandard: value as FrequenceStandard 
                              } 
                            };
                            setFormData(prev => ({ ...prev, taches: newTaches }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(frequenceStandardLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Section Pièces */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Pièces recommandées</h3>
                  <Button type="button" onClick={addPiece} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une pièce
                  </Button>
                </div>
                
                {formData.pieces?.map((piece, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Référence</Label>
                        <Input
                          value={piece.reference || ''}
                          onChange={(e) => {
                            const newPieces = [...(formData.pieces || [])];
                            newPieces[index] = { ...piece, reference: e.target.value };
                            setFormData(prev => ({ ...prev, pieces: newPieces }));
                          }}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Désignation</Label>
                        <Input
                          value={piece.nom || ''}
                          onChange={(e) => {
                            const newPieces = [...(formData.pieces || [])];
                            newPieces[index] = { ...piece, nom: e.target.value };
                            setFormData(prev => ({ ...prev, pieces: newPieces }));
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingEquipement ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des équipements */}
      <div className="grid gap-6">
        {filteredEquipements.map((equipement) => (
          <Card key={equipement.id_equipement} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <CardTitle>{equipement.nom}</CardTitle>
                    <Badge variant="secondary">
                      {typeEquipementLabels[equipement.type]}
                    </Badge>
                  </div>
                  <p className="text-gray-600">Réf: {equipement.reference}</p>
                  {equipement.fournisseur && (
                    <p className="text-sm text-gray-500">Fournisseur: {equipement.fournisseur}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(equipement)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(equipement.id_equipement!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Tâches */}
              {equipement.taches && equipement.taches.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Tâches de maintenance ({equipement.taches.length})
                  </h4>
                  <div className="space-y-2">
                    {equipement.taches.map((tache, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <span className="font-medium">{tache.nom}</span>
                          <Badge variant="outline" className="ml-2">
                            {typeTacheLabels[tache.type]}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-600">
                          {tache.frequence?.frequenceStandard && 
                            frequenceStandardLabels[tache.frequence.frequenceStandard]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pièces */}
              {equipement.pieces && equipement.pieces.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">
                    Pièces recommandées ({equipement.pieces.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {equipement.pieces.map((piece, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-medium">{piece.nom}</div>
                        <div className="text-gray-600">Réf: {piece.reference}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredEquipements.length === 0 && (
          <Card className="p-12 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucun équipement trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier équipement.'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};