"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  Globe,
  Terminal,
  Download,
  ExternalLink,
  Copy,
  Check,
  Nfc,
} from "lucide-react";
import { useState } from "react";

// Configuration - Update these values
const CONFIG = {
  appName: "TapMove",
  tagline: "NFC Tap-to-Pay on Movement Network",
  description:
    "Tap your phone to pay merchants instantly in USDC. Sub-second settlements powered by Movement blockchain.",
  apkUrl: "", // Add APK download URL after EAS build
  appetizeUrl: "", // Add Appetize embed URL after upload
  githubRepo: "https://github.com/user/tapmove", // Update with actual repo
  features: ["NFC Payments", "Instant Settlement", "USDC Stable", "Movement Powered"],
};

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Nfc className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">{CONFIG.appName}</h1>
          </div>
          <p className="mb-4 text-xl text-zinc-400">{CONFIG.tagline}</p>
          <p className="mx-auto max-w-2xl text-zinc-500">{CONFIG.description}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {CONFIG.features.map((feature) => (
              <Badge
                key={feature}
                variant="secondary"
                className="bg-zinc-800 text-zinc-300"
              >
                {feature}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="install" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3 bg-zinc-800/50">
            <TabsTrigger
              value="install"
              className="data-[state=active]:bg-cyan-600"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Install APK
            </TabsTrigger>
            <TabsTrigger
              value="browser"
              className="data-[state=active]:bg-cyan-600"
            >
              <Globe className="mr-2 h-4 w-4" />
              Try in Browser
            </TabsTrigger>
            <TabsTrigger
              value="build"
              className="data-[state=active]:bg-cyan-600"
            >
              <Terminal className="mr-2 h-4 w-4" />
              Build Locally
            </TabsTrigger>
          </TabsList>

          {/* Install APK Tab */}
          <TabsContent value="install">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Install on Android Device
                </CardTitle>
                <CardDescription>
                  Scan the QR code or click the button to download the APK
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                {CONFIG.apkUrl ? (
                  <>
                    <div className="rounded-xl bg-white p-4">
                      <QRCodeSVG value={CONFIG.apkUrl} size={200} />
                    </div>
                    <p className="text-sm text-zinc-500">
                      Scan with your Android device camera
                    </p>
                    <Button
                      className="bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => window.open(CONFIG.apkUrl, "_blank")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download APK
                    </Button>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                      <Smartphone className="h-8 w-8 text-zinc-500" />
                    </div>
                    <p className="text-lg font-medium text-zinc-400">
                      APK Coming Soon
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Build is being prepared. Check back shortly!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browser Demo Tab */}
          <TabsContent value="browser">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">Try in Browser</CardTitle>
                <CardDescription>
                  Run the app directly in your browser via Appetize.io
                </CardDescription>
              </CardHeader>
              <CardContent>
                {CONFIG.appetizeUrl ? (
                  <div className="overflow-hidden rounded-xl">
                    <iframe
                      src={CONFIG.appetizeUrl}
                      width="100%"
                      height="800"
                      frameBorder="0"
                      scrolling="no"
                      className="mx-auto"
                    />
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                      <Globe className="h-8 w-8 text-zinc-500" />
                    </div>
                    <p className="text-lg font-medium text-zinc-400">
                      Browser Demo Coming Soon
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Appetize.io integration is being set up.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={() =>
                        window.open("https://appetize.io", "_blank")
                      }
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Learn about Appetize.io
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Build Locally Tab */}
          <TabsContent value="build">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-white">Build Locally</CardTitle>
                <CardDescription>
                  Clone the repo and run the app on your machine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-medium text-zinc-400">
                    Prerequisites
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-zinc-500">
                    <li>Node.js 18+ installed</li>
                    <li>Expo CLI installed globally</li>
                    <li>Android Studio or Xcode (for simulators)</li>
                    <li>Physical device with NFC (for full features)</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-zinc-400">
                    Quick Start
                  </h3>

                  {[
                    { label: "Clone the repository", cmd: `git clone ${CONFIG.githubRepo}` },
                    { label: "Navigate to mobile app", cmd: "cd tapmove/mobile" },
                    { label: "Install dependencies", cmd: "npm install" },
                    { label: "Start the app", cmd: "npx expo start" },
                  ].map((step, i) => (
                    <div key={i} className="rounded-lg bg-zinc-800/50 p-3">
                      <p className="mb-1 text-xs text-zinc-500">
                        {i + 1}. {step.label}
                      </p>
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-cyan-400">
                          {step.cmd}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
                          onClick={() => copyCommand(step.cmd)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-zinc-800 hover:bg-zinc-700"
                  onClick={() => window.open(CONFIG.githubRepo, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-zinc-600">
          <p>Built for Movement M1 Hackathon</p>
        </div>
      </div>
    </div>
  );
}
