import { BaseService } from '../core/baseService';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service to convert legacy SQL dump files from DD/MM/YY date format
 * to ISO YYYY-MM-DD format for database compatibility.
 */
export class DumpConverterService extends BaseService {
  constructor() {
    super('DumpConverterService');
  }

  private log(message: string) {
    console.log(`[${this.name}]`, message);
  }

  private debug(message: string) {
    console.debug(`[${this.name}]`, message);
  }

  private error(message: string, error?: any) {
    console.error(`[${this.name}]`, message, error);
  }

  /**
   * Converts a date string from DD/MM/YY format to YYYY-MM-DD format.
   * @param dateStr - Date string in DD/MM/YY format (e.g., "30/05/25")
   * @returns Date string in YYYY-MM-DD format (e.g., "2025-05-30")
   */
  private convertDateFormat(dateStr: string): string {
    // Match DD/MM/YY pattern
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
    if (!match) return dateStr; // Return as-is if not matching

    const day = match[1];
    const month = match[2];
    const year = match[3];

    // Convert 2-digit year to 4-digit year
    // Assume 00-49 = 2000-2049, 50-99 = 1950-1999
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;

    return `${fullYear}-${month}-${day}`;
  }

  /**
   * Converts all date values in a SQL dump file from DD/MM/YY to YYYY-MM-DD.
   * Handles INSERT statements, UPDATE statements, and string literals.
   * Also handles partial dumps and various SQL formats.
   * 
   * @param dumpContent - Raw SQL dump content as string
   * @returns Converted SQL dump content with updated date formats
   */
  public convertDumpDates(dumpContent: string): string {
    this.log('Starting date conversion in SQL dump');

    let convertedContent = dumpContent;
    let conversionCount = 0;

    // Pattern to match dates in SQL string literals: '30/05/25' or "30/05/25"
    // This regex looks for quoted date strings in DD/MM/YY format
    const datePattern = /(['"])(\d{2}\/\d{2}\/\d{2})\1/g;

    convertedContent = convertedContent.replace(datePattern, (match, quote, dateStr) => {
      const converted = this.convertDateFormat(dateStr);
      if (converted !== dateStr) {
        conversionCount++;
        this.debug(`Converted: ${dateStr} → ${converted}`);
      }
      return `${quote}${converted}${quote}`;
    });

    this.log(`Date conversion complete. ${conversionCount} dates converted.`);
    return convertedContent;
  }

  /**
   * Validates and sanitizes SQL dump content
   * Removes potentially problematic statements and adds compatibility fixes
   * 
   * @param dumpContent - Raw SQL dump content
   * @returns Sanitized SQL content
   */
  public sanitizeDump(dumpContent: string): {
    sanitized: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let sanitized = dumpContent;

    // Remove DROP TABLE statements (keep existing schema)
    const dropTablePattern = /DROP TABLE.+?;/gi;
    if (dropTablePattern.test(sanitized)) {
      warnings.push('Removed DROP TABLE statements (preserving existing schema)');
      sanitized = sanitized.replace(dropTablePattern, '-- DROP TABLE removed\n');
    }

    // Make CREATE TABLE statements optional (IF NOT EXISTS)
    sanitized = sanitized.replace(
      /CREATE TABLE\s+(?!IF NOT EXISTS)(\w+)/gi,
      'CREATE TABLE IF NOT EXISTS $1'
    );

    // Remove foreign key constraints from CREATE TABLE (add them later if needed)
    const fkPattern = /,?\s*CONSTRAINT\s+`?\w+`?\s+FOREIGN KEY.+?\)/gi;
    if (fkPattern.test(sanitized)) {
      warnings.push('Simplified FOREIGN KEY constraints for compatibility');
      sanitized = sanitized.replace(fkPattern, '');
    }

    // Handle MySQL-specific syntax for SQLite compatibility
    sanitized = sanitized.replace(/ENGINE\s*=\s*\w+/gi, '');
    sanitized = sanitized.replace(/DEFAULT CHARSET\s*=\s*\w+/gi, '');
    sanitized = sanitized.replace(/AUTO_INCREMENT\s*=\s*\d+/gi, '');
    
    // Convert backticks to double quotes for SQLite
    sanitized = sanitized.replace(/`([^`]+)`/g, '"$1"');

    if (warnings.length > 0) {
      this.log(`Sanitization applied: ${warnings.join(', ')}`);
    }

    return { sanitized, warnings };
  }

  /**
   * Reads a SQL dump file, converts date formats, and saves to a new file.
   * 
   * @param inputPath - Path to the input SQL dump file
   * @param outputPath - Optional path for output file. If not provided, generates one.
   * @returns Object with paths and conversion stats
   */
  public async convertDumpFile(
    inputPath: string,
    outputPath?: string
  ): Promise<{
    inputPath: string;
    outputPath: string;
    originalSize: number;
    convertedSize: number;
  }> {
    try {
      this.log(`Reading dump file: ${inputPath}`);

      if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
      }

      // Read original dump
      const originalContent = fs.readFileSync(inputPath, 'utf-8');
      const originalSize = Buffer.byteLength(originalContent, 'utf-8');

      this.log(`Original file size: ${(originalSize / 1024).toFixed(2)} KB`);

      // Convert dates
      const convertedContent = this.convertDumpDates(originalContent);
      const convertedSize = Buffer.byteLength(convertedContent, 'utf-8');

      // Generate output path if not provided
      if (!outputPath) {
        const ext = path.extname(inputPath);
        const base = path.basename(inputPath, ext);
        const dir = path.dirname(inputPath);
        outputPath = path.join(dir, `${base}_converted${ext}`);
      }

      // Write converted dump
      fs.writeFileSync(outputPath, convertedContent, 'utf-8');
      this.log(`Converted dump saved to: ${outputPath}`);
      this.log(`Converted file size: ${(convertedSize / 1024).toFixed(2)} KB`);

      return {
        inputPath,
        outputPath,
        originalSize,
        convertedSize,
      };
    } catch (error) {
      this.error('Error converting dump file:', error);
      throw error;
    }
  }

  /**
   * Converts a SQL dump from a buffer (for multer uploads).
   * 
   * @param buffer - Buffer containing the SQL dump
   * @param originalFilename - Original filename for logging
   * @returns Object with converted content and stats
   */
  public convertDumpFromBuffer(
    buffer: Buffer,
    originalFilename: string
  ): {
    convertedContent: string;
    originalSize: number;
    convertedSize: number;
  } {
    try {
      this.log(`Converting uploaded dump: ${originalFilename}`);

      const originalContent = buffer.toString('utf-8');
      const originalSize = buffer.length;

      this.log(`Original size: ${(originalSize / 1024).toFixed(2)} KB`);

      const convertedContent = this.convertDumpDates(originalContent);
      const convertedSize = Buffer.byteLength(convertedContent, 'utf-8');

      this.log(`Converted size: ${(convertedSize / 1024).toFixed(2)} KB`);

      return {
        convertedContent,
        originalSize,
        convertedSize,
      };
    } catch (error) {
      this.error('Error converting dump from buffer:', error);
      throw error;
    }
  }

  /**
   * Validates if a SQL dump appears to contain legacy date format.
   * 
   * @param content - SQL dump content
   * @returns True if legacy dates detected, false otherwise
   */
  public hasLegacyDates(content: string): boolean {
    const legacyDatePattern = /(['"])(\d{2}\/\d{2}\/\d{2})\1/;
    return legacyDatePattern.test(content);
  }
}

export const dumpConverterService = new DumpConverterService();
