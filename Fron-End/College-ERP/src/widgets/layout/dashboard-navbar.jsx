import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  BellIcon,
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { useState } from "react";
import ProfileMenu from "../Profile/ProfileMenu";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const userRole = localStorage.getItem("userRole");

  const pathnames = pathname
    .split("/")
    .filter((el) => el !== "" && el !== userRole);

  return (
    <Navbar
      fullWidth
      blurred={true}
      className="sticky top-4 z-40 mx-4 mt-4 rounded-2xl 
      bg-gradient-to-r from-white/80 via-blue-50/70 to-white/80
      backdrop-blur-xl border border-white/40 
      shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-3">

        {/* LEFT SIDE */}
        <div className="capitalize">
          <Breadcrumbs className="bg-transparent p-0">
            {pathnames.map((name, index) => {
              const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
              const isLast = index === pathnames.length - 1;

              return isLast ? (
                <Typography
                  key={name}
                  variant="small"
                  className="font-semibold text-blue-600 tracking-wide"
                >
                  {name}
                </Typography>
              ) : (
                <Link key={name} to={routeTo}>
                  <Typography
                    variant="small"
                    className="text-gray-500 hover:text-blue-500 hover:scale-105 transition-all duration-200"
                  >
                    {name}
                  </Typography>
                </Link>
              );
            })}
          </Breadcrumbs>

          <Typography
            variant="h5"
            className="font-bold text-gray-800 mt-1 tracking-wide"
          >
            {pathnames[pathnames.length - 1]}
          </Typography>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* SEARCH */}
          <div className="hidden md:block w-64">
            <Input
              label="Search..."
              className="bg-white/70 backdrop-blur-md shadow-sm 
              focus:shadow-md transition-all"
              icon={<span className="text-gray-400">🔍</span>}
            />
          </div>

          {/* SIDENAV */}
          <IconButton
            variant="text"
            className="xl:hidden hover:bg-blue-100 transition rounded-full"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon className="h-6 w-6 text-gray-700 hover:text-blue-600 transition" />
          </IconButton>

          {/* PROFILE ICON */}
          <IconButton
            variant="text"
            className="xl:hidden hover:bg-blue-100 rounded-full transition"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <UserCircleIcon className="h-6 w-6 text-gray-700 hover:text-blue-600 transition" />
          </IconButton>

          <ProfileMenu openMenu={openMenu} setOpenMenu={setOpenMenu} />

          {/* NOTIFICATIONS */}
          <Menu>
            <MenuHandler>
              <IconButton
                variant="text"
                className="relative hover:bg-blue-100 rounded-full transition"
              >
                <BellIcon className="h-6 w-6 text-gray-700 hover:text-blue-600 transition" />
              </IconButton>
            </MenuHandler>

            <MenuList className="w-80 rounded-2xl shadow-2xl border border-gray-100 bg-white/90 backdrop-blur-lg">

              <MenuItem className="flex items-center gap-3 hover:bg-blue-50 rounded-xl transition">
                <Avatar
                  src="https://i.pravatar.cc/40"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography variant="small">
                    <strong>New message</strong>
                  </Typography>
                  <Typography className="text-xs opacity-60 flex gap-1 items-center">
                    <ClockIcon className="h-3 w-3" /> 10 min ago
                  </Typography>
                </div>
              </MenuItem>

              <MenuItem className="flex items-center gap-3 hover:bg-blue-50 rounded-xl transition">
                <Avatar
                  src="https://i.pravatar.cc/41"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography variant="small">
                    <strong>New submission</strong>
                  </Typography>
                  <Typography className="text-xs opacity-60 flex gap-1 items-center">
                    <ClockIcon className="h-3 w-3" /> 1 hour ago
                  </Typography>
                </div>
              </MenuItem>

              <MenuItem className="flex items-center gap-3 hover:bg-blue-50 rounded-xl transition">
                <div className="h-9 w-9 grid place-items-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
                  <CreditCardIcon className="h-4 w-4" />
                </div>
                <div>
                  <Typography variant="small">
                    Payment completed
                  </Typography>
                  <Typography className="text-xs opacity-60 flex gap-1 items-center">
                    <ClockIcon className="h-3 w-3" /> 2 days ago
                  </Typography>
                </div>
              </MenuItem>

            </MenuList>
          </Menu>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;