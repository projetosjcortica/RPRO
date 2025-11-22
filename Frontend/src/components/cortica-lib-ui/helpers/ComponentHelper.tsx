import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Check, Copy, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';

interface ComponentHelperProps {
    componentName: string;
    usageCode: string;
    description?: string;
    propsInfo?: { name: string; type: string; description: string; default?: string }[];
}

/**
 * ComponentHelper
 * 
 * Um componente de ajuda que exibe snippets de código e documentação
 * para facilitar a reutilização de componentes.
 */
export const ComponentHelper = ({ componentName, usageCode, description, propsInfo }: ComponentHelperProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(usageCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                        <Code className="h-3 w-3" />
                        Como usar
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-primary" />
                            {componentName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {description && (
                            <p className="text-muted-foreground">{description}</p>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Exemplo de Uso</h4>
                                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8">
                                    {copied ? (
                                        <span className="flex items-center gap-1 text-green-600">
                                            <Check className="h-3 w-3" /> Copiado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <Copy className="h-3 w-3" /> Copiar
                                        </span>
                                    )}
                                </Button>
                            </div>
                            <div className="relative rounded-md bg-slate-950 p-4 overflow-x-auto">
                                <pre className="text-sm text-slate-50 font-mono">
                                    <code>{usageCode}</code>
                                </pre>
                            </div>
                        </div>

                        {propsInfo && propsInfo.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Propriedades (Props)</h4>
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground">
                                            <tr>
                                                <th className="p-2 font-medium">Nome</th>
                                                <th className="p-2 font-medium">Tipo</th>
                                                <th className="p-2 font-medium">Padrão</th>
                                                <th className="p-2 font-medium">Descrição</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {propsInfo.map((prop) => (
                                                <tr key={prop.name}>
                                                    <td className="p-2 font-mono text-xs text-primary">{prop.name}</td>
                                                    <td className="p-2 font-mono text-xs text-muted-foreground">{prop.type}</td>
                                                    <td className="p-2 font-mono text-xs">{prop.default || '-'}</td>
                                                    <td className="p-2 text-muted-foreground">{prop.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
