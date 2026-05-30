import { cn } from "@/lib/utils";
import { Fragment, ReactNode } from "react";

interface PageHeaderProps {
    title?: string;
    subtitle?: string;
    rightAction?: ReactNode;
    renderPageHeader?: ReactNode;
    className?:string;
   
  }
  
const   PageHeader = ({ title, subtitle, rightAction,renderPageHeader,className}: PageHeaderProps) => {
    return (
      <div className={cn("w-full pt-6 px-5 pb-20 lg:px-0 bg-[var(--secondary-dark-color)] dark:bg-[#121212] text-white",className)}>
        <div className="w-full max-w-[75rem]  mx-auto ">
          {renderPageHeader 
          ? <Fragment>{renderPageHeader}</Fragment> 
          : (
            <div className="w-full flex flex-col gap-3  items-start justify-start lg:items-center lg:flex-row lg:justify-between">
              {(title || subtitle) && (
                <div className="space-y-1">
                  {title && <h2 className="text-2xl lg:text-4xl font-medium">{title}</h2>}
                  {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
                </div>
              )}
              {rightAction && rightAction}
            </div>
          )}
        </div>
      </div>
    );
  };

  export default PageHeader