import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
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

interface FiltrosAmendoim {
  dataInicio?: string;
  dataFim?: string;
  codigoProduto?: string;
  nomeProduto?: string;
}

interface FiltrosAmendoimBarProps {
  onAplicarFiltros?: (filtros: FiltrosAmendoim) => void;
}

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

export default function FiltrosAmendoimBar({ onAplicarFiltros }: FiltrosAmendoimBarProps) {
  const [filtrosTemporarios, setFiltrosTemporarios] = useState<FiltrosAmendoim>({
    dataInicio: '',
    dataFim: '',
    codigoProduto: '',
    nomeProduto: ''
  });
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [codigosOptions, setCodigosOptions] = useState<string[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState<boolean>(false);

  // Fetch available filters
  useEffect(() => {
    let mounted = true;
    const fetchFiltros = async () => {
      setLoadingFiltros(true);
      try {
        const params = new URLSearchParams();
        if (filtrosTemporarios.dataInicio) params.set('dataInicio', filtrosTemporarios.dataInicio);
        if (filtrosTemporarios.dataFim) params.set('dataFim', filtrosTemporarios.dataFim);
        const url = `http://localhost:3000/api/amendoim/filtrosDisponiveis?${params.toString()}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Failed to fetch filtros disponíveis');
        const body = await resp.json();

        if (!mounted) return;

        const cods = Array.isArray(body.codigosProduto) ? body.codigosProduto.map((c: any) => String(c)) : [];
        setCodigosOptions(cods);

        setFiltrosTemporarios(prev => ({
          ...prev,
          codigoProduto: prev.codigoProduto || ''
        }));
      } catch (err) {
        console.error('[FiltrosAmendoimBar] erro ao buscar filtros disponíveis', err);
        setCodigosOptions([]);
        setFiltrosTemporarios(prev => ({ ...prev, codigoProduto: '' }));
      } finally {
        if (mounted) setLoadingFiltros(false);
      }
    };

    fetchFiltros();
    return () => { mounted = false; };
  }, [filtrosTemporarios.dataInicio, filtrosTemporarios.dataFim]);

  const handleInputChange = (nome: keyof FiltrosAmendoim, valor: string) => {
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
      nomeProduto: filtrosTemporarios.nomeProduto || undefined,
      codigoProduto: filtrosTemporarios.codigoProduto && filtrosTemporarios.codigoProduto !== '__all' ? filtrosTemporarios.codigoProduto : undefined,
      dataInicio: filtrosTemporarios.dataInicio || undefined,
      dataFim: filtrosTemporarios.dataFim || undefined,
    };

    if (onAplicarFiltros) {
      onAplicarFiltros(filtrosParaAplicar);
    }
  };

  const handleLimpar = () => {
    const filtrosLimpos: FiltrosAmendoim = {
      dataInicio: '',
      dataFim: '',
      nomeProduto: '',
      codigoProduto: ''
    };

    setFiltrosTemporarios(filtrosLimpos);
    setDateRange(undefined);

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
      c.toLowerCase().includes((filtrosTemporarios.codigoProduto || '').toLowerCase())
    );
  }, [filtrosTemporarios.codigoProduto, codigosOptions]);

  return (
    <div className="flex flex-row items-end justify-end gap-1">
      {/* Nome do Produto - Input comum */}
      <div className="relative w-50">
        <input
          type="text"
          placeholder="Digite o nome do produto"
          value={filtrosTemporarios.nomeProduto}
          onChange={(e) => handleInputChange('nomeProduto', e.target.value)}
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

      {/* Combobox Código do Produto */}
      <Popover open={openCodigo} onOpenChange={setOpenCodigo}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCodigo}
            className="w-52 justify-between border-black font-normal text-gray-400"
          >
            {filtrosTemporarios.codigoProduto
              ? filtrosTemporarios.codigoProduto === '__all'
                ? 'Todos'
                : filtrosTemporarios.codigoProduto
              : loadingFiltros
              ? 'Carregando...'
              : 'Selecionar código produto'}
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0 thin-red-scrollbar" onInteractOutside={handleBuscar}>
          <Command>
            <CommandInput
              placeholder="Selecionar código..."
              value={filtrosTemporarios.codigoProduto === '__all' ? '' : filtrosTemporarios.codigoProduto}
              onValueChange={(value) => {
                if (value === '') {
                  setFiltrosTemporarios(prev => ({ ...prev, codigoProduto: '' }));
                } else {
                  setFiltrosTemporarios(prev => ({ ...prev, codigoProduto: value }));
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
                    setFiltrosTemporarios(prev => ({ ...prev, codigoProduto: '__all' }));
                    setOpenCodigo(false);
                    handleBuscar();
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      filtrosTemporarios.codigoProduto === '__all' ? "opacity-100" : "opacity-0"
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
                        codigoProduto: prev.codigoProduto === currentValue ? '' : currentValue
                      }));
                      setOpenCodigo(false);
                      handleBuscar();
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        filtrosTemporarios.codigoProduto === codigo ? "opacity-100" : "opacity-0"
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

      {/* Botões Buscar e Limpar */}
      <Button onClick={handleBuscar} variant="outline">
        Buscar
      </Button>
      <Button
        onClick={handleLimpar}
        variant="outline"
        className="border-black hover:bg-gray-100"
      >
        Limpar
      </Button>
    </div>
  );
}
