import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Save, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';
import { planningService } from '../../services/planningService';
import type { TachePlanifie } from '../../types';

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tache: TachePlanifie | null;
  onSuccess: () => void;
}

export const RescheduleDialog = ({ 
  open, 
  onOpenChange, 
  tache, 
  onSuccess 
}: RescheduleDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tache) {
      setSelectedDate(new Date(tache.datePrevu));
    }
  }, [open, tache]);

  const handleSubmit = async () => {
    if (!tache?.id_tachePlanifie) return;

    try {
      setLoading(true);
      const newDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Appeler l'endpoint spécifique pour reporter une tâche
      await planningService.reporterTache(tache.id_tachePlanifie, newDate);
      
      toast.success('Tâche reprogrammée avec succès');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la reprogrammation:', error);
      toast.error('Erreur lors de la reprogrammation de la tâche');
    } finally {
      setLoading(false);
    }
  };

  if (!tache) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Reprogrammer la tâche
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-medium text-blue-800">{tache.nom}</div>
            <div className="text-sm text-blue-600">
              {tache.site ? `${tache.site.nom} - ${tache.site.ville}` : 'Site non défini'}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              Date actuelle : {format(new Date(tache.datePrevu), 'dd MMMM yyyy', { locale: fr })}
            </div>
          </div>

          <div>
            <Label>Nouvelle date prévue *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start mt-2">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Reprogrammation...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Reprogrammer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};