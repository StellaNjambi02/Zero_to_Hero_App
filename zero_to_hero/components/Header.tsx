// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Button } from "./ui/button";
// import { useMediaQuery } from "react-responsive";

// import {
//   Menu,
//   Coins,
//   Leaf,
//   Search,
//   User,
//   Bell,
//   ChevronDown,
//   LogIn,
//   LogOut,
// } from "lucide-react";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "./ui/dropdown-menu";
// import { Badge } from "./ui/badge";
// import { Web3Auth } from "@web3auth/modal";
// import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
// import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
// import {
//   createUser,
//   getUnreadNotifications,
//   markNotificationAsRead,
//   getUserByEmail,
//   getUserBalance,
// } from "@/utils/db/actions";
// const clientId = process.env.WEB3_AUTH_CLIENT_ID;

// const chainConfig = {
//   chainNamespace: CHAIN_NAMESPACES.EIP155,
//   chainId: "0xaa36a7",
//   rpcTarget: "https://rpc.ankr.com/eth_sepolia",
//   displayName: " Sepolia Testnet",
//   blockExplorerUrl: "https://sepolia.etherscan.io",
//   ticker: "ETH",
//   tickerName: "Ethereum",
//   logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
// };

// const privateKeyProvider = new EthereumPrivateKeyProvider({
//   config: { chainConfig },
// });

// const Web3AuthProvider = new Web3Auth({
//   clientId,
//   web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET, // Changed from SAPPHIRE_MAINNET to TESTNET
//   privateKeyProvider,
// });

// interface headerProps {
//   onMenuClick: () => void;
//   totalEarnings: number;
// }

// export default function Header({ onMenuClick, totalEarnings }: headerProps) {
//   const [provider, setProvider] = useState<IProvider | null>(null);
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   // const [userInfo, setUserInfo] = useState<any>(null);
//   const [userInfo, setUserInfo] = useState({
//     name: "John Doe",
//     email: "johndoe@example.com",
//     role: "Admin",
//   });
//   const pathname = usePathname();
//   const [notification, setNotification] = useState<Notification[]>([]);
//   const isMobile = useMediaQuery("(max-width: 768px)");
//   const [balance, setBalance] = useState(0);
//   const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         await Web3Auth.initModal();
//         setProvider(Web3Auth.provider);

//         if (Web3Auth.connected) {
//           setLoggedIn(true);
//           const user = await web3Auth.getUserInfo();
//           setUserInfo(user);

//           if (user.email) {
//             localStorage.setItem("userEmail", user.email);
//             try {
//               await createUser(user.email, user.name || "Anonymous user");
//             } catch (error) {
//               console.error("Error creating user:", error);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error initializing web3Auth:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, []);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       if (userInfo && userInfo.email) {
//         console.log("User Info:", userInfo);
//         const user = await getUserByEmail(userInfo.email);
//         if (user) {
//           const unreadNotifications = await getUnreadNotifications(user.id);
//           setNotification(unreadNotifications);
//         }
//       }
//     };
//     fetchNotifications();
//     const notificationInterval = setInterval(fetchNotifications, 30000);
//     return () => clearInterval(notificationInterval);
//   }, [userInfo]);
// }

// useEffect(() => {
//   const fetchUserBalance = async () => {
//     if (userInfo && userInfo.email) {
//       const user = await getUserByEmail(userInfo.email);
//       if (user) {
//         const userBalance = await getUserBalance(user.id);
//         setBalance(userBalance);
//       }
//     }
//   };

//   fetchUserBalance();

//   // Add an event listener for balance updates
//   const handleBalanceUpdate = (event: CustomEvent) => {
//     setBalance(event.detail);
//   };

//   window.addEventListener(
//     "balanceUpdated",
//     handleBalanceUpdate as EventListener
//   );

//   return () => {
//     window.removeEventListener(
//       "balanceUpdated",
//       handleBalanceUpdate as EventListener
//     );
//   };
// }, [userInfo]);

