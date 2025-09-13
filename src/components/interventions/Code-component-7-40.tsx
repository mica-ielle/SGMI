import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { EnhancedForm, FormSection } from '../ui/enhanced-form';
import { 
  CalendarIcon, 
  FileText, 
  User, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Euro,
  Plus,
  X,
  Paperclip,
  Save,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';
import type { FicheIntervention, TypeIntervention, Resultat, Equipement, Piece } from '../../types';

interface FicheInterventionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipement?: Equipement;
  onSuccess: () => void;
  initialData?: FicheIntervention;
}

interface PieceRemplaceeForm {
  piece?: Piece;
  reference: string;
  nom: string;
  quantiteUtilisee: number;
  prixUnitaire?: number;
}

export const FicheInterventionForm = ({ 
  open, 
  onOpenChange, 
  equipement, 
  onSuccess,
  initialData 
}: FicheInterventionFormProps) => {
  const [formData, setFormData] = useState<FicheIntervention>({
    type: 'MAINTENANCE_PLANIFIEE',
    dateHeureIntervention: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    descriptionIntervention: '',
    coutTotal: 0,
    piecesRemplacees: [],
    nomsIntervenants: [''],
    piecesJointes: []
  });

  const [piecesForm, setPiecesForm] = useState<PieceRemplaceeForm[]>([]);
  const [intervenantsForm, setIntervenantsForm] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
        setIntervenantsForm(initialData.nomsIntervenants || ['']);
        setPiecesForm(
          initialData.piecesRemplacees?.map(p => ({
            piece: p.piece,
            reference: p.reference,
            nom: p.nom,
            quantiteUtilisee: p.quantiteUtilisee,
            prixUnitaire: p.prixUnitaire
          })) || []
        );
      } else {
        // Reset form for new intervention
        setFormData({
          type: 'MAINTENANCE_PLANIFIEE',
          dateHeureIntervention: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
          descriptionIntervention: '',
          coutTotal: 0,
          piecesRemplacees: [],
          nomsIntervenants: [''],
          piecesJointes: []
        });
        setIntervenantsForm(['']);
        setPiecesForm([]);
      }
    }
  }, [open, initialData]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPiece = () => {
    setPiecesForm(prev => [...prev, {
      reference: '',
      nom: '',
      quantiteUtilisee: 1,
      prixUnitaire: 0
    }]);
  };

  const removePiece = (index: number) => {
    setPiecesForm(prev => prev.filter((_, i) => i !== index));
  };

  const updatePiece = (index: number, field: string, value: any) => {
    setPiecesForm(prev => prev.map((piece, i) => 
      i === index ? { ...piece, [field]: value } : piece
    ));
  };

  const addIntervenant = () => {
    setIntervenantsForm(prev => [...prev, '']);
  };

  const removeIntervenant = (index: number) => {
    if (intervenantsForm.length > 1) {
      setIntervenantsForm(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateIntervenant = (index: number, value: string) => {
    setIntervenantsForm(prev => prev.map((intervenant, i) => 
      i === index ? value : intervenant
    ));
  };

  const calculateTotal = () => {
    return piecesForm.reduce((total, piece) => 
      total + (piece.quantiteUtilisee * (piece.prixUnitaire || 0)), 0
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      // Simulate file upload - replace with real implementation
      const uploadedFiles = Array.from(files).map(file => file.name);
      setFormData(prev => ({
        ...prev,
        piecesJointes: [...(prev.piecesJointes || []), ...uploadedFiles]
      }));
      toast.success(`${files.length} fichier(s) ajouté(s)`);
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const finalData: FicheIntervention = {
        ...formData,
        coutTotal: calculateTotal(),
        nomsIntervenants: intervenantsForm.filter(name => name.trim()),
        piecesRemplacees: piecesForm.filter(piece => piece.nom.trim()),
        equipement
      };

      // TODO: Replace with real API call
      console.log('Submitting fiche intervention:', finalData);
      
      toast.success('Fiche d\'intervention créée avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la création de la fiche');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Generate and download PDF
    toast.info('Génération du PDF en cours...');
  };

  const getTypeIcon = (type: TypeIntervention) => {
    return type === 'MAINTENANCE_PLANIFIEE' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />;
  };

  const getResultatColor = (resultat: Resultat) => {
    switch (resultat) {
      case 'OK': return 'bg-green-100 text-green-700 border-green-200';
      case 'REPARÉ': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'SUIVI_NÉCESSAIRE': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {initialData ? 'Modifier la fiche d\'intervention' : 'Nouvelle fiche d\'intervention'}
          </DialogTitle>
          {equipement && (
            <p className="text-muted-foreground">
              Équipement: <span className="font-medium">{equipement.nom}</span> ({equipement.reference})
            </p>
          )}
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 p-6 max-h-[75vh]">
          <div className="space-y-6">
            {/* Informations générales */}
            <FormSection 
              title="Informations générales" 
              description="Détails de base de l'intervention"
              icon={<FileText className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Type d'intervention *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleFieldChange('type', value as TypeIntervention)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAINTENANCE_PLANIFIEE">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Maintenance planifiée
                        </div>
                      </SelectItem>
                      <SelectItem value="DEFAILLANCE">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Défaillance
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date et heure *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.dateHeureIntervention}
                    onChange={(e) => handleFieldChange('dateHeureIntervention', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Résultat</Label>
                  <Select
                    value={formData.resultat}
                    onValueChange={(value) => handleFieldChange('resultat', value as Resultat)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">✅ OK</SelectItem>
                      <SelectItem value="REPARÉ">🔧 Réparé</SelectItem>
                      <SelectItem value="SUIVI_NÉCESSAIRE">⚠️ Suivi nécessaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            {/* Description de l'intervention */}
            <FormSection 
              title="Description de l'intervention" 
              description="Détails des travaux effectués"
              icon={<FileText className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <div>
                  <Label>Description générale *</Label>
                  <Textarea
                    placeholder="Décrivez l'intervention réalisée..."
                    value={formData.descriptionIntervention}
                    onChange={(e) => handleFieldChange('descriptionIntervention', e.target.value)}
                    rows={3}
                  />
                </div>

                {formData.type === 'DEFAILLANCE' && (
                  <>
                    <div>
                      <Label>Problème rencontré</Label>
                      <Textarea
                        placeholder="Décrivez le problème ou la panne..."
                        value={formData.problemeRencontre || ''}
                        onChange={(e) => handleFieldChange('problemeRencontre', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Cause identifiée</Label>
                      <Textarea
                        placeholder="Cause du problème..."
                        value={formData.cause || ''}
                        onChange={(e) => handleFieldChange('cause', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>Travaux effectués</Label>
                  <Textarea
                    placeholder="Détaillez les travaux réalisés..."
                    value={formData.travauxEffectues || ''}
                    onChange={(e) => handleFieldChange('travauxEffectues', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Commentaires additionnels</Label>
                  <Textarea
                    placeholder="Remarques, observations, recommandations..."
                    value={formData.commentairesAdditionnels || ''}
                    onChange={(e) => handleFieldChange('commentairesAdditionnels', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </FormSection>

            {/* Intervenants */}
            <FormSection 
              title="Intervenants" 
              description="Personnes ayant participé à l'intervention"
              icon={<User className="w-4 h-4" />}
            >
              <div className="space-y-3">
                {intervenantsForm.map((intervenant, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Nom de l'intervenant"
                      value={intervenant}
                      onChange={(e) => updateIntervenant(index, e.target.value)}
                      className="flex-1"
                    />
                    {intervenantsForm.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIntervenant(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" onClick={addIntervenant} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un intervenant
                </Button>
              </div>
            </FormSection>

            {/* Pièces remplacées */}
            <FormSection 
              title="Pièces remplacées" 
              description="Liste des pièces utilisées pendant l'intervention"
              icon={<Package className="w-4 h-4" />}
            >
              <div className="space-y-4">
                {piecesForm.map((piece, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Pièce #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePiece(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-sm">Référence *</Label>
                        <Input
                          placeholder="REF-001"
                          value={piece.reference}
                          onChange={(e) => updatePiece(index, 'reference', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Nom *</Label>
                        <Input
                          placeholder="Nom de la pièce"
                          value={piece.nom}
                          onChange={(e) => updatePiece(index, 'nom', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Quantité *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={piece.quantiteUtilisee}
                          onChange={(e) => updatePiece(index, 'quantiteUtilisee', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Prix unitaire (€)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={piece.prixUnitaire || ''}
                          onChange={(e) => updatePiece(index, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" onClick={addPiece} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une pièce
                </Button>

                {piecesForm.length > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Coût total des pièces:</span>
                      <Badge className="bg-purple-100 text-purple-700">
                        <Euro className="w-3 h-3 mr-1" />
                        {calculateTotal().toFixed(2)} €
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </FormSection>

            {/* Pièces jointes */}
            <FormSection 
              title="Pièces jointes" 
              description="Photos, documents, rapports liés à l'intervention"
              icon={<Paperclip className="w-4 h-4" />}
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Cliquez pour ajouter des fichiers</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, PDF jusqu'à 10MB</p>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {formData.piecesJointes && formData.piecesJointes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Fichiers ajoutés:</Label>
                    {formData.piecesJointes.map((fichier, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm">{fichier}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFiles = formData.piecesJointes!.filter((_, i) => i !== index);
                            handleFieldChange('piecesJointes', newFiles);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormSection>
          </div>
        </ScrollArea>

        <Separator />

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              * Champs obligatoires
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              {initialData && (
                <Button 
                  variant="outline" 
                  onClick={handleDownloadPDF}
                  disabled={loading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </Button>
              )}
              <Button 
                onClick={handleSubmit}
                disabled={loading || !formData.descriptionIntervention.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {initialData ? 'Mettre à jour' : 'Créer la fiche'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};