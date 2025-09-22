import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useFiltros } from "../hooks/useFiltros";
import { Filtros } from "../components/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "../components/ui/calendar"
import { format, startOfDay, endOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { type DateRange } from "react-day-picker"
import { pt } from "date-fns/locale";

interface FiltrosBarProps {
  onAplicarFiltros?: (filtros: Filtros) => void;
}

export default function FiltrosBar({ onAplicarFiltros }: FiltrosBarProps) {
  const { filtros, handleFiltroChange, limparFiltros } = useFiltros();
  const [filtrosTemporarios, setFiltrosTemporarios] = useState<Filtros>(filtros);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  // Atualiza os filtros temporários quando os inputs mudam
  const handleInputChange = (nome: keyof Filtros, valor: string) => {
    const novosFiltros = {
      ...filtrosTemporarios,
      [nome]: valor
    };
    setFiltrosTemporarios(novosFiltros);
  };

  // Atualiza o date range e os filtros temporários
  const handleDateChange = (date: DateRange | undefined) => {
    setDateRange(date);
    
    if (!date?.from || !date?.to) {
    const novosFiltros = {
      ...filtrosTemporarios,
      dataInicio: '',
      dataFim: ''
    };
    setFiltrosTemporarios(novosFiltros);
    return;
  }

  const novosFiltros = {
    ...filtrosTemporarios,
    dataInicio: format(date.from, "dd-MM-yyyy"),
    dataFim: format(date.to, "dd-MM-yyyy")
  };
  
  setFiltrosTemporarios(novosFiltros);
};
  // Aplica os filtros para a API
  const handleBuscar = () => {
    // Atualiza os filtros no contexto/hook
    Object.entries(filtrosTemporarios).forEach(([key, value]) => {
      handleFiltroChange(key as keyof Filtros, value);
    });

    console.log("Aplicando filtros para API:", filtrosTemporarios);
    
    // Chama a API ou callback pai
    if (onAplicarFiltros) {
      onAplicarFiltros(filtrosTemporarios);
    }

    //  Aqui você faria a chamada para a API:
     fetchDadosDaAPI(filtrosTemporarios);
  };

  //  Exemplo de função para chamar a API
   const fetchDadosDaAPI = async (filtros: Filtros) => {
     try {
       const response = await fetch(`/api/relatorio/paginate?page=1&pageSize=100`, {
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           dateStart: filtros.dataInicio,
           dateEnd: filtros.dataFim,
           nomeFormula: filtros.nomeFormula,
         }),
       });
      
       const data = await response.json();
       console.log("Dados da API:", data);
       // Atualize seu estado com os dados recebidos
      
     } catch (error) {
       console.error("Erro ao buscar dados da API:", error);
     }
   };

  // Limpa todos os filtros
  const handleLimpar = () => {
    const filtrosLimpos = {
      dataInicio: '',
      dataFim: '',
      nomeFormula: ''
    };
    
    setFiltrosTemporarios(filtrosLimpos);
    setDateRange(undefined);
    limparFiltros();
    
    if (onAplicarFiltros) {
      onAplicarFiltros(filtrosLimpos);
    }
  };


  return (
    <div className="flex flex-row items-end justify-end gap-2">
      <Input 
        type="text" 
        placeholder="Filtrar por nome da fórmula..."
        value={filtrosTemporarios.nomeFormula}
        onChange={(e) => handleInputChange('nomeFormula', e.target.value)}
        className="border-black w-60"
      />
      
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
        <PopoverContent className="w-auto p-0" >
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
      
      
      {/* <Input 
        type="date" 
        placeholder="Data fim"
        value={filtrosTemporarios.dataFim}
        onChange={(e) => handleInputChange('dataFim', e.target.value)}
        className="border-black w-40"
      /> */}
      
      <Button variant='outline'onClick={handleBuscar} className=" text-black">
        Buscar
      </Button>
      
      <Button onClick={handleLimpar} variant="outline">
        Limpar
      </Button>
    </div>
  );
}