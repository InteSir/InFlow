import { useState } from "react";
import { Menu } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import { cn } from "@/lib/utils";
import Logo from "../logo/logo";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import { UserNav } from "./user-nav";
import LogoutDialog from "./logout-dialog";
import { useTypedSelector } from "@/app/hook";

const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useTypedSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const routes = [
    {
      href: PROTECTED_ROUTES.OVERVIEW,
      label: "Overview",
    },
    {
      href: PROTECTED_ROUTES.TRANSACTIONS,
      label: "Transactions",
    },
    {
      href: PROTECTED_ROUTES.REPORTS,
      label: "Reports",
    },
    {
      href: PROTECTED_ROUTES.SETTINGS,
      label: "Settings",
    },
  ];

  return (
    <>
      <header
        className={cn(
          "w-full px-3 pb-3 lg:px-9 py-4 bg-[var(--secondary-dark-color)] text-white dark:bg-[#121212] dark:border-b-2  mx-auto",
          pathname === PROTECTED_ROUTES.OVERVIEW && "!pb-3"
        )}
      >
        <div className="w-full flex h-14 max-w-[77rem] items-center mx-auto">
          <div className="w-full flex justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center gap-4 justify-start">
              <Button
                variant="ghost"
                size="icon"
                className="inline-flex md:hidden !cursor-pointer
               !bg-white/10 !text-white hover:bg-white/10"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>

              <Logo />
            </div>

            {/* Navigation*/}
            <nav className="hidden md:flex justify-center gap-x-2 md:w-[100px]">
              {routes?.map((route) => (
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    `w-full lg:w-auto font-normal py-4.5
                     hover:text-white border-none
                     text-white/50 focus:bg-white/30
                     transtion !bg-transparent!text-[13px] lg:text-[14.5px]
                     flex-shrink-1 
                     `,
                    pathname === route.href && "text-white"
                  )}
                  asChild
                >
                  <NavLink key={route.href} to={route.href}>
                    {route.label}
                  </NavLink>
                </Button>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetContent side="left" className="bg-white dark:bg-card ">
                <nav className="flex flex-col gap-y-2 pt-9">
                  {routes?.map((route) => (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        `w-full font-normal py-4.5
                       hover:bg-white/10 hover:text-black border-none
                       text-black/70 focus:bg-white/30 dark:text-white
                       transtion !bg-transparent justify-start`,
                        pathname === route.href && "!bg-black/10 text-black"
                      )}
                      asChild
                    >
                      <NavLink key={route.href} to={route.href} onClick={()=>setIsOpen(false)}>
                        {route.label}
                      </NavLink>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* {} */}
            {/* Right side - User actions */}
            <div className="flex items-center space-x-4 justify-end">
              <UserNav
                userName={user?.name || ""}
                profilePicture={user?.profilePicture || ""}
                onLogout={() => setIsLogoutDialogOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      <LogoutDialog
        isOpen={isLogoutDialogOpen}
        setIsOpen={setIsLogoutDialogOpen}
      />
    </>
  );
};

export default Navbar;
