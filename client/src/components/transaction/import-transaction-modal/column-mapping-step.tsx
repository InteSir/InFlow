import { useMemo, useState } from "react";

import {  FileSpreadsheet, HelpCircle } from "lucide-react";

import { CsvColumn, TransactionField } from "@/@types/transaction.type";


type ColumnMappingStepProps = {
    csvColumns: CsvColumn[];
    transactionFields: TransactionField[];
    mappings: Record<string, string>;
    onComplete: (mappings: Record<string, string>) => void;
    onBack: () => void;
  };
  

const ColumnMappingStep = ({
  csvColumns,        // e.g. [{ id: "Amt", name: "Amt", sampleData: "50" }]
  transactionFields, // e.g. [{ fieldName: "amount", required: true }]
  mappings: initialMappings,
  onComplete,
  onBack,
}:ColumnMappingStepProps) => {
  // Local state for the current mapping selections
  // Shape: { "Amt": "amount", "Date": "date", "Note": "Skip" }
  const [mappings, setMappings] = useState<Record<string, string>>(initialMappings || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // The dropdown options include "Skip" + all transaction fields
  // useMemo means this array is only recalculated when transactionFields changes
  const availableAttributes = useMemo(() => [
    { fieldName: "Skip" },...transactionFields,], [transactionFields]);

  const handleMappingChange = (csvColumn:string, field:string) => {
    setMappings((prev) => ({
      ...prev,
      [csvColumn]: field,
    }));
    // Clear any error for this column
    if (errors[csvColumn]) {
      const newErrors = { ...errors };
      delete newErrors[csvColumn];
      setErrors(newErrors);
    }
  };

  const validateMappings = () => {
    const newErrors: Record<string, string> = {};
    const usedFields = new Set<string>();

    Object.entries(mappings).forEach(([csvColumn, field]) => {
      if (field !== "Skip" && usedFields.has(field)){newErrors[csvColumn] = "Field already mapped"}; // Skip is always allowed
      if (field !== "Skip") usedFields.add(field);
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Remove "Skip" entries from final mappings
      const finalMappings = Object.fromEntries(
        Object.entries(mappings).filter(([, field]) => field !== "Skip")
      );
      onComplete(finalMappings); // move to step 3
    }
  };

  // "Continue" button is disabled until all required fields are mapped
  const hasRequiredMappings = transactionFields.every(
    (field) => !field.required || Object.values(mappings).includes(field.fieldName)
  );

  const validMappingsCount = Object.values(mappings).filter(
    (f) => f !== "Skip"
  ).length;

 

  return (
    <div className="space-y-6 ">
      <div>
        <h2 className="text-xl font-semibold text-gray-600 dark:text-white/80">Map CSV Columns</h2>
        <p className="text-sm text-gray-500 mt-1 dark:text-white/60">
          Match your CSV columns to our transaction fields
        </p>
      </div>

      <div className="border rounded-lg overflow-y-auto">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50  dark:bg-[#C6FF34]/80 dark:text-black">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-black ">CSV Column</th>
              <th className="text-left px-4 py-3 font-medium text-black ">Transaction Field</th>
            </tr>
          </thead>
          <tbody>
            {csvColumns.map((column) => (
              <tr
                key={column.id}
                className={column.hasError ? "bg-red-50 border-t" : "border-t"}
              >
                {/* CSV Column */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                    <span className="text-gray-600 ml-2 text-s font-medium dark:text-white/70">{column.name}</span>
                  </div>
                </td>

                {/* Mapping */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-gray-400 dark:text-white/60" />

                    <div className="w-52">
                      <select
                        className=" w-full rounded px-4 py-1 text-gray-600 dark:text-white/70"
                        value={mappings[column.name] || ""}
                        onChange={(e) =>
                          handleMappingChange(column.name, e.target.value)
                        }
                      >
                        <option value="">Select a field</option>

                        {availableAttributes.map((attr) => {
                          const isDisabled =
                            attr.fieldName !== "Skip" &&
                            attr.fieldName !== mappings[column.name] &&
                            Object.values(mappings).includes(attr.fieldName);

                          return (
                            <option
                              key={attr.fieldName}
                              value={attr.fieldName}
                              disabled={isDisabled}
                            className="text-gray-500 dark:bg-gray-700 dark:text-white/60">
                              {attr.fieldName}
                              
                            </option>
                          );
                        })}
                      </select>

                      {errors[column.name] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[column.name]}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded hover:bg-gray-50 text-black dark:text-white/80 dark:hover:text-black"
        >
          ← Back
        </button>
        <button
          onClick={validateMappings}
          disabled={!hasRequiredMappings || Object.keys(errors).length > 0}
          className="px-4 py-2 bg-blue-600 text-white rounded
                     hover:bg-blue-700 disabled:opacity-50"
        >
          Continue ({validMappingsCount}/{transactionFields.length}) →
        </button>
      </div>
    </div>
  );
};
export default ColumnMappingStep