import { PlusIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { format } from "date-fns";

interface WorkOrderResponse {
  "Calculated Total": number;
  "Vehicle Identifier": string;
  "Mileage": string;
  "Service Date": string;
  "Tax": number;
  "Work Order Number": string;
  "Total Cost": number;
  "Calculated Parts Total": number;
  "Parts Cost": number;
  "n_line_items": number;
  "Service Line Items": Array<{
    quantity: number;
    parts_labor_or_other: string;
    markup: string;
    calculated_line_total: number;
    description: string;
    unit_cost: number;
    line_total: number;
    technician_name: string;
  }>;
  "Labour Cost": string;
  "Calculated Labor Total": number;
}

export const Page = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<WorkOrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Data for the page content
  const pageData = {
    title: "Try Our Free Work Order Scanner",
    subtitle: "AI-Powered Vehicle Work Order Management",
    description:
      "Drag and drop printed work orders from your fleet or vendors into a consolidated digital format in 30 sec.",
    uploadSection: {
      title: "Add files",
      instruction: "Drag and drop or choose a work order file here",
      fileFormats: "(jpg, png, pdf, svg.)",
    },
    tryNow: "Try now",
  };

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setUploadedFile(file);

      // Create URL for document preview
      const previewUrl = URL.createObjectURL(file);
      setDocumentPreview(previewUrl);
  
      const response = await fetch(
        "https://t2n77it2xgochvjpemrn3lqpm40bkrpp.lambda-url.us-east-2.on.aws/",
        {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "X-File-Name": file.name
          },
          body: file
        }
      );
  
      if (!response.ok) {
        throw new Error("Upload and processing failed.");
      }
  
      const result = await response.json();
      console.log("Lambda response:", result);
  
      if (result.status === "success") {
        setResponse(result.remote_response);
        setIsDialogOpen(true);
      } else {
        throw new Error("Unexpected response format");
      }
  
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      console.error("File upload error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Cleanup preview URL when dialog closes
  const handleDialogClose = (open: boolean) => {
    if (!open && documentPreview) {
      URL.revokeObjectURL(documentPreview);
      setDocumentPreview(null);
      setUploadedFile(null);
    }
    setIsDialogOpen(open);
  };

  const renderDocumentPreview = () => {
    if (!documentPreview || !uploadedFile) return null;

    if (uploadedFile.type === 'application/pdf') {
      return (
        <iframe
          src={documentPreview}
          className="w-full h-[800px] border-0"
          title="Document Preview"
        />
      );
    }

    return (
      <img 
        src={documentPreview} 
        alt="Uploaded document"
        className="w-full h-auto object-contain max-h-[800px]"
      />
    );
  };

  return (
    <main className="w-full max-w-[1024px] min-h-[548px] bg-white mx-auto">
      <section className="min-h-[548px] relative">
        <div className="flex flex-col h-full">
          <div className="flex">
            {/* Left content section */}
            <div className="flex-1 pt-[145px] pl-[39px] pr-4">
              <p className="text-[#4e75b9] text-[16.8px] font-normal font-['Titillium_Web',Helvetica] leading-[16.8px]">
                {pageData.subtitle}
              </p>

              <h1 className="mt-[32px] text-[40.5px] font-bold font-['Titillium_Web',Helvetica] leading-[56.2px] text-black">
                {pageData.title}
              </h1>

              <p className="mt-[25px] text-[16.8px] font-normal font-['Titillium_Web',Helvetica] leading-[23.2px] text-black max-w-[471px]">
                {pageData.description}
              </p>
            </div>

            {/* Right upload section */}
            <div className="flex-1 relative">
              {/* Background images */}
              <img
                className="absolute w-[534px] h-[362px] top-[81px] left-[460px] -translate-x-full"
                alt="Clip path group"
                src="/clip-path-group.png"
              />
              <img
                className="absolute w-[534px] h-[363px] top-[81px] left-[460px] -translate-x-full"
                alt="Clip path group"
                src="/clip-path-group-1.png"
              />
              <img
                className="absolute w-[486px] h-[316px] top-[105px] left-[483px] -translate-x-full"
                alt="Clip path group"
                src="/clip-path-group-2.png"
              />

              {/* Upload card */}
              <Card 
                className="absolute top-[105px] left-0 right-0 mx-auto w-[486px] h-[316px] border-0 flex flex-col items-center justify-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <CardContent className="flex flex-col items-center justify-center w-full h-full pt-0 text-center">
                  <input
                    type="file"
                    accept=".jpg,.png,.pdf,.svg"
                    className="hidden"
                    onChange={handleFileInput}
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-[63px] h-[63px] bg-[#4e75b9] rounded-full flex items-center justify-center">
                        <PlusIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <h2 className="text-[24.3px] font-bold font-['Titillium_Web',Helvetica] leading-[24.3px] text-black mb-[12px]">
                      {pageData.uploadSection.title}
                    </h2>

                    <p className="text-[19.9px] font-normal font-['Titillium_Web',Helvetica] leading-[19.9px] text-black text-center">
                      <span className="font-bold">Drag and drop </span>
                      <span>or choose a </span>
                      <span className="font-bold">work order file here</span>
                    </p>

                    <p className="text-[12.4px] font-normal font-['Titillium_Web',Helvetica] leading-[12.4px] text-black mt-[30px]">
                      {pageData.uploadSection.fileFormats}
                    </p>
                  </label>
                </CardContent>
              </Card>

              {/* Try now text */}
              <p className="absolute top-12 right-[48px] text-xl font-normal font-['Architects_Daughter',Helvetica] leading-5 text-black">
                {pageData.tryNow}
              </p>
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="mt-8 p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Processing your document...</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Response Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Work Order Details</DialogTitle>
              </DialogHeader>
              
              {response && documentPreview && (
                <div className="mt-4 grid grid-cols-2 gap-8">
                  {/* Document Preview */}
                  <div className="border rounded-lg overflow-hidden bg-white">
                    {renderDocumentPreview()}
                  </div>

                  {/* Extracted Data */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h3 className="text-xl font-bold mb-4">Order Information</h3>
                        <div className="space-y-2">
                          <p><span className="font-semibold">Work Order #:</span> {response["Work Order Number"]}</p>
                          <p><span className="font-semibold">Service Date:</span> {response["Service Date"]}</p>
                          <p><span className="font-semibold">Vehicle ID:</span> {response["Vehicle Identifier"]}</p>
                          <p><span className="font-semibold">Mileage:</span> {response["Mileage"]}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-4">Cost Summary</h3>
                        <div className="space-y-2">
                          <p><span className="font-semibold">Parts Cost:</span> {formatCurrency(response["Parts Cost"])}</p>
                          <p><span className="font-semibold">Labor Cost:</span> {response["Labour Cost"]}</p>
                          <p><span className="font-semibold">Tax:</span> {formatCurrency(response["Tax"])}</p>
                          <p className="text-lg font-bold mt-4">
                            <span>Total Cost:</span> {formatCurrency(response["Total Cost"])}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold mb-4">Service Line Items</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {response["Service Line Items"].map((item, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap">{item.description}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.unit_cost)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(item.line_total)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </main>
  );
};