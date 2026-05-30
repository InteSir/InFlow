import { useEffect, useState } from "react";

import { ImportIcon } from "lucide-react";
import FileUploadStep from "./fileupload-step";
import ColumnMappingStep from "./column-mapping-step";
import { CsvColumn, TransactionField } from "@/@types/transaction.type";
import ConfirmationStep from "./confirmation-step";
import { XIcon } from "lucide-react"

// const ImportTransactionModal = () => {
//   const [step, setStep] = useState<1 | 2 | 3>(1);
//   const [file, setFile] = useState<File | null>(null);
//   const [csvColumns, setCsvColumns] = useState<CsvColumn[]>([]);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const [csvData, setCsvData] = useState<any[]>([]); 
//   const [mappings, setMappings] = useState<Record<string, string>>({});
//   const [open, setOpen] = useState(false);

//   const transactionFields: TransactionField[] = [
//     { fieldName: 'title', required: true },
//     { fieldName: 'amount', required: true },
//     { fieldName: 'type', required: true },
//     { fieldName: 'date', required: true },
//     { fieldName: 'category', required: true },
//     { fieldName: 'paymentMethod', required: true },
//     { fieldName: 'description', required: false },
//   ];

//   // console.log(transactionFields, file, csvColumns, csvData, mappings);


//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const handleFileUpload = (file: File, columns: CsvColumn[], data: any[]) => {
//       setFile(file);
//       setCsvColumns(columns);
//       setCsvData(data);
//       setMappings({});
//       setStep(2);
//     };

//   const resetImport = () => {
//       setFile(null);
//       setCsvColumns([]);
//       setMappings({});
//       setStep(1);
//     };
    
//   const handleClose = () => {
//     setOpen(false);
//     setTimeout(() => resetImport(), 300);
//   };

//     const handleMappingComplete = (mappings: Record<string, string>) => {
//       setMappings(mappings);
//       setStep(3);
//     };
  
//     const handleBack = (step: 1 | 2 | 3 ) => {
//       setStep(step);
//     };



//   const renderStep = () => {
//     switch(step) {
//       case 1:
//         return <FileUploadStep onFileUpload={handleFileUpload} />;
//       case 2:
//         return (
//           <ColumnMappingStep
//             csvColumns={csvColumns}
//             mappings={mappings}
//             transactionFields={transactionFields}
//             onComplete={handleMappingComplete}
//             onBack={() => handleBack(1)}
//           />
//         );
//       case 3:
//         return (
//           <ConfirmationStep
//             file={file}
//             mappings={mappings}
//             csvData={csvData}
//             onBack={() => handleBack(2)}
//             onComplete={() => handleClose()}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//     <Button
//       variant="outline"
//       className="!shadow-none !cursor-pointer !border-gray-500
//        !text-white !bg-transparent"
//       onClick={() => setOpen(true)}
//     >
//       <ImportIcon className="!w-5 !h-5" />
//       Bulk Import
//     </Button>
//   <DialogContent className="max-w-2xl min-h-[40vh]">
//     {renderStep()}
//   </DialogContent>
// </Dialog>
//   );
// };

const ImportTransactionModal = () => {
  const [step,setStep] = useState(1); //which screen are we on 1 or 2 por 3
  const [file,setFile] = useState<File | null>(null); //the actual File object the user Clicked
  const [csvColumns,setCsvColumns] = useState<CsvColumn[]>([]); // The column names from the CSV header row, e.g. ["Date", "Amount", "Note"]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [csvData,setCsvData] = useState<any[]>([]);// Every row of data from the CSV as an array of objects
  

  // Which CSV column maps to which app field:
  // e.g. { "Date": "date", "Amt": "amount", "Note": "description" }
  const [mappings,setMappings] = useState<Record<string,string>>({}); 

  const [open,setOpen] = useState(false);//is the dialog open?

   // These are the fields our app needs for a transaction
   const transactionFields: TransactionField[] = [
    { fieldName: 'title', required: true },
    { fieldName: 'amount', required: true },
    { fieldName: 'type', required: true },
    { fieldName: 'date', required: true },
    { fieldName: 'category', required: true },
    { fieldName: 'paymentMethod', required: true },
    { fieldName: 'description', required: false },
  ];

  // Step 1 done: save file info, go to step 2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileUpload = (file:File,columns:CsvColumn[],data:any[]) =>{
    setFile(file);
    setCsvColumns(columns);
    setCsvData(data);
    setMappings({}); //reset any old mappings
    setStep(2);
  }


  // Step 2 done: save mappings, go to step 3
  const handleMappingComplete = (mappings:Record<string,string>) => {
    setMappings(mappings);
    setStep(3);
  };

  // Go back to any specific step
  const handleBack = (step:1|2|3) => setStep(step);

  // Wipe everything and close
  const resetImport = () => {
    setFile(null);
    setCsvColumns([]);
    setMappings({});
    setStep(1);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => resetImport(), 300); // wait for fade-out animation
  };

  const renderStep = () => {
    switch(step){
      case 1:
        return <FileUploadStep onFileUpload={handleFileUpload} />;

      case 2:
        return (
          <ColumnMappingStep
              csvColumns={csvColumns}
              mappings={mappings}
              transactionFields={transactionFields}
              onComplete={handleMappingComplete}
              onBack={()=>handleBack(1)}
          />
        );
      case 3:
        return (
          <ConfirmationStep
              file={file}
              mappings={mappings}
              csvData={csvData}
              onBack={()=>handleBack(2)}
              onComplete={handleClose} 
          />
        );

    }
  };

  useEffect(() => {
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  // cleanup when component unmounts
  return () => {
    document.body.style.overflow = "";
  };
}, [open]);

  return(
    <>
      <button onClick={()=>setOpen(true)} className="border px-3 py-2 flex items-center gap-2 rounded-lg cursor-pointer">  <ImportIcon className="!w-5 !h-5" /> Bulk Import</button>


      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 ">
          <div className="bg-white dark:bg-[var(--secondary-dark-color)] w-full max-w-2xl mx-4 p-6 rounded-xl
                     max-h-[90vh] overflow-y-auto relative">
            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none">  <XIcon /></button>
            {renderStep()}
          </div>
        </div>
      )}

    </>

  )








  

}



export default ImportTransactionModal;
