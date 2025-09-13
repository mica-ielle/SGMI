import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { EnhancedForm, FormSection } from "../ui/enhanced-form";
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
  Download,
  MapPin,
  Settings,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner@2.0.3";
import { siteService } from "../../services/siteService";
import type {
  FicheIntervention,
  TypeIntervention,
  Resultat,
  Equipement,
  Piece,
  Site,
  EquipementInstalle,
  RequetCreateFiche,
} from "../../types";
import { planningService } from "../../services/planningService";

interface FicheInterventionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipement?: Equipement;
  site?: Site;
  onSuccess: () => void;
  initialData?: FicheIntervention;
}

interface PieceRemplaceeForm {
  piece?: Piece;
  reference: string;
  designation: string;
  quantiteUtilisee: number;
  prixUnitaire?: number;
}

interface CoutForm {
  mainOeuvre: number;
  pieces: number;
  autresFrais: number;
  total: number;
}

export const FicheInterventionForm = ({
  open,
  onOpenChange,
  equipement,
  site,
  onSuccess,
  initialData,
}: FicheInterventionFormProps) => {
  const [formData, setFormData] = useState<FicheIntervention>({
    type: "MAINTENANCE_PLANIFIEE",
    dateHeureIntervention: format(
      new Date(),
      "yyyy-MM-dd'T'HH:mm",
    ),
    descriptionIntervention: "",
    coutTotal: 0,
    piecesRemplacees: [],
    nomsIntervenants: [""],
    piecesJointes: [],
  });

  const [piecesForm, setPiecesForm] = useState<
    PieceRemplaceeForm[]
  >([]);
  const [intervenantsForm, setIntervenantsForm] = useState<
    string[]
  >([""]);
  const [coutForm, setCoutForm] = useState<CoutForm>({
    mainOeuvre: 0,
    pieces: 0,
    autresFrais: 0,
    total: 0,
  });
  const [numeroSerie, setNumeroSerie] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Nouveaux états pour la sélection site/équipement
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<
    number | null
  >(null);
  const [
    selectedEquipementInstalle,
    setSelectedEquipementInstalle,
  ] = useState<EquipementInstalle | null>(null);
  const [equipementsDisponibles, setEquipementsDisponibles] =
    useState<EquipementInstalle[]>([]);
  
  // États pour la gestion des pièces de l'équipement
  const [piecesDisponibles, setPiecesDisponibles] = useState<Piece[]>([]);
  const [selectedPieces, setSelectedPieces] = useState<Set<number>>(new Set());

  // Charger les sites au montage du composant
  useEffect(() => {
    const loadSites = async () => {
      try {
        const sitesData = await siteService.getAll();
        setSites(sitesData);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des sites:",
          error,
        );
      }
    };

    if (open) {
      loadSites();
    }
  }, [open]);

  // Gérer la sélection du site
  useEffect(() => {
    if (selectedSiteId) {
      const selectedSite = sites.find(
        (s) => s.id_site === selectedSiteId,
      );
      if (selectedSite?.equipementInstalles) {
        setEquipementsDisponibles(
          selectedSite.equipementInstalles,
        );
      } else {
        setEquipementsDisponibles([]);
      }
      // Reset de la sélection d'équipement quand on change de site
      setSelectedEquipementInstalle(null);
      setNumeroSerie("");
    }
  }, [selectedSiteId, sites]);

  // Gérer la sélection de l'équipement
  useEffect(() => {
    if (selectedEquipementInstalle) {
      setNumeroSerie(
        selectedEquipementInstalle.equipement.reference || "",
      );
      // Charger les pièces disponibles pour cet équipement
      if (selectedEquipementInstalle.equipement.pieces) {
        setPiecesDisponibles(selectedEquipementInstalle.equipement.pieces);
      } else {
        setPiecesDisponibles([]);
      }
      // Reset des pièces sélectionnées
      setSelectedPieces(new Set());
    }
  }, [selectedEquipementInstalle]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
        setIntervenantsForm(
          initialData.nomsIntervenants || [""],
        );
        setPiecesForm(
          initialData.piecesRemplacees?.map((p) => ({
            piece: p.piece,
            reference: p.reference,
            designation: p.nom,
            quantiteUtilisee: p.quantiteUtilisee,
            prixUnitaire: p.prixUnitaire,
          })) || [],
        );
        setNumeroSerie(
          initialData.equipement?.numeroSerie || "",
        );

        // Si on a un équipement et un site en paramètre, les préselectionner
        if (site) {
          setSelectedSiteId(site.id_site!);
        }
        if (equipement && site?.equipementInstalles) {
          const equipInstalle = site.equipementInstalles.find(
            (ei) =>
              ei.equipement.id_equipement ===
              equipement.id_equipement,
          );
          if (equipInstalle) {
            setSelectedEquipementInstalle(equipInstalle);
          }
        }
      } else {
        // Reset form for new intervention
        setFormData({
          type: "MAINTENANCE_PLANIFIEE",
          dateHeureIntervention: format(
            new Date(),
            "yyyy-MM-dd'T'HH:mm",
          ),
          descriptionIntervention: "",
          coutTotal: 0,
          piecesRemplacees: [],
          nomsIntervenants: [""],
          piecesJointes: [],
        });
        setIntervenantsForm([""]);
        setPiecesForm([]);
        setNumeroSerie("");
        setCoutForm({
          mainOeuvre: 0,
          pieces: 0,
          autresFrais: 0,
          total: 0,
        });
        setSelectedSiteId(null);
        setSelectedEquipementInstalle(null);
        setEquipementsDisponibles([]);
      }
    }
  }, [open, initialData, equipement, site]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const removePiece = (index: number) => {
    setPiecesForm((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePiece = (
    index: number,
    field: string,
    value: any,
  ) => {
    setPiecesForm((prev) =>
      prev.map((piece, i) =>
        i === index ? { ...piece, [field]: value } : piece,
      ),
    );
  };

  const addIntervenant = () => {
    setIntervenantsForm((prev) => [...prev, ""]);
  };

  const removeIntervenant = (index: number) => {
    if (intervenantsForm.length > 1) {
      setIntervenantsForm((prev) =>
        prev.filter((_, i) => i !== index),
      );
    }
  };

  const updateIntervenant = (index: number, value: string) => {
    setIntervenantsForm((prev) =>
      prev.map((intervenant, i) =>
        i === index ? value : intervenant,
      ),
    );
  };

  const handlePieceSelection = (pieceId: number, selected: boolean) => {
    const newSelectedPieces = new Set(selectedPieces);
    
    if (selected) {
      newSelectedPieces.add(pieceId);
      // Ajouter la pièce au formulaire
      const piece = piecesDisponibles.find(p => p.id_piece === pieceId);
      if (piece) {
        setPiecesForm(prev => [...prev, {
          piece: piece,
          reference: piece.reference,
          designation: piece.nom,
          quantiteUtilisee: 1,
          prixUnitaire: 0
        }]);
      }
    } else {
      newSelectedPieces.delete(pieceId);
      // Retirer la pièce du formulaire
      setPiecesForm(prev => prev.filter(pf => pf.piece?.id_piece !== pieceId));
    }
    
    setSelectedPieces(newSelectedPieces);
  };

  const addCustomPiece = () => {
    setPiecesForm(prev => [...prev, {
      reference: '',
      designation: '',
      quantiteUtilisee: 1,
      prixUnitaire: 0
    }]);
  };

const addPiece = addCustomPiece;

  const calculatePiecesTotal = () => {
    return piecesForm.reduce(
      (total, piece) =>
        total +
        piece.quantiteUtilisee * (piece.prixUnitaire || 0),
      0,
    );
  };

  const calculateTotalCost = () => {
    const piecesTotal = calculatePiecesTotal();
    return (
      coutForm.mainOeuvre + piecesTotal + coutForm.autresFrais
    );
  };

  // Mettre à jour automatiquement le total des coûts
  useEffect(() => {
    const piecesTotal = calculatePiecesTotal();
    const total =
      coutForm.mainOeuvre + piecesTotal + coutForm.autresFrais;
    setCoutForm((prev) => ({
      ...prev,
      pieces: piecesTotal,
      total,
    }));
  }, [piecesForm, coutForm.mainOeuvre, coutForm.autresFrais]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      // Simulate file upload - replace with real implementation
      const uploadedFiles = Array.from(files).map(
        (file) => file.name,
      );
      setFormData((prev) => ({
        ...prev,
        piecesJointes: [
          ...(prev.piecesJointes || []),
          ...uploadedFiles,
        ],
      }));
      toast.success(`${files.length} fichier(s) ajouté(s)`);
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validation pour défaillance
      if (formData.type === "DEFAILLANCE") {
        if (!formData.problemeRencontre?.trim()) {
          toast.error(
            "Le problème rencontré est obligatoire pour une défaillance",
          );
          return;
        }
        if (!formData.cause?.trim()) {
          toast.error(
            "La cause identifiée est obligatoire pour une défaillance",
          );
          return;
        }
      }

      const finalData: FicheIntervention = {
        ...formData,
        coutTotal: calculateTotalCost(),
        nomsIntervenants: intervenantsForm.filter((name) =>
          name.trim(),
        ),
        piecesRemplacees: piecesForm
          .filter((piece) => piece.designation.trim())
          .map((piece) => ({
            piece: piece.piece,
            reference: piece.reference,
            nom: piece.designation,
            quantiteUtilisee: piece.quantiteUtilisee,
            prixUnitaire: piece.prixUnitaire,
          })),
        equipement: selectedEquipementInstalle
          ? {
              ...selectedEquipementInstalle.equipement,
              numeroSerie:
                numeroSerie ||
                selectedEquipementInstalle.equipement.reference,
            }
          : undefined,
      };

      const piece = [];

      for (const p of finalData.piecesRemplacees) {
        piece.push(p.piece?.id_piece);
      }

      const creeFiche: RequetCreateFiche = {
        ficheIntervention: finalData,
        equipementId: finalData.equipement?.id_equipement,
        pieceList: piece,
      };

      // TODO: Replace with real API call

      await planningService.createFicheIntervention(creeFiche);
      console.log("Submitting fiche intervention:", finalData);

      toast.success("Fiche d'intervention créée avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur lors de la création de la fiche");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Generate and download PDF
    toast.info("Génération du PDF en cours...");
  };

  const getTypeIcon = (type: TypeIntervention) => {
    return type === "MAINTENANCE_PLANIFIEE" ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <AlertTriangle className="w-4 h-4" />
    );
  };

  const getResultatColor = (resultat: Resultat) => {
    switch (resultat) {
      case "OK":
        return "bg-green-100 text-green-700 border-green-200";
      case "REPARÉ":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "SUIVI_NÉCESSAIRE":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {initialData
              ? "Modifier la fiche d'intervention"
              : "Nouvelle fiche d'intervention"}
          </DialogTitle>
          {selectedEquipementInstalle && (
            <p className="text-muted-foreground">
              Équipement:{" "}
              <span className="font-medium">
                {selectedEquipementInstalle.equipement.nom}
              </span>{" "}
              ({selectedEquipementInstalle.equipement.reference}
              )
            </p>
          )}
        </DialogHeader>

        <Separator />

        <div
          className="flex-1 overflow-auto p-6"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          <div className="space-y-6">
            {/* Identification de l'équipement */}
            <FormSection
              title="Identification de l'équipement"
              description="Informations sur l'équipement concerné"
              icon={<Package className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Site *</Label>
                  <Select
                    value={selectedSiteId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedSiteId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un site" />
                      <ChevronDown className="w-4 h-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem
                          key={site.id_site}
                          value={site.id_site!.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {site.nom} - {site.ville}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Équipement concerné *</Label>
                  <Select
                    value={
                      selectedEquipementInstalle?.id_equipementInstalle?.toString() ||
                      ""
                    }
                    onValueChange={(value) => {
                      const equipInstalle =
                        equipementsDisponibles.find(
                          (eq) =>
                            eq.id_equipementInstalle?.toString() ===
                            value,
                        );
                      setSelectedEquipementInstalle(
                        equipInstalle || null,
                      );
                    }}
                    disabled={!selectedSiteId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un équipement" />
                      <ChevronDown className="w-4 h-4" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipementsDisponibles.map(
                        (equipInstalle) => (
                          <SelectItem
                            key={
                              equipInstalle.id_equipementInstalle
                            }
                            value={equipInstalle.id_equipementInstalle!.toString()}
                          >
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              {equipInstalle.equipement.nom} (
                              {
                                equipInstalle.equipement
                                  .reference
                              }
                              )
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  {!selectedSiteId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Veuillez d'abord sélectionner un site
                    </p>
                  )}
                </div>
              </div>

              {selectedEquipementInstalle && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Type d'équipement</Label>
                    <Input
                      value={
                        selectedEquipementInstalle.equipement
                          .type || "Non spécifié"
                      }
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label>Référence</Label>
                    <Input
                      value={
                        selectedEquipementInstalle.equipement
                          .reference || "Non spécifié"
                      }
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              )}

              {selectedEquipementInstalle && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Modèle:</span>
                    <span>
                      {
                        selectedEquipementInstalle.equipement
                          .nom
                      }
                    </span>
                    {selectedEquipementInstalle.equipement
                      .fournisseur && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium">
                          Fournisseur:
                        </span>
                        <span>
                          {
                            selectedEquipementInstalle
                              .equipement.fournisseur
                          }
                        </span>
                      </>
                    )}
                    {selectedEquipementInstalle.date_installation && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="font-medium">
                          Installé le:
                        </span>
                        <span>
                          {new Date(
                            selectedEquipementInstalle.date_installation,
                          ).toLocaleDateString("fr-FR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </FormSection>

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
                    onValueChange={(value) =>
                      handleFieldChange(
                        "type",
                        value as TypeIntervention,
                      )
                    }
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
                    onChange={(e) =>
                      handleFieldChange(
                        "dateHeureIntervention",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div>
                  <Label>Résultat</Label>
                  <Select
                    value={formData.resultat}
                    onValueChange={(value) =>
                      handleFieldChange(
                        "resultat",
                        value as Resultat,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">✅ OK</SelectItem>
                      <SelectItem value="REPARÉ">
                        🔧 Réparé
                      </SelectItem>
                      <SelectItem value="SUIVI_NÉCESSAIRE">
                        ⚠️ Suivi nécessaire
                      </SelectItem>
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
                  <Label>Description détaillée *</Label>
                  <Textarea
                    placeholder="Décrivez l'intervention réalisée en détail..."
                    value={formData.descriptionIntervention}
                    onChange={(e) =>
                      handleFieldChange(
                        "descriptionIntervention",
                        e.target.value,
                      )
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label>
                    Problème rencontré{" "}
                    {formData.type === "DEFAILLANCE" && "*"}
                  </Label>
                  <Textarea
                    placeholder="Décrivez le problème ou la panne..."
                    value={formData.problemeRencontre || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "problemeRencontre",
                        e.target.value,
                      )
                    }
                    rows={2}
                    required={formData.type === "DEFAILLANCE"}
                  />
                  {formData.type === "DEFAILLANCE" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Obligatoire pour une défaillance
                    </p>
                  )}
                </div>

                <div>
                  <Label>
                    Cause identifiée{" "}
                    {formData.type === "DEFAILLANCE" && "*"}
                  </Label>
                  <Textarea
                    placeholder="Cause du problème..."
                    value={formData.cause || ""}
                    onChange={(e) =>
                      handleFieldChange("cause", e.target.value)
                    }
                    rows={2}
                    required={formData.type === "DEFAILLANCE"}
                  />
                  {formData.type === "DEFAILLANCE" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Obligatoire pour une défaillance
                    </p>
                  )}
                </div>

                <div>
                  <Label>Travaux effectués</Label>
                  <Textarea
                    placeholder="Détaillez les travaux réalisés..."
                    value={formData.travauxEffectues || ""}
                    onChange={(e) =>
                      handleFieldChange(
                        "travauxEffectues",
                        e.target.value,
                      )
                    }
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Commentaires additionnels</Label>
                  <Textarea
                    placeholder="Remarques, observations, recommandations..."
                    value={
                      formData.commentairesAdditionnels || ""
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        "commentairesAdditionnels",
                        e.target.value,
                      )
                    }
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
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder="Nom de l'intervenant"
                      value={intervenant}
                      onChange={(e) =>
                        updateIntervenant(index, e.target.value)
                      }
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
                <Button
                  variant="outline"
                  onClick={addIntervenant}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un intervenant
                </Button>
              </div>
            </FormSection>

            {/* Pièces remplacées */}
            <FormSection
              title="Pièces remplacées"
              description="Sélectionnez les pièces de l'équipement ou ajoutez des pièces personnalisées"
              icon={<Package className="w-4 h-4" />}
            >
              <div className="space-y-6">
                {/* Pièces disponibles pour l'équipement sélectionné */}
                {selectedEquipementInstalle && piecesDisponibles.length > 0 && (
                  <div>
                    <Label className="text-base">Pièces de l'équipement {selectedEquipementInstalle.equipement.nom}</Label>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-blue-50">
                      {piecesDisponibles.map((piece) => (
                        <div key={piece.id_piece} className="flex items-center space-x-3 p-2 bg-white rounded border">
                          <input
                            type="checkbox"
                            id={`piece-${piece.id_piece}`}
                            checked={selectedPieces.has(piece.id_piece!)}
                            onChange={(e) => handlePieceSelection(piece.id_piece!, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <label htmlFor={`piece-${piece.id_piece}`} className="flex-1 cursor-pointer">
                            <div className="font-medium text-sm">{piece.nom}</div>
                            <div className="text-xs text-muted-foreground">Réf: {piece.reference}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pièces sélectionnées et personnalisées */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Pièces utilisées</Label>
                    <Button variant="outline" size="sm" onClick={addCustomPiece}>
                      <Plus className="w-4 h-4 mr-2" />
                      Pièce personnalisée
                    </Button>
                  </div>

                  {piecesForm.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedEquipementInstalle && piecesDisponibles.length > 0 
                        ? "Sélectionnez des pièces ci-dessus ou ajoutez une pièce personnalisée"
                        : "Aucun équipement sélectionné ou aucune pièce disponible"
                      }
                    </div>
                  ) : (
                    piecesForm.map((piece, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            {piece.piece ? (
                              <>
                                <Package className="w-4 h-4 text-blue-600" />
                                Pièce d'équipement #{index + 1}
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 text-orange-600" />
                                Pièce personnalisée #{index + 1}
                              </>
                            )}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Si c'est une pièce de l'équipement, la décocher aussi
                              if (piece.piece?.id_piece) {
                                handlePieceSelection(piece.piece.id_piece, false);
                              } else {
                                removePiece(index);
                              }
                            }}
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
                              disabled={!!piece.piece} // Désactivé si c'est une pièce de l'équipement
                              className={piece.piece ? 'bg-blue-50' : ''}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Désignation *</Label>
                            <Input
                              placeholder="Désignation de la pièce"
                              value={piece.designation}
                              onChange={(e) => updatePiece(index, 'designation', e.target.value)}
                              disabled={!!piece.piece} // Désactivé si c'est une pièce de l'équipement
                              className={piece.piece ? 'bg-blue-50' : ''}
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
                            <Label className="text-sm">Prix unitaire (FCFA)</Label>
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
                    ))
                  )}
                </div>
              </div>
            </FormSection>

            {/* Coût total de l'intervention */}
            <FormSection
              title="Coût total de l'intervention"
              description="Répartition des coûts (main-d'œuvre, pièces, autres frais)"
              icon={<Euro className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Main-d'œuvre (FCFA)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={coutForm.mainOeuvre}
                    onChange={(e) =>
                      setCoutForm((prev) => ({
                        ...prev,
                        mainOeuvre:
                          parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Pièces (FCFA)</Label>
                  <Input
                    type="number"
                    value={coutForm.pieces.toFixed(2)}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculé automatiquement
                  </p>
                </div>
                <div>
                  <Label>Autres frais (FCFA)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={coutForm.autresFrais}
                    onChange={(e) =>
                      setCoutForm((prev) => ({
                        ...prev,
                        autresFrais:
                          parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Total (FCFA)</Label>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-center">
                    <Badge className="bg-purple-100 text-purple-700 text-lg px-3 py-1">
                      {coutForm.total.toFixed(2)} FCFA
                    </Badge>
                  </div>
                </div>
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
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium">
                        Cliquez pour ajouter des fichiers
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, PDF jusqu'à 10MB
                      </p>
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

                {formData.piecesJointes &&
                  formData.piecesJointes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Fichiers ajoutés:</Label>
                      {formData.piecesJointes.map(
                        (fichier, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">
                              {fichier}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFiles =
                                  formData.piecesJointes!.filter(
                                    (_, i) => i !== index,
                                  );
                                handleFieldChange(
                                  "piecesJointes",
                                  newFiles,
                                );
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
              </div>
            </FormSection>
          </div>
        </div>

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
                disabled={
                  loading ||
                  !formData.descriptionIntervention.trim() ||
                  !selectedSiteId ||
                  !selectedEquipementInstalle
                }
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
                    {initialData
                      ? "Mettre à jour"
                      : "Créer la fiche"}
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