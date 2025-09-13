import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings, Eye, Package, Wrench, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { DetailCard } from '../components/ui/detail-card';
import { InfoGrid, InfoItem } from '../components/ui/info-grid';
import { EquipementDetailView } from '../components/equipements/EquipementDetailView';
import { EnhancedForm, FormSection } from '../components/ui/enhanced-form';
import { FrequenceSelector } from '../components/forms/FrequenceSelector';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { equipementService } from '../services/equipementService';
import { toast } from 'sonner@2.0.3';
import type { 
  Equipement, 
  TypeEquipement, 
  Tache, 
  Piece, 
  TypeTache, 
  Frequence
} from '../types';

const typeEquipementData = {
  MOTOPOMPE: { label: 'Motopompe', icon: '⚙️', color: 'blue' },
  BORNE_DE_DISTRIBUTION: { label: 'Borne de distribution', icon: '⛽', color: 'green' },
  ARMOIRE_ELECTRIQUE: { label: 'Armoire électrique', icon: '🔌', color: 'yellow' },
  CITERNE: { label: 'Citerne', icon: '🛢️', color: 'purple' }
};

const typeTacheLabels: Record<TypeTache, string> = {
  VISITE: 'Visite',
  ENTRETIEN: 'Entretien',
  PREVENTIF: 'Préventif'
};

