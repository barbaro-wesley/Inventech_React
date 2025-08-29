// src/components/SobreAvisoForm.jsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface SobreAvisoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function SobreAvisoForm({ isOpen, onClose, onSubmit }: SobreAvisoFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    data: '',
    horaInicio: '',
    horaFim: '',
    motivo: '',
    aSerFeito: '',
    observacoes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.data || !formData.horaInicio || !formData.horaFim || !formData.motivo || !formData.aSerFeito) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      data: formData.data ? new Date(formData.data).toISOString() : null,
      horaInicio: formData.horaInicio ? new Date(formData.horaInicio).toISOString() : null,
      horaFim: formData.horaFim ? new Date(formData.horaFim).toISOString() : null,
    };

    try {
      const response = await api.post('/sobreaviso', payload, {
        withCredentials: true,
      });

      toast({
        title: "Sucesso",
        description: "Sobre Aviso cadastrado com sucesso!",
      });

      onSubmit(response.data);
      onClose();

      setFormData({
        data: '',
        horaInicio: '',
        horaFim: '',
        motivo: '',
        aSerFeito: '',
        observacoes: '',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Tente novamente.';
      toast({
        title: "Erro",
        description: `Erro ao salvar Sobre Aviso: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-[90vw] sm:max-w-[600px] overflow-y-auto p-4 sm:p-6">
        <SheetHeader>
          <SheetTitle className="text-base sm:text-lg">
            Cadastrar Sobre Aviso
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="p-3 sm:p-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Informações do Sobre Aviso</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="data" className="text-xs sm:text-sm">Data *</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="horaInicio" className="text-xs sm:text-sm">Hora Início *</Label>
                <Input
                  id="horaInicio"
                  name="horaInicio"
                  type="datetime-local"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="horaFim" className="text-xs sm:text-sm">Hora Fim *</Label>
                <Input
                  id="horaFim"
                  name="horaFim"
                  type="datetime-local"
                  value={formData.horaFim}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="motivo" className="text-xs sm:text-sm">Motivo *</Label>
                <Textarea
                  id="motivo"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="aSerFeito" className="text-xs sm:text-sm">A Ser Feito *</Label>
                <Textarea
                  id="aSerFeito"
                  name="aSerFeito"
                  value={formData.aSerFeito}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="observacoes" className="text-xs sm:text-sm">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  className="text-sm"
                />
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-w-[70px] px-2 rounded-md hover:bg-gray-100 text-sm"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              className="min-w-[70px] px-2 rounded-md bg-gradient-brand hover:opacity-90 text-sm"
            >
              Salvar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}