import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Upload, Users, MapPin, User, FileText, Send, X, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { mockEmployees, mockDocumentTypes } from "@/data/mockData";
import { Employee, DocumentType, TrainingRecord } from "@/types";
import { generateCapacitacaoPDF } from "@/utils/pdfGenerator";

const formSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  local: z.string().min(3, "Local deve ter pelo menos 3 caracteres"),
  instrutor: z.string().min(3, "Nome do instrutor é obrigatório"),
  tipoDocumentoId: z.string({
    required_error: "Tipo de documento é obrigatório",
  }),
  participantes: z.array(z.string()).min(1, "Selecione pelo menos um participante"),
  certificadoFile: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCapacitacaoFormProps {
  onSubmit: (data: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function CreateCapacitacaoForm({ onSubmit, onCancel }: CreateCapacitacaoFormProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      local: "",
      instrutor: "",
      participantes: [],
    },
  });

  const handleParticipantToggle = (employeeId: string) => {
    const updated = selectedParticipants.includes(employeeId)
      ? selectedParticipants.filter(id => id !== employeeId)
      : [...selectedParticipants, employeeId];
    
    setSelectedParticipants(updated);
    form.setValue("participantes", updated);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      form.setValue("certificadoFile", file);
    } else {
      alert("Por favor, selecione apenas arquivos PDF");
    }
  };

  const handleSubmit = (data: FormData) => {
    const selectedEmployees = mockEmployees.filter(emp => 
      data.participantes.includes(emp.id)
    );
    
    const selectedDocumentType = mockDocumentTypes.find(type => 
      type.id === data.tipoDocumentoId
    )!;

    const trainingRecord: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      titulo: data.titulo,
      data: data.data,
      local: data.local,
      instrutor: data.instrutor,
      participantes: selectedEmployees,
      tipoDocumento: selectedDocumentType,
      certificadoUrl: uploadedFile ? `/docs/${uploadedFile.name}` : undefined,
      status: 'draft',
    };

    onSubmit(trainingRecord);
  };

  const selectedEmployees = mockEmployees.filter(emp => 
    selectedParticipants.includes(emp.id)
  );

  const handleGeneratePDF = () => {
    const formValues = form.getValues();
    
    // Validar se todos os campos obrigatórios estão preenchidos
    if (!formValues.titulo || !formValues.data || !formValues.local || 
        !formValues.instrutor || !formValues.tipoDocumentoId || 
        selectedParticipants.length === 0) {
      alert("Por favor, preencha todos os campos obrigatórios antes de gerar o PDF");
      return;
    }

    const selectedEmployeesForPDF = mockEmployees.filter(emp => 
      selectedParticipants.includes(emp.id)
    );
    
    const selectedDocumentType = mockDocumentTypes.find(type => 
      type.id === formValues.tipoDocumentoId
    )!;

    const trainingRecord: Omit<TrainingRecord, 'id' | 'createdAt' | 'updatedAt'> = {
      titulo: formValues.titulo,
      data: formValues.data,
      local: formValues.local,
      instrutor: formValues.instrutor,
      participantes: selectedEmployeesForPDF,
      tipoDocumento: selectedDocumentType,
      certificadoUrl: uploadedFile ? `/docs/${uploadedFile.name}` : undefined,
      status: 'draft',
    };

    generateCapacitacaoPDF(trainingRecord);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-medium">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Novo Registro de Capacitação</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Preencha os dados do treinamento ou evento de capacitação
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Título do Evento
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Treinamento de Segurança do Trabalho"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Data */}
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Data do Evento
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de Documento */}
              <FormField
                control={form.control}
                name="tipoDocumentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockDocumentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Local */}
              <FormField
                control={form.control}
                name="local"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Local
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Auditório Principal - Sede"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Instrutor */}
              <FormField
                control={form.control}
                name="instrutor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Instrutor/Responsável
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nome do instrutor ou responsável"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Upload de Arquivo */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Certificado/Ata (PDF)
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label 
                  htmlFor="pdf-upload" 
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {uploadedFile ? uploadedFile.name : 'Clique para fazer upload do PDF'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apenas arquivos PDF são aceitos
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Seleção de Participantes */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="participantes"
                render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participantes ({selectedParticipants.length} selecionados)
                    </FormLabel>
                    <div className="space-y-3">
                      {/* Participantes Selecionados */}
                      {selectedEmployees.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployees.map((employee) => (
                            <Badge 
                              key={employee.id} 
                              variant="secondary" 
                              className="px-3 py-1"
                            >
                              {employee.nome}
                              <button
                                type="button"
                                onClick={() => handleParticipantToggle(employee.id)}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Lista de Funcionários */}
                      <div className="max-h-60 overflow-y-auto border rounded-lg">
                        {mockEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center space-x-3 p-3 hover:bg-muted/50 border-b last:border-b-0"
                          >
                            <Checkbox
                              id={employee.id}
                              checked={selectedParticipants.includes(employee.id)}
                              onCheckedChange={() => handleParticipantToggle(employee.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {employee.nome}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {employee.cargo} • {employee.setor}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGeneratePDF}
                className="flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Gerar PDF
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancelar
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="submit"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Salvar Rascunho
                  </Button>
                  <Button 
                    type="button"
                    className="bg-gradient-primary hover:bg-primary-hover"
                    onClick={() => {
                      form.handleSubmit((data) => {
                        handleSubmit(data);
                        // Simular envio para assinatura
                        alert("Documento salvo e enviado para assinatura via Cailun!");
                      })();
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Salvar e Enviar para Assinatura
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}