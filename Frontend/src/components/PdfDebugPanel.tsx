// import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';

interface PdfDebugPanelProps {
  onClose: () => void;
  cellPadding: number;
  cellPaddingTop: number;
  cellPaddingBottom: number;
  cellMinHeight: number;
  headerPadding: number;
  headerPaddingTop: number;
  tableFontSize: number;
  sectionMarginTop: number;
  sectionMarginBottom: number;
  sectionTitleMarginBottom: number;
  sectionTitlePadding: number;
  cellBorderWidth: number;
  rowGap: number;
  lineHeight: number;
  onCellPaddingChange: (value: number) => void;
  onCellPaddingTopChange: (value: number) => void;
  onCellPaddingBottomChange: (value: number) => void;
  onCellMinHeightChange: (value: number) => void;
  onHeaderPaddingChange: (value: number) => void;
  onHeaderPaddingTopChange: (value: number) => void;
  onTableFontSizeChange: (value: number) => void;
  onSectionMarginTopChange: (value: number) => void;
  onSectionMarginBottomChange: (value: number) => void;
  onSectionTitleMarginBottomChange: (value: number) => void;
  onSectionTitlePaddingChange: (value: number) => void;
  onCellBorderWidthChange: (value: number) => void;
  onRowGapChange: (value: number) => void;
  onLineHeightChange: (value: number) => void;
}

export function PdfDebugPanel({
  onClose,
  cellPadding,
  cellPaddingTop,
  cellPaddingBottom,
  cellMinHeight,
  headerPadding,
  headerPaddingTop,
  tableFontSize,
  sectionMarginTop,
  sectionMarginBottom,
  sectionTitleMarginBottom,
  sectionTitlePadding,
  cellBorderWidth,
  rowGap,
  lineHeight,
  onCellPaddingChange,
  onCellPaddingTopChange,
  onCellPaddingBottomChange,
  onCellMinHeightChange,
  onHeaderPaddingChange,
  onHeaderPaddingTopChange,
  onTableFontSizeChange,
  onSectionMarginTopChange,
  onSectionMarginBottomChange,
  onSectionTitleMarginBottomChange,
  onSectionTitlePaddingChange,
  onCellBorderWidthChange,
  onRowGapChange,
  onLineHeightChange,
}: PdfDebugPanelProps) {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl p-6 w-96 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
        <h3 className="text-lg font-bold text-gray-900">PDF Debug Panel</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4 border-b pb-4">
          <h4 className="font-semibold text-sm text-gray-700">Cell Spacing</h4>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Cell Horizontal Padding: {cellPadding}px
            </Label>
            <Slider
              value={[cellPadding]}
              onValueChange={(val) => onCellPaddingChange(val[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Cell Padding Top: {cellPaddingTop}px
            </Label>
            <Slider
              value={[cellPaddingTop]}
              onValueChange={(val) => onCellPaddingTopChange(val[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Cell Padding Bottom: {cellPaddingBottom}px
            </Label>
            <Slider
              value={[cellPaddingBottom]}
              onValueChange={(val) => onCellPaddingBottomChange(val[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Cell Min Height: {cellMinHeight}px
            </Label>
            <Slider
              value={[cellMinHeight]}
              onValueChange={(val) => onCellMinHeightChange(val[0])}
              min={0}
              max={40}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4 border-b pb-4">
          <h4 className="font-semibold text-sm text-gray-700">Borders & Spacing</h4>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Cell Border Width: {cellBorderWidth}px
            </Label>
            <Slider
              value={[cellBorderWidth]}
              onValueChange={(val) => onCellBorderWidthChange(val[0])}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Row Gap: {rowGap}px
            </Label>
            <Slider
              value={[rowGap]}
              onValueChange={(val) => onRowGapChange(val[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Line Height: {lineHeight}
            </Label>
            <Slider
              value={[lineHeight]}
              onValueChange={(val) => onLineHeightChange(val[0])}
              min={0.5}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4 border-b pb-4">
          <h4 className="font-semibold text-sm text-gray-700">Header</h4>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Header Padding: {headerPadding}px
            </Label>
            <Slider
              value={[headerPadding]}
              onValueChange={(val) => onHeaderPaddingChange(val[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Header Padding Top: {headerPaddingTop}px
            </Label>
            <Slider
              value={[headerPaddingTop]}
              onValueChange={(val) => onHeaderPaddingTopChange(val[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4 border-b pb-4">
          <h4 className="font-semibold text-sm text-gray-700">Typography</h4>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Table Font Size: {tableFontSize}px
            </Label>
            <Slider
              value={[tableFontSize]}
              onValueChange={(val) => onTableFontSizeChange(val[0])}
              min={5}
              max={14}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4 border-b pb-4">
          <h4 className="font-semibold text-sm text-gray-700">Section Spacing</h4>
          
          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Section Margin Top: {sectionMarginTop}px
            </Label>
            <Slider
              value={[sectionMarginTop]}
              onValueChange={(val) => onSectionMarginTopChange(val[0])}
              min={0}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Section Margin Bottom: {sectionMarginBottom}px
            </Label>
            <Slider
              value={[sectionMarginBottom]}
              onValueChange={(val) => onSectionMarginBottomChange(val[0])}
              min={0}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Section Title Margin Bottom: {sectionTitleMarginBottom}px
            </Label>
            <Slider
              value={[sectionTitleMarginBottom]}
              onValueChange={(val) => onSectionTitleMarginBottomChange(val[0])}
              min={0}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">
              Section Title Padding: {sectionTitlePadding}px
            </Label>
            <Slider
              value={[sectionTitlePadding]}
              onValueChange={(val) => onSectionTitlePaddingChange(val[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => {
              onCellPaddingChange(1);
              onCellPaddingTopChange(3);
              onCellPaddingBottomChange(3);
              onCellMinHeightChange(0);
              onHeaderPaddingChange(1);
              onHeaderPaddingTopChange(0);
              onTableFontSizeChange(7);
              onSectionMarginTopChange(8);
              onSectionMarginBottomChange(8);
              onSectionTitleMarginBottomChange(8);
              onSectionTitlePaddingChange(4);
              onCellBorderWidthChange(0.7);
              onRowGapChange(0);
              onLineHeightChange(1);
            }}
            variant="outline"
            className="w-full"
          >
            Reset to Default
          </Button>
        </div>
      </div>
    </div>
  );
}
