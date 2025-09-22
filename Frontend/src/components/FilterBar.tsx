import { useState } from 'react';
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { X } from "lucide-react";

interface FilterBarProps {
  categorias: string[];
  categoriaSelecionada: string;
  onCategoriaChange: (categoria: string) => void;
  onClear: () => void;
  total: number;
  filtrado: number;
}

export function FilterBar({
  categorias,
  categoriaSelecionada,
  onCategoriaChange,
  onClear,
  total,
  filtrado
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full mb-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Filtros</h3>
          
          {categoriaSelecionada && (
            <Badge variant="outline" className="bg-blue-50">
              Categoria: {categoriaSelecionada}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-blue-100"
                onClick={onClear}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Exibindo {filtrado} de {total} registros
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="categoria-filter" className="text-sm mb-1">
              Categoria de Produto
            </Label>
            <Select
              value={categoriaSelecionada}
              onValueChange={onCategoriaChange}
            >
              <SelectTrigger id="categoria-filter" className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Espaço para futuras opções de filtro */}
          <div className="col-span-2 flex justify-end items-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClear}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}