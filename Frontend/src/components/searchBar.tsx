import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { useFiltros } from "../hooks/useFiltros";
import { Filtros } from "../components/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { type DateRange } from "react-day-picker";
import { pt } from "date-fns/locale";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CheckIcon } from "lucide-react";

interface FiltrosBarProps {
  onAplicarFiltros?: (filtros: Filtros) => void;
}

export default function FiltrosBar({ onAplicarFiltros }: FiltrosBarProps) {
  const { filtros, limparFiltros } = useFiltros();

  const [  filtrosTemporarios, setFiltrosTemporarios] = useState<Filtros>(filtros);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [codigosOptions, setCodigosOptions] = useState<string[]>([]);
  const [numerosOptions, setNumerosOptions] = useState<string[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState<boolean>(false);

  // Inicializar dateRange baseado nos filtros existentes
  useEffect(() => {
    if (filtros.dataInicio && filtros.dataFim) {
      setDateRange({
        from: new Date(filtros.dataInicio),
        to: new Date(filtros.dataFim)
      });
    } else {
      setDateRange(undefined);
    }
  }, [filtros.dataInicio, filtros.dataFim]);

  // Fetch available filters
  useEffect(() => {
    let mounted = true;
    const fetchFiltros = async () => {
      setLoadingFiltros(true);
      try {
        const params = new URLSearchParams();
        if (filtrosTemporarios.dataInicio) params.set('dateStart', filtrosTemporarios.dataInicio);
        if (filtrosTemporarios.dataFim) params.set('dateEnd', filtrosTemporarios.dataFim);
        const url = `http://localhost:3000/api/filtrosAvaliable?${params.toString()}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Failed to fetch filtrosAvaliable');
        const body = await resp.json();

        if (!mounted) return;

        const cods = Array.isArray(body.codigos) ? body.codigos.map((c: any) => String(c)) : [];
        const nums = Array.isArray(body.numeros) ? body.numeros.map((n: any) => String(n)) : [];

        setCodigosOptions(cods);
        setNumerosOptions(nums);

        // Preserve existing filters regardless of availability
        setFiltrosTemporarios(prev => ({
          ...prev,
          codigo: prev.codigo || '',
          numero: prev.numero || ''
        }));
      } catch (err) {
        console.error('[FiltrosBar] erro ao buscar filtros disponíveis', err);
        setCodigosOptions([]);
        setNumerosOptions([]);
        setFiltrosTemporarios(prev => ({ ...prev, codigo: '', numero: '' }));
      } finally {
        if (mounted) setLoadingFiltros(false);
      }
    };

    fetchFiltros();
    return () => { mounted = false; };
  }, [filtrosTemporarios.dataInicio, filtrosTemporarios.dataFim]);

  const handleInputChange = (nome: keyof Filtros, valor: string) => {
    setFiltrosTemporarios(prev => ({ ...prev, [nome]: valor }));
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

    const novaDataInicio = format(date.from!, "yyyy-MM-dd");
    const novaDataFim = format(date.to!, "yyyy-MM-dd");

    setFiltrosTemporarios(prev => ({
      ...prev,
      dataInicio: novaDataInicio,
      dataFim: novaDataFim
    }));
  };

  const handleBuscar = () => {
    const filtrosParaAplicar = {
      ...filtrosTemporarios,
      nomeFormula: filtrosTemporarios.nomeFormula || undefined,
      codigo: filtrosTemporarios.codigo && filtrosTemporarios.codigo !== '__all' ? filtrosTemporarios.codigo : undefined,
      numero: filtrosTemporarios.numero && filtrosTemporarios.numero !== '__all' ? filtrosTemporarios.numero : undefined,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBuscar();
    }
  };

  // --- Combobox para Código ---
  const [openCodigo, setOpenCodigo] = useState(false);
  const filteredCodigos = useMemo(() => {
    return codigosOptions.filter(c =>
      c.toLowerCase().includes(filtrosTemporarios.codigo.toLowerCase())
    );
  }, [filtrosTemporarios.codigo, codigosOptions]);

  // --- Combobox para Número ---
  const [openNumero, setOpenNumero] = useState(false);
  const filteredNumeros = useMemo(() => {
    return numerosOptions.filter(n =>
      n.toLowerCase().includes(filtrosTemporarios.numero.toLowerCase())
    );
  }, [filtrosTemporarios.numero, numerosOptions]);

  return (
    <div className="flex flex-row items-end justify-end gap-1">
      {/* Nome da Fórmula - Input comum (ou pode virar combobox se quiser sugestões) */}
      <div className="relative w-50">
        <input
          type="text"
          placeholder="Digite o nome da fórmula"
          value={filtrosTemporarios.nomeFormula}
          onChange={(e) => handleInputChange('nomeFormula', e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBuscar}
          className="h-9 w-full rounded-md border border-black bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* DatePicker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-50 justify-between text-left font-normal border border-black",
              !dateRange && "text-gray-400"
            )}
          >
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yy")} -{" "}
                  {format(dateRange.to, "dd/MM/yy")}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              <span>Selecione a data</span>
            )}
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" onInteractOutside={handleBuscar}>
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
      
      {/* Combobox Código */}
      <Popover open={openCodigo} onOpenChange={setOpenCodigo}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCodigo}
            className="w-52 justify-between border-black font-normal text-gray-400 "
          >
            {filtrosTemporarios.codigo
              ? filtrosTemporarios.codigo === '__all'
                ? 'Todos'
                : filtrosTemporarios.codigo
              : loadingFiltros
              ? 'Carregando...'
              : 'Selecionar código do prog.'}
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0 thin-red-scrollbar" onInteractOutside={handleBuscar}>
          <Command>
            <CommandInput
              placeholder="Selecionar códg. do prog..."
              value={filtrosTemporarios.codigo === '__all' ? '' : filtrosTemporarios.codigo}
              onValueChange={(value) => {
                if (value === '') {
                  setFiltrosTemporarios(prev => ({ ...prev, codigo: '' }));
                } else {
                  setFiltrosTemporarios(prev => ({ ...prev, codigo: value }));
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={loadingFiltros}
            />
            <CommandList>
              <CommandEmpty>{loadingFiltros ? 'Carregando...' : 'Nenhum código encontrado.'}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="__all"
                  value="__all"
                  onSelect={() => {
                    setFiltrosTemporarios(prev => ({ ...prev, codigo: '__all' }));
                    setOpenCodigo(false);
                    handleBuscar();
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      filtrosTemporarios.codigo === '__all' ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Todos
                </CommandItem>
                {filteredCodigos.map((codigo) => (
                  <CommandItem
                    key={codigo}
                    value={codigo}
                    onSelect={(currentValue) => {
                      setFiltrosTemporarios(prev => ({
                        ...prev,
                        codigo: prev.codigo === currentValue ? '' : currentValue
                      }));
                      setOpenCodigo(false);
                       handleBuscar();
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        filtrosTemporarios.codigo === codigo ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {codigo}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Combobox Número */}
      <Popover open={openNumero} onOpenChange={setOpenNumero}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openNumero}
            className="w-52 justify-between border-black font-normal text-gray-400"
          >
            {filtrosTemporarios.numero
              ? filtrosTemporarios.numero === '__all'
                ? 'Todos'
                : String(filtrosTemporarios.numero).padStart(3, '0')
              : loadingFiltros
              ? 'Carregando...'
              : 'Selecionar códg. do cliente'}
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0 thin-red-scrollbar" onInteractOutside={handleBuscar}> 
          <Command>
            <CommandInput
              placeholder="Pesquisar número..."
              value={filtrosTemporarios.numero === '__all' ? '' : String(filtrosTemporarios.numero)}
              onValueChange={(value) => {
                if (value === '') {
                  setFiltrosTemporarios(prev => ({ ...prev, numero: '' }));
                } else {
                  setFiltrosTemporarios(prev => ({ ...prev, numero: value }));
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={loadingFiltros}
            />
            <CommandList>
              <CommandEmpty>{loadingFiltros ? 'Carregando...' : 'Nenhum número encontrado.'}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="__all"
                  value="__all"
                  onSelect={() => {
                    setFiltrosTemporarios(prev => ({ ...prev, numero: '__all' }));
                    setOpenNumero(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      filtrosTemporarios.numero === '__all' ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Todos
                </CommandItem>
                {filteredNumeros.map((numero) => (
                  <CommandItem
                    key={numero}
                    value={numero}
                    onSelect={(currentValue) => {
                      setFiltrosTemporarios(prev => ({
                        ...prev,
                        numero: prev.numero === currentValue ? '' : currentValue
                      }));
                      setOpenNumero(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        filtrosTemporarios.numero === numero ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {String(numero).padStart(3, '0')}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
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

// Ícone de seta para baixo (substitua se já tiver)
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}