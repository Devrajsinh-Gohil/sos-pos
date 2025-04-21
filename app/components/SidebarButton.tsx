import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import DocumentationSidebar from "./DocumentationSidebar";

export default function SidebarButton() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg z-50 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-400 dark:border-blue-800 transition-colors"
        onClick={() => setIsOpen(true)}
        title="Integration Documentation"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
      
      <DocumentationSidebar 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
} 