// const login = async () => {
//   if (!web3auth) {
//     console.log("web3auth not initialized yet");
//     return;
//   }
//   try {
//     const web3authProvider = await web3auth.connect();
//     setProvider(web3authProvider);
//     setLoggedIn(true);
//     const user = await web3auth.getUserInfo();
//     setUserInfo(user);
//     if (user.email) {
//       localStorage.setItem("userEmail", user.email);
//       try {
//         await createUser(user.email, user.name || "Anonymous User");
//       } catch (error) {
//         console.error("Error creating user:", error);
//         // Handle the error appropriately, maybe show a message to the user
//       }
//     }
//   } catch (error) {
//     console.error("Error during login:", error);
//   }
// };

// const logout = async () => {
//   if (!web3auth) {
//     console.log("web3auth not initialized yet");
//     return;
//   }
//   try {
//     await web3auth.logout();
//     setProvider(null);
//     setLoggedIn(false);
//     setUserInfo(null);
//     localStorage.removeItem("userEmail");
//   } catch (error) {
//     console.error("Error during logout:", error);
//   }
// };

// const getUserInfo = async () => {
//   if (web3auth.connected) {
//     const user = await web3auth.getUserInfo();
//     setUserInfo(user);
//     if (user.email) {
//       localStorage.setItem("userEmail", user.email);
//       try {
//         await createUser(user.email, user.name || "Anonymous User");
//       } catch (error) {
//         console.error("Error creating user:", error);
//         // Handle the error appropriately, maybe show a message to the user
//       }
//     }
//   }
// };

// const handleNotificationClick = async (notificationId: number) => {
//   await markNotificationAsRead(notificationId);

//   if (loading) {
//     return <div> Loading web3 auth ... </div>;
//   }
//   // setNotifications(prevNotifications =>
//   //   prevNotifications.filter(notification => notification.id !== notificationId)
//   // );

//   return (
//     <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
//       <div className="flex items-center justify-between px-4 py-2">
//         <div className="flex items-center">
//           <Button
//             variant="ghost"
//             size="icon"
//             className="mr-2 md:mr-4"
//             onClick={onMenuClick}
//           >
//             <Menu className="h-6 w-6" />
//           </Button>
//           <Link href="/" className="flex items-center">
//             <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
//             <div className="flex flex-col">
//               <span className="font-bold text-base md:text-lg text-gray-800">
//                 Zero2Hero
//               </span>
//               <span className="text-[8px] md:text-[10px] text-gray-500 -mt-1">
//                 ETHOnline24
//               </span>
//             </div>
//           </Link>
//         </div>
//         {!isMobile && (
//           <div className="flex-1 max-w-xl mx-4">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//               <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             </div>
//           </div>
//         )}
//         <div className="flex items-center">
//           {isMobile && (
//             <Button variant="ghost" size="icon" className="mr-2">
//               <Search className="h-5 w-5" />
//             </Button>
//           )}
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="icon" className="mr-2 relative">
//                 <Bell className="h-5 w-5" />
//                 {notifications.length > 0 && (
//                   <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
//                     {notifications.length}
//                   </Badge>
//                 )}
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-64">
//               {notifications.length > 0 ? (
//                 notifications.map((notification) => (
//                   <DropdownMenuItem
//                     key={notification.id}
//                     onClick={() => handleNotificationClick(notification.id)}
//                   >
//                     <div className="flex flex-col">
//                       <span className="font-medium">{notification.type}</span>
//                       <span className="text-sm text-gray-500">
//                         {notification.message}
//                       </span>
//                     </div>
//                   </DropdownMenuItem>
//                 ))
//               ) : (
//                 <DropdownMenuItem>No new notifications</DropdownMenuItem>
//               )}
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
//             <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
//             <span className="font-semibold text-sm md:text-base text-gray-800">
//               {balance.toFixed(2)}
//             </span>
//           </div>
//           {!loggedIn ? (
//             <Button
//               onClick={login}
//               className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
//             >
//               Login
//               <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
//             </Button>
//           ) : (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="flex items-center"
//                 >
//                   <User className="h-5 w-5 mr-1" />
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={getUserInfo}>
//                   {userInfo ? userInfo.name : "Fetch User Info"}
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>
//                   <Link href="/settings">Profile</Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem>Settings</DropdownMenuItem>
//                 <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