export const EquipementsPage = () => {
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [editingEquipement, setEditingEquipement] = useState<Equipement | null>(null);
  const [selectedEquipement, setSelectedEquipement] = useState<Equipement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TypeEquipement | 'all'>('all');

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
      const data = await equipementService.getAllEquipements();
      setEquipements(data);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
      toast.error('Erreur lors du chargement des équipements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipement) {
        await equipementService.updateEquipement(editingEquipement.id_equipement!, {
          equipementId: editingEquipement.id_equipement!,
          tacheList: formData.taches || [],
          pieceList: formData.pieces || []
        });
        toast.success('Équipement mis à jour avec succès');
      } else {
        await equipementService.createEquipement(formData);
        toast.success('Équipement créé avec succès');
      }
      
      await loadEquipements();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet équipement ?')) {
      try {
        await equipementService.deleteEquipement(id);
        await loadEquipements();
        toast.success('Équipement supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openEditDialog = (equipement: Equipement) => {
    setEditingEquipement(equipement);
    setFormData(equipement);
    setIsDialogOpen(true);
  };

  const openDetailView = (equipement: Equipement) => {
    setSelectedEquipement(equipement);
    setIsDetailOpen(true);
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
      frequence: {}
    };
    setFormData(prev => ({
      ...prev,
      taches: [...(prev.taches || []), nouvelleTache]
    }));
  };

  const updateTache = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newTaches = [...(prev.taches || [])];
      newTaches[index] = { ...newTaches[index], [field]: value };
      return { ...prev, taches: newTaches };
    });
  };

  const removeTache = (index: number) => {
    setFormData(prev => ({
      ...prev,
      taches: prev.taches?.filter((_, i) => i !== index) || []
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

  const updatePiece = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newPieces = [...(prev.pieces || [])];
      newPieces[index] = { ...newPieces[index], [field]: value };
      return { ...prev, pieces: newPieces };
    });
  };

  const removePiece = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pieces: prev.pieces?.filter((_, i) => i !== index) || []
    }));
  };

  const getFrequenceLabel = (tache: Tache) => {
    if (tache.frequence.frequenceStandard) {
      return tache.frequence.frequenceStandard.toLowerCase().replace('_', ' ');
    }
    if (tache.frequence.valeurPersonnalisee) {
      return `Tous les ${tache.frequence.valeurPersonnalisee} ${tache.frequence.unitePersonnalisee?.toLowerCase()}`;
    }
    return 'Non définie';
  };

  const getTaskTypeColor = (type: TypeTache) => {
    switch (type) {
      case 'VISITE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ENTRETIEN': return 'bg-green-100 text-green-700 border-green-200';
      case 'PREVENTIF': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredEquipements = equipements.filter(eq => {
    const matchesSearch = eq.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || eq.type === filterType;
    return matchesSearch && matchesType;
  });

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
      {/* En-tête avec filtres et actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <Input
            placeholder="Rechercher un équipement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white max-w-md"
          />
          
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as TypeEquipement | 'all')}
          >
            <SelectTrigger className="w-auto min-w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {Object.entries(typeEquipementData).map(([key, data]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{data.icon}</span>
                    {data.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                {editingEquipement ? 'Modifier l\'équipement' : 'Nouvel équipement'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto p-6 pt-0" style={{ maxHeight: 'calc(90vh - 120px)' }}>
              <EnhancedForm
                title=""
                actions={
                  <>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {editingEquipement ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </>
                }
              >
                <FormSection 
                  title="Informations générales" 
                  description="Détails de base de l'équipement"
                  icon={<Settings className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type d'équipement *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TypeEquipement }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeEquipementData).map(([key, data]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <span>{data.icon}</span>
                                {data.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="reference">Référence *</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="nom">Nom *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="fournisseur">Fournisseur</Label>
                      <Input
                        id="fournisseur"
                        value={formData.fournisseur || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
                      />
                    </div>
                  </div>
                </FormSection>

                <FormSection 
                  title="Tâches de maintenance" 
                  description="Définir les tâches périodiques pour cet équipement"
                  icon={<Wrench className="w-4 h-4" />}
                >
                  <div className="space-y-4">
                    {formData.taches?.map((tache, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Tâche #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTache(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nom de la tâche *</Label>
                            <Input
                              value={tache.nom || ''}
                              onChange={(e) => updateTache(index, 'nom', e.target.value)}
                              placeholder="Ex: Vérification des filtres"
                            />
                          </div>
                          
                          <div>
                            <Label>Type de tâche *</Label>
                            <Select 
                              value={tache.type} 
                              onValueChange={(value) => updateTache(index, 'type', value as TypeTache)}
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
                        </div>
                        
                        <FrequenceSelector
                          value={tache.frequence}
                          onChange={(frequence) => updateTache(index, 'frequence', frequence)}
                        />
                      </div>
                    ))}
                    
                    <Button type="button" onClick={addTache} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une tâche
                    </Button>
                  </div>
                </FormSection>

                <FormSection 
                  title="Pièces recommandées" 
                  description="Pièces à maintenir en stock pour cet équipement"
                  icon={<Package className="w-4 h-4" />}
                >
                  <div className="space-y-4">
                    {formData.pieces?.map((piece, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Pièce #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePiece(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Référence *</Label>
                            <Input
                              value={piece.reference || ''}
                              onChange={(e) => updatePiece(index, 'reference', e.target.value)}
                              placeholder="Ex: FLT-001"
                            />
                          </div>
                          
                          <div>
                            <Label>Désignation *</Label>
                            <Input
                              value={piece.nom || ''}
                              onChange={(e) => updatePiece(index, 'nom', e.target.value)}
                              placeholder="Ex: Filtre à huile"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button type="button" onClick={addPiece} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une pièce
                    </Button>
                  </div>
                </FormSection>
              </EnhancedForm>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DetailCard
          title={equipements.length.toString()}
          subtitle="Total équipements"
          badge={{ label: "Actifs", variant: "outline" }}
          gradient
        >
          <div className="flex items-center justify-center pt-2">
            <Settings className="w-8 h-8 text-purple-600" />
          </div>
        </DetailCard>
        
        {Object.entries(typeEquipementData).map(([type, data]) => {
          const count = equipements.filter(eq => eq.type === type).length;
          return (
            <DetailCard
              key={type}
              title={count.toString()}
              subtitle={data.label}
              badge={{ label: data.icon, variant: "outline" }}
            >
              <div className="text-sm text-muted-foreground">
                {((count / equipements.length) * 100).toFixed(0)}% du total
              </div>
            </DetailCard>
          );
        })}
      </div>

      {/* Liste des équipements */}
      <div className="grid gap-6">
        {filteredEquipements.map((equipement) => (
          <DetailCard
            key={equipement.id_equipement}
            title={equipement.nom}
            subtitle={`${typeEquipementData[equipement.type].label} • Réf: ${equipement.reference}`}
            badge={{
              label: typeEquipementData[equipement.type].icon + ' ' + typeEquipementData[equipement.type].label,
              variant: "outline",
              color: typeEquipementData[equipement.type].color
            }}
            actions={{
              view: () => openDetailView(equipement),
              edit: () => openEditDialog(equipement),
              delete: () => handleDelete(equipement.id_equipement!)
            }}
            className="hover:shadow-lg transition-all duration-300"
          >
            <div className="space-y-4">
              <InfoGrid columns={3}>
                <InfoItem
                  label="Fournisseur"
                  value={equipement.fournisseur || 'Non renseigné'}
                  icon={<Package className="w-4 h-4" />}
                />
                <InfoItem
                  label="Tâches définies"
                  value={`${equipement.taches?.length || 0} tâche(s)`}
                  icon={<Wrench className="w-4 h-4" />}
                />
                <InfoItem
                  label="Pièces recommandées"
                  value={`${equipement.pieces?.length || 0} pièce(s)`}
                  icon={<Package className="w-4 h-4" />}
                />
              </InfoGrid>

              {/* Tâches preview */}
              {equipement.taches && equipement.taches.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <Wrench className="w-4 h-4 mr-2" />
                    Tâches de maintenance
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {equipement.taches.slice(0, 3).map((tache, index) => (
                      <Badge key={index} className={getTaskTypeColor(tache.type)}>
                        {tache.nom} ({getFrequenceLabel(tache)})
                      </Badge>
                    ))}
                    {equipement.taches.length > 3 && (
                      <Badge variant="outline">
                        +{equipement.taches.length - 3} autres
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              {/*<div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // TODO: Navigate to planning
                    toast.info('Consultez la section Planning pour gérer les maintenances');
                  }}
                  className="flex-shrink-0"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Planifier maintenance
                </Button>
              </div>*/}
            </div>
          </DetailCard>
        ))}
        
        {filteredEquipements.length === 0 && (
          <DetailCard
            title="Aucun équipement trouvé"
            subtitle={searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier équipement.'}
          >
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Button 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier équipement
              </Button>
            </div>
          </DetailCard>
        )}
      </div>

      {/* Detail View */}
      <EquipementDetailView
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        equipement={selectedEquipement}
        onEdit={() => {
          if (selectedEquipement) {
            setIsDetailOpen(false);
            openEditDialog(selectedEquipement);
          }
        }}
        onGenerateReport={() => {
          toast.info('Génération du rapport en cours...');
        }}
      />


    </div>
  );
};