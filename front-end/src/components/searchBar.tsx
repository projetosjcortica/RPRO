import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useFiltros } from "../hooks/useFiltros";
import { Filtros } from "../components/types";
import { Popover, PopoverContent,PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "../components/ui/calendar"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { type DateRange } from "react-day-picker"


interface FiltrosBarProps {
  onAplicarFiltros?: (filtros: Filtros) => void;
}


export default function FiltrosBar({ onAplicarFiltros }: FiltrosBarProps) {
  const { filtros, handleFiltroChange, limparFiltros } = useFiltros();
  const [filtrosTemporarios, setFiltrosTemporarios] = useState<Filtros>(filtros);

  
  // Teste de botão
  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   event.preventDefault();
  //   console.log('Button clicked!');
  // };


  // Atualiza os filtros temporários quando os inputs mudam
  const handleInputChange = (nome: keyof Filtros, valor: string) => {
    setFiltrosTemporarios(prev => ({
      ...prev,
      [nome]: valor
    }));
  };

  // Aplica os filtros
  const handleBuscar = () => {
  Object.entries(filtrosTemporarios).forEach(([key, value]) => {
    handleFiltroChange(key as keyof Filtros, value);
  });

  console.log("Aplicando filtros:", filtrosTemporarios); // ← log adicionado
  if (onAplicarFiltros) onAplicarFiltros(filtrosTemporarios);
};

  // Limpa todos os filtros
  const handleLimpar = () => {
    const filtrosLimpos = {
      dataInicio: '',
      dataFim: '',
      nomeFormula: ''
    };
    
    setFiltrosTemporarios(filtrosLimpos);
    limparFiltros();
    
    if (onAplicarFiltros) {
      onAplicarFiltros(filtrosLimpos);
    }
  };

  return (
    <div className="flex flex-row items-end justify-end gap-2">
      <Input 
        type="text" 
        placeholder="Filtrar por nome..."
        value={filtrosTemporarios.nomeFormula}
        onChange={(e) => handleInputChange('nomeFormula', e.target.value)}
        className="border-black w-48"
      />
      
      <DateRangePicker/>
      
      <Input 
        type="date" 
        placeholder="Data fim"
        value={filtrosTemporarios.dataFim}
        onChange={(e) => handleInputChange('dataFim', e.target.value)}
        className="border-black w-40"
      />
      
      <Button variant='outline'onClick={handleBuscar} className=" text-black">
        Buscar
      </Button>
      
      <Button onClick={handleLimpar} variant="outline">
        Limpar
      </Button>
    </div>
  );
}

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -20),
    to: new Date(),
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal border border-black",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "d/m/y")} -{" "}
                  {format(date.to, "d/m/y")}
                </>
              ) : (
                format(date.from, "d/m/y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 h-30" >
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}