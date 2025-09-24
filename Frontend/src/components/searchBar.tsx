import { useState, useCallback, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useFiltros } from "../hooks/useFiltros";
import { Filtros } from "../components/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../components/ui/calendar";
import { format, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { pt } from "date-fns/locale";
import { Select, SelectContent , SelectGroup , SelectItem , SelectLabel , SelectTrigger , SelectValue } from "./ui/select";

interface FiltrosBarProps {
  onAplicarFiltros?: (filtros: Filtros) => void;
}

export default function FiltrosBar({ onAplicarFiltros }: FiltrosBarProps) {
  const { filtros, handleFiltroChange, limparFiltros } = useFiltros();

  const [filtrosTemporarios, setFiltrosTemporarios] = useState<Filtros>(filtros);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  // Inicializar dateRange baseado nos filtros existentes
  useEffect(() => {
    if (filtros.dataInicio && filtros.dataFim) {
      setDateRange({
        from: new Date(filtros.dataInicio),
        to: new Date(filtros.dataFim)
      });
    }
  }, [filtros.dataInicio, filtros.dataFim]);

  const handleInputChange = (nome: keyof Filtros, valor: string) => {
    setFiltrosTemporarios(prev => ({
      ...prev,
      [nome]: valor
    }));
  };

  const handleDateChange = (date: DateRange | undefined) => {
    setDateRange(date);

    if (!date?.from || !date?.to) {
      setFiltrosTemporarios(prev => ({
        ...prev,
        dataInicio: '',
        dataFim: ''
      }));
      return;
    }

    // Formatar datas no formato correto (DD-MM-YYYY)
    setFiltrosTemporarios(prev => ({
      ...prev,
      dataInicio: format(date.from!, "dd-MM-yyyy"),
      dataFim: format(date.to!, "dd-MM-yyyy")
    }));
  };

  const handleBuscar = () => {
    console.log("[FiltrosBar] Aplicando filtros:", filtrosTemporarios);
    
    // Garantir que campos vazios sejam undefined
    const filtrosParaAplicar = {
      ...filtrosTemporarios,
      nomeFormula: filtrosTemporarios.nomeFormula || undefined,
      codigo: filtrosTemporarios.codigo || undefined,
      numero: filtrosTemporarios.numero || undefined,
      dataInicio: filtrosTemporarios.dataInicio || undefined,
      dataFim: filtrosTemporarios.dataFim || undefined,
    };

    if (onAplicarFiltros) {
      onAplicarFiltros(filtrosParaAplicar);
    }
  };

  const handleLimpar = () => {
    const filtrosLimpos: Filtros = {
      dataInicio: '',
      dataFim: '',
      nomeFormula: '',
      codigo: '',
      numero: ''
    };

    setFiltrosTemporarios(filtrosLimpos);
    setDateRange(undefined);
    limparFiltros();

    if (onAplicarFiltros) {
      onAplicarFiltros(filtrosLimpos);
    }
  };

  return (
    <div className="flex flex-row items-end justify-end gap-1">
      <Input
        type="text"
        placeholder="Filtrar por nome da fórmula"
        value={filtrosTemporarios.nomeFormula}
        onChange={(e) => handleInputChange('nomeFormula', e.target.value)}
        className="border-black w-50"
      />

      <Select>
        <SelectTrigger className="w-40 border-black">
          <SelectValue placeholder="Filtrar por Código" />
        </SelectTrigger>
        <SelectContent>
        <SelectGroup>
          <SelectLabel>Códigos</SelectLabel>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
          <SelectItem value="3">3</SelectItem>
        </SelectGroup>
      </SelectContent>
      </Select>

      <Select>
        <SelectTrigger className="w-42 border-black">
          <SelectValue placeholder="Filtrar por Número" />
        </SelectTrigger>
        <SelectContent>
        <SelectGroup>
          <SelectLabel>Números</SelectLabel>
          <SelectItem value="1">001</SelectItem>
          <SelectItem value="2">002</SelectItem>
          <SelectItem value="3">003</SelectItem>
        </SelectGroup>
      </SelectContent>
      </Select>

{/*input antigo codigo e numero
      <Input
        type="text"
        placeholder="Filtrar por Código da fórmula..."
        value={filtrosTemporarios.codigo}
        onChange={(e) => handleInputChange('codigo', e.target.value)}
        className="border-black w-60"
      />
      <Input
        type="text"
        placeholder="Filtrar por Número da fórmula..."
        value={filtrosTemporarios.numero}
        onChange={(e) => handleInputChange('numero', e.target.value)}
        className="border-black w-60"
      /> */}

      <Popover>
        <PopoverTrigger>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-55 justify-start text-left font-normal border border-black",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                  {format(dateRange.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            autoFocus
            mode="range"
            locale={pt}
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateChange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" onClick={handleBuscar} className="text-black">
        Buscar
      </Button>

      <Button onClick={handleLimpar} variant="outline">
        Limpar
      </Button>
    </div>
  );
}
