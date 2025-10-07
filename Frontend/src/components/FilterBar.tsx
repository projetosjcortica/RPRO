import { useState, useEffect } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "daterange";
  options?: string[];
  placeholder?: string;
  fetchOptions?: () => Promise<string[]>;
}

export interface FilterValues {
  [key: string]: string | undefined;
  dataInicio?: string;
  dataFim?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear?: () => void;
  autoApply?: boolean;
  autoApplyDelay?: number;
  className?: string;
}

export default function FilterBar({
  filters,
  values,
  onChange,
  onClear,
  autoApply = true,
  autoApplyDelay = 500,
  className = "",
}: FilterBarProps) {
  
  const [localValues, setLocalValues] = useState<FilterValues>(values);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalValues(values);
    if (values.dataInicio && values.dataFim) {
      setDateRange({
        from: new Date(values.dataInicio),
        to: new Date(values.dataFim),
      });
    }
  }, [values]);

  // Auto-apply with debounce
  useEffect(() => {
    if (!autoApply) return;

    const timer = setTimeout(() => {
      onChange(localValues);
    }, autoApplyDelay);

    return () => clearTimeout(timer);
  }, [localValues, autoApply, autoApplyDelay, onChange]);

  // Fetch options for select filters
  useEffect(() => {
    filters.forEach(async (filter) => {
      if (filter.type === "select" && filter.fetchOptions) {
        setLoading((prev) => ({ ...prev, [filter.key]: true }));
        try {
          const options = await filter.fetchOptions();
          setFilterOptions((prev) => ({ ...prev, [filter.key]: options }));
        } catch (err) {
          console.error(`Error fetching options for ${filter.key}:`, err);
          setFilterOptions((prev) => ({ ...prev, [filter.key]: [] }));
        } finally {
          setLoading((prev) => ({ ...prev, [filter.key]: false }));
        }
      } else if (filter.type === "select" && filter.options) {
        setFilterOptions((prev) => ({ ...prev, [filter.key]: filter.options || [] }));
      }
    });
  }, [filters]);

  const handleSelectChange = (key: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from) {
      setLocalValues((prev) => ({
        ...prev,
        dataInicio: undefined,
        dataFim: undefined,
      }));
      return;
    }

    // Permitir seleção de apenas um dia (from sem to)
    const dataInicio = format(range.from, "yyyy-MM-dd");
    const dataFim = range.to ? format(range.to, "yyyy-MM-dd") : format(range.from, "yyyy-MM-dd");

    setLocalValues((prev) => ({
      ...prev,
      dataInicio,
      dataFim,
    }));
  };

  const handleClear = () => {
    const clearedValues: FilterValues = {};
    filters.forEach((filter) => {
      clearedValues[filter.key] = undefined;
    });
    clearedValues.dataInicio = undefined;
    clearedValues.dataFim = undefined;

    setLocalValues(clearedValues);
    setDateRange(undefined);
    onChange(clearedValues);
    onClear?.();
  };

  const renderFilter = (filter: FilterConfig) => {
    if (filter.type === "select") {
      const options = filterOptions[filter.key] || filter.options || [];
      const isLoading = loading[filter.key];

      return (
        <div key={filter.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">{filter.label}</label>
          <Select
            value={localValues[filter.key] || "all"}
            onValueChange={(value) => handleSelectChange(filter.key, value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder={filter.placeholder || `Selecione ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (filter.type === "daterange") {
      return (
        <div key={filter.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-700">{filter.label}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 justify-start text-left font-normal text-sm",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Selecione o período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateChange}
                numberOfMonths={2}
                locale={pt}
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Grid responsivo para os filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filters.map((filter) => renderFilter(filter))}
      </div>

      {/* Botão de limpar (opcional) */}
      {onClear && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="w-full h-8 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