//@ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { useMediaQuery } from "../hooks/useMediaQuery";

import {
  Menu,
  Coins,
  Leaf,
  Search,
  User,
  Bell,
  ChevronDown,
  LogIn,
  LogOut,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
  createUser,
  getUnreadNotifications,
  markNotificationAsRead,
  getUserByEmail,
  getUserBalance,
} from "@/utils/db/actions";

const clientId = process.env.WEB3_AUTH_CLIENT_ID;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings: number;
}

export default function Header({ onMenuClick, totalEarnings }: HeaderProps) {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [notification, setNotification] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const pathname = usePathname();
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3AuthInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
          privateKeyProvider,
        });

        await web3AuthInstance.initModal();
        setWeb3auth(web3AuthInstance);

        if (web3AuthInstance.connected) {
          console.log("Web3Auth already connected");
          setLoggedIn(true);
          const user = await web3AuthInstance.getUserInfo();
          setUserInfo(user);

          if (user.email) {
            localStorage.setItem("userEmail", user.email);
            try {
              await createUser(user.email, user.name || "Anonymous user");
            } catch (error) {
              console.error("Error creating user:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initWeb3Auth();
  }, []);

  useEffect(() => {
    if (!userInfo?.email) return;

    const fetchNotifications = async () => {
      try {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const unreadNotifications = await getUnreadNotifications(user.id);
          setNotification(unreadNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo?.email) return;

    const fetchUserBalance = async () => {
      try {
        const user = await getUserByEmail(userInfo.email);
        if (user) {
          const userBalance = await getUserBalance(user.id);
          setBalance(userBalance);
        }
      } catch (error) {
        console.error("Error fetching user balance:", error);
      }
    };

    fetchUserBalance();

    const handleBalanceUpdate = (event: CustomEvent) => {
      setBalance(event.detail);
    };

    window.addEventListener(
      "balanceUpdated",
      handleBalanceUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "balanceUpdated",
        handleBalanceUpdate as EventListener
      );
    };
  }, [userInfo]);

  const login = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    try {
      console.log("Opening Web3Auth login modal...");
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      setLoggedIn(true);
      const user = await web3auth.getUserInfo();
      setUserInfo(user);
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
        await createUser(user.email, user.name || "Anonymous User");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    try {
      await web3auth.logout();
      setProvider(null);
      setLoggedIn(false);
      setUserInfo(null);
      localStorage.removeItem("userEmail");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:mr-4"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-green-500 mr-1 md:mr-2" />
            <span className="font-bold text-base md:text-lg text-gray-800">
              Zero2Hero
            </span>
          </Link>
        </div>
        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2">
              <Search className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 relative">
                <Bell className="h-5 w-5 text-gray-800" />
                {notification.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.2rem] h-5">
                    {notification.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notification.length > 0 ? (
                notification.map((notification: any) => (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{notification.type}</span>
                      <span className="text-sm text-gray-500">
                        {notification.message}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="mr-2 md:mr-4 flex items-center bg-gray-100 rounded-full px-2 md:px-3 py-1">
            <Coins className="h-4 w-4 md:h-5 md:w-5 mr-1 text-green-500" />
            <span className="font-semibold text-sm md:text-base text-gray-800">
              {balance.toFixed(2)}
            </span>
          </div>
          {!loggedIn ? (
            <Button
              onClick={login}
              className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base"
            >
              Login
              <LogIn className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center"
                >
                  <User className="h-5 w-5 mr-1" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={getUserInfo}>
                  {userInfo ? userInfo.name : "Profile"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {/* <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2">
            <Bell className="h-5 w-5" />
            {notification.length > 0 && (
              <Badge className="absolute -top-1 -right-1">
                {notification.length}
              </Badge>
            )}
          </Button>
          <Button
            onClick={loggedIn ? logout : login}
            className="bg-green-600 text-white"
          >
            {loggedIn ? "Logout" : "Login"}
          </Button>
        </div> */}
        </div>
      </div>
    </header>
  );
}
