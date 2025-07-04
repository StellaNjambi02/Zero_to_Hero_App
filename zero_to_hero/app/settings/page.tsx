"use client";
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserByEmail } from "@/utils/db/actions";
import { toast } from "react-hot-toast";

type UserSettings = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notifications: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notifications: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user email from localStorage (set during signup/login)
        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
          // Fetch user data from database
          const user = await getUserByEmail(userEmail);
          if (user) {
            setSettings((prev) => ({
              ...prev,
              name: user.name || "",
              email: user.email || "",
            }));
          }
        }

        // Load any saved settings from localStorage
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Merge with user data, but don't override name/email from database
          setSettings((prev) => ({
            ...parsedSettings,
            name: prev.name || parsedSettings.name,
            email: prev.email || parsedSettings.email,
          }));
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("userSettings", JSON.stringify(settings));
    console.log("Updated settings:", settings);
    // alert("Settings updated successfully!");
    toast.success("Settings updated successfully!");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Account Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={settings.name}
              placeholder="Enter your full name"
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={settings.email}
              placeholder="you@example.com"
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              readOnly // Email should typically not be editable
            />
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={settings.phone}
              placeholder="+254 712 345678"
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <Phone
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <div className="relative">
            <input
              type="text"
              id="address"
              name="address"
              value={settings.address}
              placeholder="123 Eco Street, Nairobi"
              onChange={handleInputChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="notifications"
            name="notifications"
            checked={settings.notifications}
            onChange={handleInputChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label
            htmlFor="notifications"
            className="ml-2 block text-sm text-gray-700"
          >
            Receive email notifications
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </form>
    </div>
  );
}
