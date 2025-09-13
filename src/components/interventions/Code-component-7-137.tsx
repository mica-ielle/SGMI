import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { EnhancedForm, FormSection } from '../ui/enhanced-form';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Package, 
  Euro,
  Plus,
  X,
  Paperclip,
  Save,
  Download,
  Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';
import type { FicheIntervention, Resultat, Equipement, Piece, PieceRemplacee } from '../../types';

interface DefaillanceFormProps {
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

export const DefaillanceForm = ({ 
  open, 
  onOpenChange, 
  equipement, 
  onSuccess,
  initialData 
}: DefaillanceFormProps) => {
  const [formData, setFormData] = useState<FicheIntervention>({
    type: 'DEFAILLANCE',
    dateHeureIntervention: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
    descriptionIntervention: '',
    problemeRencontre: '',
    cause: '',
    travauxEffectues: '',
    coutTotal: 0,
    piecesRemplacees: [],
    nomsIntervenants: [''],
    commentairesAdditionnels: '',
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
        // Reset form for new defaillance
        setFormData({
          type: 'DEFAILLANCE',
          dateHeureIntervention: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
          descriptionIntervention: '',
          problemeRencontre: '',
          cause: '',
          travauxEffectues: '',
          coutTotal: 0,
          piecesRemplacees: [],
          nomsIntervenants: [''],
          commentairesAdditionnels: '',
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

      // Validation spécifique aux défaillances
      if (!formData.problemeRencontre?.trim()) {
        toast.error('Le problème rencontré est obligatoire');
        return;
      }

      if (!formData.cause?.trim()) {
        toast.error('La cause est obligatoire');
        return;
      }

      const finalData: FicheIntervention = {
        ...formData,
        coutTotal: calculateTotal(),
        nomsIntervenants: intervenantsForm.filter(name => name.trim()),
        piecesRemplacees: piecesForm.filter(piece => piece.nom.trim()),
        equipement
      };

      // TODO: Replace with real API call
      console.log('Submitting defaillance:', finalData);
      
      toast.success('Défaillance enregistrée avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la défaillance');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Generate and download PDF
    toast.info('Génération du PDF en cours...');
  };

  const getSeverityColor = (cause: string) => {
    const criticalWords = ['panne', 'rupture', 'explosion', 'fuite', 'arrêt'];
    const warningWords = ['usure', 'dysfonctionnement', 'bruit', 'vibration'];
    
    const lowerCause = cause.toLowerCase();
    if (criticalWords.some(word => lowerCause.includes(word))) {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    if (warningWords.some(word => lowerCause.includes(word))) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    }
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {initialData ? 'Modifier la déclaration de défaillance' : 'Nouvelle déclaration de défaillance'}
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
            {/* Alert severity */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Déclaration de défaillance</h4>
                  <p className="text-sm text-red-600">
                    Renseignez avec précision le problème rencontré et ses causes pour un traitement optimal.
                  </p>
                </div>
              </div>
            </div>

            {/* Informations de base */}
            <FormSection 
              title="Informations générales" 
              description="Détails de base de la défaillance"
              icon={<Clock className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Date et heure de la défaillance *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.dateHeureIntervention}
                    onChange={(e) => handleFieldChange('dateHeureIntervention', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Résultat de l'intervention</Label>
                  <Select
                    value={formData.resultat}
                    onValueChange={(value) => handleFieldChange('resultat', value as Resultat)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">✅ Réparé - OK</SelectItem>
                      <SelectItem value="REPARÉ">🔧 Réparé temporairement</SelectItem>
                      <SelectItem value="SUIVI_NÉCESSAIRE">⚠️ Suivi nécessaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </FormSection>

            {/* Description de la défaillance */}
            <FormSection 
              title="Description de la défaillance" 
              description="Détails précis du problème rencontré"
              icon={<AlertTriangle className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <div>
                  <Label>Problème rencontré *</Label>
                  <Textarea
                    placeholder="Décrivez précisément le problème ou la panne observée..."
                    value={formData.problemeRencontre || ''}
                    onChange={(e) => handleFieldChange('problemeRencontre', e.target.value)}
                    rows={3}
                    className="border-red-200 focus:border-red-400"
                  />
                </div>

                <div>
                  <Label>Cause identifiée ou suspectée *</Label>
                  <Textarea
                    placeholder="Quelle est la cause probable de cette défaillance ?"
                    value={formData.cause || ''}
                    onChange={(e) => handleFieldChange('cause', e.target.value)}
                    rows={3}
                    className="border-red-200 focus:border-red-400"
                  />
                  {formData.cause && (
                    <Badge className={`mt-2 ${getSeverityColor(formData.cause)}`}>
                      Niveau de criticité détecté automatiquement
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>Travaux d'intervention effectués</Label>
                  <Textarea
                    placeholder="Détaillez les actions correctives menées..."
                    value={formData.travauxEffectues || ''}
                    onChange={(e) => handleFieldChange('travauxEffectues', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Commentaires et recommandations</Label>
                  <Textarea
                    placeholder="Recommandations pour éviter la récurrence, observations particulières..."
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
              description="Personnes ayant constaté ou traité la défaillance"
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
              title="Pièces remplacées ou utilisées" 
              description="Liste des composants changés pour résoudre la défaillance"
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
                        <Label className="text-sm">Nom de la pièce *</Label>
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
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-800">Coût total des pièces:</span>
                      <Badge className="bg-red-100 text-red-700">
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
              description="Photos de la défaillance, rapports, documents liés"
              icon={<Paperclip className="w-4 h-4" />}
            >
              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-red-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors bg-red-50">
                      <Paperclip className="w-8 h-8 mx-auto mb-2 text-red-400" />
                      <p className="text-sm font-medium text-red-700">Cliquez pour ajouter des fichiers</p>
                      <p className="text-xs text-red-600">Photos de la défaillance, rapports techniques, etc.</p>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
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
              * Champs obligatoires pour les défaillances
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
                disabled={loading || !formData.problemeRencontre?.trim() || !formData.cause?.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {initialData ? 'Mettre à jour' : 'Enregistrer la défaillance'}
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