"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/buttons/back_button";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setField } from "@/redux/features/createClientSlice";
import axios from "axios";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  Check,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const COUNTRIES = [
  {
    code: 'IN',
    name: 'India',
    phoneCode: '+91',
    regex: /^[6-9]\d{9}$/
  },
  {
    code: 'US',
    name: 'United States',
    phoneCode: '+1',
    regex: /^[2-9]\d{9}$/
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    phoneCode: '+44',
    regex: /^\d{10}$/
  },
  {
    code: 'CA',
    name: 'Canada',
    phoneCode: '+1',
    regex: /^[2-9]\d{9}$/
  },
];

const EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com'
];

const ClientSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),

  email: z.string()
    .email({ message: "Invalid email address" })
    .max(100, { message: "Email cannot exceed 100 characters" })
    .refine((email) => {
      const validDomains = EMAIL_DOMAINS;
      const [, domain] = email.split('@');

      return validDomains.includes(domain.toLowerCase());
    }, {
      message: "Please use a valid email domain (e.g., gmail.com, yahoo.com)"
    }),

  phone: z.object({
    countryCode: z.string(),
    number: z.string()
  }).refine((data) => {
    const country = COUNTRIES.find(c => c.code === data.countryCode);
    return country ? country.regex.test(data.number) : false;
  }, { message: "Invalid phone number" }),
});

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function CreateClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { name, emailUsername, domain, phone } = useAppSelector((state) => state.create_client);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  
  useEffect(() => {
    dispatch(setField({ field: "name", value: "" }));
    dispatch(setField({ field: "emailUsername", value: "" }));
    dispatch(setField({ field: "domain", value: EMAIL_DOMAINS[0] }))
    dispatch(setField({ field: "phone", value: "" }));
    setSelectedCountry(COUNTRIES[0]);
    setValidationError(null);
  }, [dispatch]);

  const handleCountryChange = (value: string) => {
    const country = COUNTRIES.find(c => c.code === value);
    if (country) {
      setSelectedCountry(country);
    }
  };

  const handleEmailUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    dispatch(setField({ field: "emailUsername", value: username }));
    setValidationError(null);
  };

  const handleEmailDomainChange = (value: string) => {
    dispatch(setField({ field: "domain", value }));
    setValidationError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setField({ field: e.target.name, value: e.target.value }));
    setValidationError(null);
  };

  const handleCloseAlert = () => {
    setAlertOpen(false);
    if (alertType === "success") {
      router.push("/");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      ClientSchema.parse({
        name,
        email: emailUsername + '@' + domain,
        phone: {
          countryCode: selectedCountry.code,
          number: phone
        }
      });

      await axios.post(
        `${baseUrl}/clients/add_new_client`,
        { name, email: emailUsername + '@' + domain, phone, phoneCode: selectedCountry.phoneCode, countryCode: selectedCountry.code },
      );

      setAlertType("success");
      setAlertMessage("Added the client successfully!");
      setAlertOpen(true);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
        setAlertType("error");
        setAlertMessage(error.errors[0].message);
      } else {
        setAlertType("error");
        setAlertMessage("Failed to add the client! Error: " + error.response?.data?.message);
      }
      setAlertOpen(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header title="CREATE CLIENT">
        <div className="w-8" />
      </Header>

      <BackButton />

      <main className="flex-1 flex justify-center items-center py-10">
        <Card className="w-[560px] shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Client</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  className={validationError && validationError.includes('Name') ? 'border-destructive ring-destructive/25' : ''}
                  placeholder="Enter client's full name"
                  required
                />
              </div>

              {/* Email Field - Modified to have username input and domain select */}
              <div className="space-y-2">
                <Label htmlFor="emailUsername" className="text-sm font-medium flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center">
                  <Input
                    type="text"
                    id="emailUsername"
                    value={emailUsername}
                    onChange={handleEmailUsernameChange}
                    className={`flex-1 rounded-r-none ${validationError && validationError.includes('email') ? 'border-destructive ring-destructive/25' : ''}`}
                    placeholder="username"
                    required
                  />
                  <span className="px-2 h-9 flex items-center justify-center border border-l-0 border-r-0">@</span>
                  <Select
                    value={domain}
                    onValueChange={handleEmailDomainChange}
                  >
                    <SelectTrigger className="w-[160px] rounded-l-none">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_DOMAINS.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedCountry.code}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.phoneCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={handleChange}
                    className={`flex-1 ${validationError && validationError.includes('phone') ? 'border-destructive ring-destructive/25' : ''}`}
                    placeholder="Enter phone number"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
              <Button
                type="submit"
                className="w-full h-11 gap-2 bg-gradient-to-r from-[#0d0d0d] to-[#151515] hover:opacity-90 cursor-pointer"
              >
                <Check className="h-4 w-4" /> Create Client
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>

      <Footer />

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {alertType === "success" ?
                <><Check className="h-5 w-5 text-green-500" /> Success</> :
                <><AlertCircle className="h-5 w-5 text-destructive" /> Error</>
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseAlert}>
              {alertType === "success" ? "Continue" : "Try Again"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}